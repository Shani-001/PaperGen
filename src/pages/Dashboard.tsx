import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { QuestionPaper } from '../types';
import { FileText, Plus, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'questionPapers'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const papersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionPaper[];
      setPapers(papersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching papers:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question paper?')) {
      try {
        await deleteDoc(doc(db, 'questionPapers', id));
      } catch (error) {
        console.error('Error deleting paper:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-display">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">You have generated <span className="text-brand-purple font-bold">{papers.length}</span> question papers so far.</p>
        </div>
        <Link to="/generate" className="btn-gradient flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Generate New Paper
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
        </div>
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="soft-card overflow-hidden group"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-brand-purple/10 p-3 rounded-2xl">
                    <FileText className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span>{paper.difficulty}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-display group-hover:text-brand-purple transition-colors line-clamp-1">{paper.title}</h3>
                <div className="flex items-center text-sm text-gray-400 mb-8">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(paper.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8">
                  <div className="text-center flex-1 border-r border-gray-200">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Marks</div>
                    <div className="text-lg font-bold text-gray-900">{paper.totalMarks}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Items</div>
                    <div className="text-lg font-bold text-gray-900">{paper.numQuestions}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to={`/preview/${paper.id}`}
                    className="flex-1 btn-dark !px-4 !py-2.5 !text-xs flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Paper
                  </Link>
                  <button
                    onClick={() => paper.id && handleDelete(paper.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="soft-card p-20 text-center border-2 border-dashed border-gray-200 bg-transparent shadow-none">
          <div className="bg-brand-purple/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <FileText className="h-10 w-10 text-brand-purple" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">No question papers yet</h3>
          <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Your generated papers will appear here. Start by creating your first AI-powered examination.
          </p>
          <Link to="/generate" className="btn-gradient inline-flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Create First Paper
          </Link>
        </div>
      )}
    </div>
  );
}
