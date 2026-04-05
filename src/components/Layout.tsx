import { ReactNode } from 'react';
import Navbar from './Navbar';
import { User } from 'firebase/auth';
import { FileText } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
}

export default function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 font-display tracking-tight">
                AI Paper Gen
              </span>
            </div>
            <div className="text-gray-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} AI Question Paper Generator. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-brand-purple transition-colors">Privacy</a>
              <a href="#" className="hover:text-brand-purple transition-colors">Terms</a>
              <a href="#" className="hover:text-brand-purple transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
