
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FileText, LogOut, LayoutDashboard, PlusCircle, Menu, X, Home, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 py-4 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                  Paper<span className="text-brand-purple">Gen.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
              <NavLink to="/">Home</NavLink>
              {user && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/generate">Generate</NavLink>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-3">
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                    <Link to="/dashboard" className="btn-dark !px-6 !py-2.5 !text-sm">
                      My Account
                    </Link>
                  </div>
                  
                  {/* Mobile Menu Toggle */}
                  <button 
                    onClick={toggleMenu}
                    className="md:hidden p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-dark !px-6 !py-2.5 !text-sm">
                    Get Started
                  </Link>
                  {/* Mobile Menu Toggle (Logged Out) */}
                  <button 
                    onClick={toggleMenu}
                    className="md:hidden p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:text-brand-purple transition-colors"
                  >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col border-l border-gray-100"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight font-display">
                  Menu
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-2 overflow-y-auto bg-white">
                <MobileNavLink to="/" icon={<Home className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                  Home
                </MobileNavLink>
                
                {user ? (
                  <>
                    <MobileNavLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink to="/generate" icon={<PlusCircle className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                      Generate Paper
                    </MobileNavLink>
                    
                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="pt-6">
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full btn-gradient flex items-center justify-center py-4 rounded-2xl font-bold"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-6 py-2 rounded-full text-sm font-semibold text-gray-600 hover:text-brand-purple hover:bg-white transition-all"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, icon, children, onClick }: { to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-gray-600 font-bold hover:bg-brand-purple/5 hover:text-brand-purple transition-all"
    >
      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-brand-purple/10 transition-colors">
        {icon}
      </div>
      <span>{children}</span>
    </Link>
  );
}
