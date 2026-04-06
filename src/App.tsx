import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeneratePaper from './pages/GeneratePaper';
import PreviewPaper from './pages/PreviewPaper';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
//page structure and routing logic, with authentication checks to ensure users are directed appropriately based on their login status.
  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/generate" element={user ? <GeneratePaper user={user} /> : <Navigate to="/login" />} />
          <Route path="/preview/:id" element={user ? <PreviewPaper user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
