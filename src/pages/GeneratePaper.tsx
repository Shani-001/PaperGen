import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateQuestionPaper } from '../services/geminiService';
import { Difficulty, BloomLevel, QuestionType } from '../types';
import { Sparkles, Brain, FileText, ChevronRight, ChevronLeft, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GeneratePaperProps {
  user: User;
}

const BLOOM_LEVELS: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Descriptive', 'Case-based'];

export default function GeneratePaper({ user }: GeneratePaperProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    collegeName: '',
    examType: 'END SEMESTER EXAMINATION',
    monthYear: 'MAY 2025',
    branch: 'Computer Engineering',
    semester: 'SEM-VI',
    subjectCode: '',
    examDate: '',
    timeDuration: '02.00 Hours',
    academicYear: '2024-25',
    facultyName: '',
    classDivSem: 'TY A/B SEM VI',
    classTest: 'Class Test: II',
    department: 'Department of Computer Engineering',
    syllabus: '',
    difficulty: 'Medium' as Difficulty,
    bloomLevels: ['Remember', 'Understand', 'Apply'] as BloomLevel[],
    questionTypes: ['Descriptive'] as QuestionType[],
    totalMarks: 60,
    numQuestions: 10,
    sectionsConfig: [
      { name: 'Q.1', numQuestions: 4, marksPerQuestion: 5 },
      { name: 'Q.2', numQuestions: 2, marksPerQuestion: 10 },
    ]
  });

  const [syllabusFile, setSyllabusFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [referencePapers, setReferencePapers] = useState<{ data: string; mimeType: string }[]>([]);

  const MAX_TOTAL_SIZE_MB = 8; // 8MB limit to be safe with base64 overhead

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'syllabus' | 'reference') => {
    const files = e.target.files;
    if (!files) return;

    // Check total size
    let currentTotalSize = 0;
    if (syllabusFile) {
      // Approximate original size from base64 (3/4 ratio)
      currentTotalSize += (syllabusFile.data.length * 3) / 4;
    }
    referencePapers.forEach(p => {
      currentTotalSize += (p.data.length * 3) / 4;
    });

    const newFilesSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    
    if ((currentTotalSize + newFilesSize) > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
      setError(`Total file size exceeds ${MAX_TOTAL_SIZE_MB}MB. Please upload smaller files.`);
      return;
    }

    const readFiles = Array.from(files).map(file => {
      return new Promise<{ data: string; mimeType: string }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({ data: base64String, mimeType: file.type });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readFiles).then(results => {
      if (type === 'syllabus') {
        setSyllabusFile(results[0]);
      } else {
        setReferencePapers(prev => [...prev, ...results]);
      }
    });
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sectionsConfig: [...prev.sectionsConfig, { name: `Q.${prev.sectionsConfig.length + 1}`, numQuestions: 1, marksPerQuestion: 5 }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sectionsConfig: prev.sectionsConfig.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sectionsConfig: prev.sectionsConfig.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const toggleBloomLevel = (level: BloomLevel) => {
    setFormData(prev => ({
      ...prev,
      bloomLevels: prev.bloomLevels.includes(level)
        ? prev.bloomLevels.filter(l => l !== level)
        : [...prev.bloomLevels, level]
    }));
  };

  const toggleQuestionType = (type: QuestionType) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title || (!formData.syllabus && !syllabusFile)) {
      setError('Please provide a title and syllabus (text or file).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const paper = await generateQuestionPaper({
        ...formData,
        syllabusFile: syllabusFile || undefined,
        referencePapers: referencePapers.length > 0 ? referencePapers : undefined,
      });

      // Remove large file data and any undefined fields before saving to Firestore
      const { syllabusFile: _s, referencePapers: _r, ...paperToSave } = paper as any;
      
      // Clean up any remaining undefined values just in case
      Object.keys(paperToSave).forEach(key => {
        if (paperToSave[key] === undefined) {
          delete paperToSave[key];
        }
      });

      const docRef = await addDoc(collection(db, 'questionPapers'), {
        ...paperToSave,
        userId: user.uid,
      });
      navigate(`/preview/${docRef.id}`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError('Failed to generate question paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-brand-purple/10 rounded-3xl mb-6">
          <Sparkles className="h-8 w-8 text-brand-purple" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight font-display">Generate Paper</h1>
        <p className="text-gray-500 mt-4 text-lg">Configure your requirements and let AI do the heavy lifting.</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-2xl">
          {error}
        </div>
      )}

      <div className="soft-card overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-50 flex">
          <div 
            className="h-full bg-gradient-to-r from-brand-purple to-brand-pink transition-all duration-700 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="p-10 md:p-16">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Natural Language Processing"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">College Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Pillai College of Engineering"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Semester</label>
                    <input
                      type="text"
                      placeholder="e.g., SEM-VI"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g., CE 320"
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Branch</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Engineering"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Department</label>
                    <input
                      type="text"
                      placeholder="e.g., Department of Computer Engineering"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Faculty Name(s)</label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Sharvari Govilkar, Prof. Dhiraj Amin"
                      value={formData.facultyName}
                      onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Academic Year</label>
                    <input
                      type="text"
                      placeholder="e.g., 2024-25"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Class, Div & Sem</label>
                    <input
                      type="text"
                      placeholder="e.g., TY A/B SEM VI"
                      value={formData.classDivSem}
                      onChange={(e) => setFormData({ ...formData, classDivSem: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Class Test</label>
                    <input
                      type="text"
                      placeholder="e.g., Class Test: II"
                      value={formData.classTest}
                      onChange={(e) => setFormData({ ...formData, classTest: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.title}
                    className="btn-dark flex items-center group"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Syllabus File (PDF/Doc/Image)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'syllabus')}
                      className="hidden"
                      id="syllabus-upload"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <label 
                      htmlFor="syllabus-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50/50 hover:bg-white hover:border-brand-purple/50 transition-all"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-brand-purple transition-colors" />
                      <span className="text-sm font-bold text-gray-500 group-hover:text-brand-purple transition-colors">
                        {syllabusFile ? 'File Uploaded' : 'Upload Syllabus File'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Writing Syllabus (Optional)</label>
                  <textarea
                    rows={6}
                    placeholder="Paste your syllabus topics here if you don't have a file..."
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all resize-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Reference Papers (Last Year Papers)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(e, 'reference')}
                      className="hidden"
                      id="reference-upload"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <label 
                      htmlFor="reference-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50/50 hover:bg-white hover:border-brand-purple/50 transition-all"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-brand-purple transition-colors" />
                      <span className="text-sm font-bold text-gray-500 group-hover:text-brand-purple transition-colors">
                        {referencePapers.length > 0 ? `${referencePapers.length} Papers Uploaded` : 'Upload Reference Papers'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-400 px-8 py-4 rounded-full font-bold hover:text-brand-purple hover:bg-brand-purple/5 transition-all flex items-center"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.syllabus && !syllabusFile}
                    className="btn-dark flex items-center group"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Total Marks</label>
                    <input
                      type="number"
                      value={formData.totalMarks || ''}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Time Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 02.00 Hours"
                      value={formData.timeDuration}
                      onChange={(e) => setFormData({ ...formData, timeDuration: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Paper Sections (Q1, Q2, etc.)</label>
                    <button 
                      onClick={addSection}
                      className="text-brand-purple font-bold text-sm flex items-center hover:bg-brand-purple/5 px-3 py-1.5 rounded-full transition-all"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Section
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.sectionsConfig.map((section, index) => (
                      <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Name</label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(index, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-sm font-bold"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Questions</label>
                          <input
                            type="number"
                            value={section.numQuestions || ''}
                            onChange={(e) => updateSection(index, 'numQuestions', e.target.value === '' ? 0 : parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-sm font-bold"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Marks Each</label>
                          <input
                            type="number"
                            value={section.marksPerQuestion || ''}
                            onChange={(e) => updateSection(index, 'marksPerQuestion', e.target.value === '' ? 0 : parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-sm font-bold"
                          />
                        </div>
                        <button 
                          onClick={() => removeSection(index)}
                          className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-gray-400 px-8 py-4 rounded-full font-bold hover:text-brand-purple hover:bg-brand-purple/5 transition-all flex items-center"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="btn-dark flex items-center group"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setFormData({ ...formData, difficulty: level })}
                          className={`py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                            formData.difficulty === level
                              ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-brand-purple/30 hover:text-brand-purple'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Question Types</label>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleQuestionType(type)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border-2 ${
                            formData.questionTypes.includes(type)
                              ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-brand-purple/30 hover:text-brand-purple'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Bloom's Taxonomy Levels</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {BLOOM_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleBloomLevel(level)}
                        className={`flex items-center p-5 rounded-3xl border-2 transition-all ${
                          formData.bloomLevels.includes(level)
                            ? 'bg-brand-purple/5 border-brand-purple text-brand-purple'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-brand-purple/30 hover:text-brand-purple'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                          formData.bloomLevels.includes(level) ? 'border-brand-purple bg-brand-purple' : 'border-gray-200'
                        }`}>
                          {formData.bloomLevels.includes(level) && <div className="h-2 w-2 bg-white rounded-full"></div>}
                        </div>
                        <span className="font-bold">{level}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-purple/5 p-8 rounded-3xl border border-brand-purple/10">
                  <h4 className="font-bold text-brand-purple mb-3 flex items-center text-lg font-display">
                    <Brain className="h-6 w-6 mr-3" />
                    Ready to Generate
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Our AI will now analyze your syllabus and reference papers to generate a balanced question paper following your exact structure. This usually takes 20-40 seconds.
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="text-gray-400 px-8 py-4 rounded-full font-bold hover:text-brand-purple hover:bg-brand-purple/5 transition-all flex items-center"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-gradient flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-5 w-5" />
                        Generate Paper
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
