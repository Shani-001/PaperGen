import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QuestionPaper } from '../types';
import { Download, FileText, ChevronLeft, Eye, EyeOff, Loader2, Clock, Brain, CheckCircle2, MessageSquare, Send, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { modifyQuestionPaper } from '../services/geminiService';

interface PreviewPaperProps {
  user: User;
}

export default function PreviewPaper({ user }: PreviewPaperProps) {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [paperScale, setPaperScale] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const paperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 800; // Fixed width for paper format
        if (containerWidth < targetWidth) {
          setPaperScale(containerWidth / targetWidth);
        } else {
          setPaperScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    // Initial delay to ensure layout is ready
    const timer = setTimeout(updateScale, 500);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [paper, showChat]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'questionPapers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as QuestionPaper;
          if (data.userId !== user.uid) {
            setError('You do not have permission to view this paper.');
          } else {
            setPaper({ id: docSnap.id, ...data });
          }
        } else {
          setError('Question paper not found.');
        }
      } catch (err) {
        console.error('Error fetching paper:', err);
        setError('Failed to load question paper.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id, user.uid]);

  const handleDownloadPDF = async () => {
    if (!paperRef.current || !paper) return;
    setExporting(true);
    
    try {
      // Temporarily disable scaling for clean capture
      const originalScale = paperScale;
      setPaperScale(1);
      
      // Wait for the DOM to update and ensure images are loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = paperRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // Force the body width to match the paper width for accurate capture
          clonedDoc.body.style.width = '800px';
          clonedDoc.body.style.overflow = 'visible';
          
          const clonedPaper = clonedDoc.getElementById('paper-content-inner');
          if (clonedPaper) {
            clonedPaper.style.width = '800px';
            clonedPaper.style.transform = 'none';
            clonedPaper.style.margin = '0';
            clonedPaper.style.boxShadow = 'none';
            clonedPaper.style.position = 'relative';
            clonedPaper.style.left = '0';
            clonedPaper.style.top = '0';
          }
          
          // Aggressively replace oklch/oklab in all style tags to prevent html2canvas parsing errors
          const styleTags = Array.from(clonedDoc.getElementsByTagName('style'));
          styleTags.forEach(tag => {
            if (tag.innerHTML.includes('oklch') || tag.innerHTML.includes('oklab')) {
              tag.innerHTML = tag.innerHTML
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/oklab\([^)]+\)/g, '#000000');
            }
          });

          // Also check inline styles
          const allElements = Array.from(clonedDoc.getElementsByTagName('*')) as HTMLElement[];
          allElements.forEach(el => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
              el.setAttribute('style', styleAttr
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/oklab\([^)]+\)/g, '#000000'));
            }
          });
          
          // Force standard colors to avoid oklch/oklab issues during capture
          // Tailwind v4 uses oklch/oklab by default which html2canvas doesn't support
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            :root {
              --color-white: #ffffff !important;
              --color-black: #000000 !important;
              --color-gray-50: #f9fafb !important;
              --color-gray-100: #f3f4f6 !important;
              --color-gray-200: #e5e7eb !important;
              --color-gray-300: #d1d5db !important;
              --color-gray-400: #9ca3af !important;
              --color-gray-500: #6b7280 !important;
              --color-gray-600: #4b5563 !important;
              --color-gray-700: #374151 !important;
              --color-gray-800: #1f2937 !important;
              --color-gray-900: #111827 !important;
            }
            * {
              border-color: #000000 !important;
              color: #000000 !important;
              fill: #000000 !important;
              stroke: #000000 !important;
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              --tw-ring-color: transparent !important;
              --tw-shadow: none !important;
              --tw-shadow-colored: none !important;
              --tw-outline-style: none !important;
              --tw-gradient-from: transparent !important;
              --tw-gradient-to: transparent !important;
              --tw-gradient-stops: none !important;
            }
            img {
              background-image: none !important;
            }
            .bg-white, [style*="background-color: #ffffff"], [style*="background-color: white"] {
              background-color: #ffffff !important;
            }
            .bg-gray-50, .bg-gray-100, [style*="background-color: #f3f4f6"], [style*="background-color: #f9fafb"] {
              background-color: #f3f4f6 !important;
            }
            /* Fix flex layout issues in html2canvas */
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .flex-1 { flex: 1 1 0% !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      // Restore scale
      setPaperScale(originalScale);
      
      const imgData = canvas.toDataURL('image/png');
      
      // @ts-ignore - jsPDF versioning can be tricky
      const pdf = new (jsPDF.default || jsPDF)('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10; 
      const footerSpace = 15;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeightPerPage = pageHeight - (2 * margin) - footerSpace;
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = contentWidth / imgWidth;
      const totalContentHeight = imgHeight * ratio;
      
      let heightLeft = totalContentHeight;
      let position = 0;
      let pageNumber = 1;

      while (heightLeft > 0) {
        if (pageNumber > 1) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', margin, margin - position, contentWidth, totalContentHeight);
        
        // Cover margins
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, 'F');
        pdf.rect(0, pageHeight - margin - footerSpace, pdfWidth, margin + footerSpace, 'F');
        
        pdf.setFont("serif", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(String(pageNumber), pdfWidth / 2, pageHeight - margin - 5, { align: 'center' });
        
        if (heightLeft > contentHeightPerPage) {
          pdf.setFont("serif", "bold");
          pdf.text('P.T.O', pdfWidth - margin, pageHeight - margin - 5, { align: 'right' });
        }
        
        heightLeft -= contentHeightPerPage;
        position += contentHeightPerPage;
        pageNumber++;
      }

      pdf.save(`${paper.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatMessage.trim() && !selectedImage) || !paper || chatLoading) return;

    const userPrompt = chatMessage;
    const currentImage = selectedImage;
    const currentImagePreview = imagePreview;
    
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      text: userPrompt || (currentImage ? "Uploaded an image" : "") 
    }]);
    
    setChatMessage('');
    clearImage();
    setChatLoading(true);

    try {
      let imagePayload;
      if (currentImage && currentImagePreview) {
        const base64Data = currentImagePreview.split(',')[1];
        imagePayload = {
          data: base64Data,
          mimeType: currentImage.type
        };
      }

      const modifiedPaper = await modifyQuestionPaper(paper, userPrompt, imagePayload);
      
      // Replace USER_IMAGE placeholder with actual base64 data
      if (currentImagePreview) {
        modifiedPaper.sections.forEach(section => {
          section.questions.forEach(q => {
            if (q.imageUrl === 'USER_IMAGE') {
              q.imageUrl = currentImagePreview;
            }
          });
        });
      }

      setPaper(modifiedPaper);
      
      if (id) {
        const docRef = doc(db, 'questionPapers', id);
        
        // Clean up any undefined values before saving to Firestore
        const paperToSave = { ...modifiedPaper } as any;
        Object.keys(paperToSave).forEach(key => {
          if (paperToSave[key] === undefined) {
            delete paperToSave[key];
          }
        });
        
        await updateDoc(docRef, paperToSave);
      }

      setChatHistory(prev => [...prev, { role: 'ai', text: 'I have updated the question paper based on your request and the image provided. You can see the changes in the preview.' }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error while trying to modify the paper. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const PCE_LOGO = "https://pce.ac.in/wp-content/uploads/2020/01/logo.png";

  const Template60 = ({ paper }: { paper: QuestionPaper }) => (
    <div className="p-12 font-serif" style={{ minHeight: '297mm', width: '800px', backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header Template 60 */}
      <div className="flex items-center justify-between p-4 mb-0" style={{ border: '2px solid #000000', color: '#000000', width: '100%' }}>
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center pr-4 mr-4" style={{ borderRight: '2px solid #000000' }}>
          <img 
            src={PCE_LOGO} 
            alt="PCE Logo" 
            className="h-20 w-auto object-contain"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
        <div className="flex-grow text-center px-4">
          <h2 className="text-2xl font-bold uppercase leading-tight tracking-tight" style={{ color: '#000000' }}>{paper.collegeName || "PILLAI COLLEGE OF ENGINEERING"}</h2>
          <p className="text-sm font-bold mt-1" style={{ color: '#000000' }}>(Autonomous) (Accredited 'A+' by NAAC)</p>
          <h3 className="text-lg font-bold uppercase mt-2" style={{ color: '#000000' }}>{paper.examType || "END SEMESTER EXAMINATION"}</h3>
          <h3 className="text-lg font-bold uppercase" style={{ color: '#000000' }}>{paper.monthYear || "MAY 2025"}</h3>
          <p className="text-sm font-bold uppercase mt-2" style={{ color: '#000000' }}>BRANCH: {paper.branch || "Computer Engineering"}</p>
        </div>
        <div className="w-32 flex-shrink-0 text-right">
          <p className="text-xs font-bold" style={{ color: '#000000' }}>QP CODE 243592</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="grid grid-cols-2 text-sm font-bold" style={{ borderLeft: '2px solid #000000', borderRight: '2px solid #000000', borderBottom: '2px solid #000000', color: '#000000' }}>
        <div className="p-2 uppercase" style={{ borderRight: '2px solid #000000' }}>{paper.semester || "SEM-VI"}</div>
        <div className="p-2 text-right">Time: {paper.timeDuration || "02.00 Hours"}</div>
        <div className="p-2" style={{ borderTop: '2px solid #000000', borderRight: '2px solid #000000' }}>Subject: - {paper.title}</div>
        <div className="p-2 text-right" style={{ borderTop: '2px solid #000000' }}>Date: {paper.examDate || "09/05/2025"}</div>
        <div className="p-2" style={{ borderTop: '2px solid #000000', borderRight: '2px solid #000000' }}>Max. Marks: {paper.totalMarks}</div>
        <div className="p-2 text-right" style={{ borderTop: '2px solid #000000' }}>Subject Code: - {paper.subjectCode || "CE 320"}</div>
      </div>

      {/* Instructions */}
      <div className="p-4 text-xs font-bold leading-relaxed" style={{ borderLeft: '2px solid #000000', borderRight: '2px solid #000000', borderBottom: '2px solid #000000', color: '#000000' }}>
        <p>N.B 1. Q.1 is compulsory</p>
        <p className="ml-6">2. Attempt any two from the remaining three questions</p>
        <p className="ml-6">3. Each Question carries 20 marks.</p>
        <p className="ml-6">4. Assume suitable data wherever required</p>
      </div>

      {/* Questions Table */}
      <table className="w-full text-sm border-collapse" style={{ borderLeft: '2px solid #000000', borderRight: '2px solid #000000', borderBottom: '2px solid #000000', color: '#000000', tableLayout: 'fixed' }}>
        <thead>
          <tr className="font-bold" style={{ borderBottom: '2px solid #000000' }}>
            <td className="p-2 w-12 text-center" style={{ borderRight: '2px solid #000000' }}>Q.No.</td>
            <td className="p-2" style={{ borderRight: '2px solid #000000' }}>Attempt All</td>
            <td className="p-2 w-10 text-center" style={{ borderRight: '2px solid #000000' }}>M</td>
            <td className="p-2 w-10 text-center" style={{ borderRight: '2px solid #000000' }}>BT</td>
            <td className="p-2 w-10 text-center">CO</td>
          </tr>
        </thead>
        <tbody>
          {paper.sections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <tr className="font-bold" style={{ borderBottom: '2px solid #000000', backgroundColor: '#f3f4f6' }}>
                <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>{section.name}.</td>
                <td className="p-2" style={{ borderRight: '2px solid #000000' }}>{section.instructions || "Attempt All"}</td>
                <td className="p-2" style={{ borderRight: '2px solid #000000' }}></td>
                <td className="p-2" style={{ borderRight: '2px solid #000000' }}></td>
                <td className="p-2"></td>
              </tr>
              {section.questions.map((q, qIdx) => (
                <tr key={qIdx} style={{ borderBottom: '2px solid #000000' }}>
                  <td className="p-2 text-center font-bold" style={{ borderRight: '2px solid #000000' }}>{String.fromCharCode(97 + qIdx)})</td>
                  <td className="p-2 leading-relaxed" style={{ borderRight: '2px solid #000000' }}>
                    <div className="max-w-none" style={{ color: '#000000' }}>
                      <Markdown>{q.text}</Markdown>
                    </div>
                    {q.imageUrl && (
                      <div className="mt-4 mb-4 flex justify-center">
                        <img 
                          src={q.imageUrl} 
                          alt={`Diagram for question ${String.fromCharCode(97 + qIdx)}`}
                          className="max-h-64 object-contain border border-gray-200 rounded p-2"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 mt-2 ml-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-xs">
                            <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {showAnswers && (
                      <div className="mt-2 p-2 rounded text-xs" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', color: '#15803d' }}>
                        <span className="font-bold">Ans: </span>
                        <Markdown>{q.correctAnswer}</Markdown>
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-center font-bold" style={{ borderRight: '2px solid #000000' }}>{q.marks || 0}</td>
                  <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>{q.btLevel || q.bloomLevel?.charAt(0) || '1'}</td>
                  <td className="p-2 text-center">{q.coLevel || (qIdx % 6) + 1}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Footer Info */}
      <div className="mt-8 space-y-2 text-[10px] font-bold" style={{ color: '#000000' }}>
        {paper.courseOutcomes?.map((co, idx) => (
          <p key={idx}>{co}</p>
        ))}
        <p className="mt-4">BT Levels: - 1 Remembering, 2 Understanding, 3 Applying, 4 Analyzing, 5 Evaluating, 6 Creating.</p>
        <p>M-Marks, BT- Bloom's Taxonomy, CO-Course Outcomes.</p>
      </div>
    </div>
  );

  const Template40 = ({ paper }: { paper: QuestionPaper }) => (
    <div className="p-12 font-serif" style={{ minHeight: '297mm', width: '800px', backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header Template 40 */}
      <div className="mb-6" style={{ border: '2px solid #000000', padding: '16px', color: '#000000' }}>
        <div className="flex items-center justify-center gap-6 mb-4">
          <img 
            src={PCE_LOGO} 
            alt="PCE Logo" 
            className="h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase">{paper.collegeName || "MES's Pillai College of Engineering (Autonomous), New Panvel - 410206"}</h2>
            <h3 className="text-base font-bold uppercase mt-1">{paper.department || "Department of Computer Engineering"}</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold">
          <p>Course Name: {paper.title}</p>
          <p className="text-right">Academic Year: {paper.academicYear || "2024-25"}</p>
          <p>Faculty Name: {paper.facultyName || "Dr. Sharvari Govilkar, Prof. Dhiraj Amin"}</p>
          <p className="text-right">Class, Div & Sem: {paper.classDivSem || "TY A/B SEM VI"}</p>
        </div>
        <div className="flex justify-between mt-4 text-xs font-bold pt-2" style={{ borderTop: '2px solid #000000' }}>
          <p>{paper.classTest || "Class Test: II"}</p>
          <p>Duration: {paper.timeDuration || "1.5 Hours"}</p>
          <p>Date: {paper.examDate || "9/4/2025"}</p>
          <p>Max. Marks: {paper.totalMarks}</p>
        </div>
      </div>

      <p className="text-xs font-bold mb-4 italic" style={{ color: '#000000' }}>Note: Assume suitable data wherever necessary.</p>

      {/* Questions Table */}
      <table className="w-full text-sm border-collapse" style={{ border: '2px solid #000000', color: '#000000', tableLayout: 'fixed' }}>
        <thead>
          <tr className="font-bold" style={{ borderBottom: '2px solid #000000' }}>
            <td className="p-2 w-12 text-center" style={{ borderRight: '2px solid #000000' }}>Q. No</td>
            <td className="p-2" style={{ borderRight: '2px solid #000000' }}>Questions</td>
            <td className="p-2 w-16 text-center" style={{ borderRight: '2px solid #000000' }}>Marks</td>
            <td className="p-2 w-16 text-center" style={{ borderRight: '2px solid #000000' }}>BT Level</td>
            <td className="p-2 w-16 text-center">COs</td>
          </tr>
        </thead>
        <tbody>
          {paper.sections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <tr className="font-bold" style={{ borderBottom: '2px solid #000000', backgroundColor: '#f3f4f6' }}>
                <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>Q. {sIdx + 1}</td>
                <td className="p-2" style={{ borderRight: '2px solid #000000' }}>{section.instructions || "Attempt Any four out of Five"}</td>
                <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>Marks</td>
                <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>BT Level</td>
                <td className="p-2 text-center">COs</td>
              </tr>
              {section.questions.map((q, qIdx) => (
                <tr key={qIdx} style={{ borderBottom: '2px solid #000000' }}>
                  <td className="p-2 text-center font-bold" style={{ borderRight: '2px solid #000000' }}>({String.fromCharCode(97 + qIdx)})</td>
                  <td className="p-2 leading-relaxed" style={{ borderRight: '2px solid #000000' }}>
                    <div className="max-w-none" style={{ color: '#000000' }}>
                      <Markdown>{q.text}</Markdown>
                    </div>
                    {q.imageUrl && (
                      <div className="mt-4 mb-4 flex justify-center">
                        <img 
                          src={q.imageUrl} 
                          alt={`Diagram for question ${String.fromCharCode(97 + qIdx)}`}
                          className="max-h-64 object-contain border border-gray-200 rounded p-2"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                    {showAnswers && (
                      <div className="mt-2 p-2 rounded text-xs" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', color: '#15803d' }}>
                        <span className="font-bold">Ans: </span>
                        <Markdown>{q.correctAnswer}</Markdown>
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-center font-bold" style={{ borderRight: '2px solid #000000' }}>[ {(q.marks || 0).toString().padStart(2, '0')} ]</td>
                  <td className="p-2 text-center" style={{ borderRight: '2px solid #000000' }}>{q.btLevel || "L" + (q.bloomLevel === 'Remember' ? '1' : q.bloomLevel === 'Understand' ? '2' : q.bloomLevel === 'Apply' ? '3' : q.bloomLevel === 'Analyze' ? '4' : q.bloomLevel === 'Evaluate' ? '5' : '6')}</td>
                  <td className="p-2 text-center">CO{q.coLevel || (qIdx % 6) + 1}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">{error || 'Paper not found'}</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-dark">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-400 hover:text-brand-purple font-bold mb-4 transition-all group"
            >
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 font-display tracking-tight">{paper.title}</h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                showChat 
                  ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-brand-purple/30 hover:text-brand-purple'
              }`}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              AI Assistant
            </button>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className={`flex items-center px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                showAnswers 
                  ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-brand-purple/30 hover:text-brand-purple'
              }`}
            >
              {showAnswers ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={exporting}
              className="btn-gradient flex items-center disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              Download PDF
            </button>
          </div>
        </div>

        <div ref={containerRef} className="overflow-y-auto rounded-2xl bg-gray-100/50 p-4 md:p-8 max-h-[calc(100vh-120px)] min-h-[600px] flex justify-center border border-gray-200/50 shadow-inner custom-scrollbar">
          <div 
            style={{ 
              width: '800px',
              transform: `scale(${paperScale})`,
              transformOrigin: 'top center',
              height: 'auto',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: `${(1 - paperScale) * -800}px` // More stable compensation
            }}
          >
            <div ref={paperRef} id="paper-content-inner" className="shadow-2xl ring-1 ring-black/5 bg-white mb-20">
              {paper.totalMarks === 60 ? (
                <Template60 paper={paper} />
              ) : (
                <Template40 paper={paper} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-96 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden h-[calc(100vh-160px)] sticky top-24"
          >
            <div className="p-6 bg-gradient-to-r from-brand-purple to-brand-pink text-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-xl mr-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Paper Assistant</h3>
                  <p className="text-[10px] opacity-80">Modify your paper with AI</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center p-4 bg-brand-purple/10 rounded-full mb-4">
                    <Brain className="h-8 w-8 text-brand-purple" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">How can I help?</h4>
                  <p className="text-sm text-gray-500">
                    Try asking:
                    <br />
                    "Change total marks to 40"
                    <br />
                    "Make the questions harder"
                    <br />
                    "Add a new section for MCQs"
                  </p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-purple text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="h-4 w-4 text-brand-purple animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-100 bg-gray-50/50">
              <AnimatePresence>
                {imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 relative inline-block"
                  >
                    <img 
                      src={imagePreview} 
                      alt="Selected" 
                      className="h-20 w-20 object-cover rounded-xl border-2 border-brand-purple shadow-sm" 
                    />
                    <button 
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-xl border border-gray-200 transition-all ${
                    selectedImage ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' : 'bg-white text-gray-400 hover:text-brand-purple hover:border-brand-purple/30'
                  }`}
                  title="Upload image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={selectedImage ? "Describe what to do with the image..." : "Ask AI to change something..."}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={(!chatMessage.trim() && !selectedImage) || chatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-purple text-white rounded-lg disabled:opacity-50 hover:bg-brand-purple/90 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
