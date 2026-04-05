import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FileText, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          createdAt: new Date().toISOString(),
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden">
      <div className="blob -top-20 -right-20 opacity-20"></div>
      <div className="blob -bottom-20 -left-20 opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 soft-card p-10 md:p-12 relative z-10"
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-brand-purple to-brand-pink w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 font-display">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-4 text-gray-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-purple font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded-r-xl">
            {error}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all font-medium"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-4 border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5 mr-3" alt="Google" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
