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
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 font-display tracking-tight">
                AI Paper Gen
              </span>
            </div>
            
            <div className="max-w-2xl">
              <p className="text-gray-500 text-sm leading-relaxed">
                This project was developed as part of learning at{' '}
                <a 
                  href="https://www.pce.ac.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-purple font-bold hover:underline"
                >
                  Pillai College of Engineering (PCE)
                </a>.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between w-full pt-8 border-t border-gray-50 gap-6">
              <div className="text-gray-400 text-xs font-medium">
                &copy; {new Date().getFullYear()} AI Question Paper Generator. All rights reserved.
              </div>
              <div className="flex space-x-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-brand-purple transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-purple transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-purple transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
