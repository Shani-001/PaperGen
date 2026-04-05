import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FileText, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white/70 backdrop-blur-lg sticky top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                Paper<span className="text-brand-purple">Gen.</span>
              </span>
            </Link>
          </div>

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
            ) : (
              <Link to="/login" className="btn-dark !px-6 !py-2.5 !text-sm">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
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
