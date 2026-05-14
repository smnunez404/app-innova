/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './lib/FirebaseContext';
import Home from './components/Home';
import LogSuccess from './components/LogSuccess';
import Ideas from './components/Ideas';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Toaster } from './components/ui/sonner';

function AppRoutes() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/log-success" element={<LogSuccess />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" />
      </BrowserRouter>
    </FirebaseProvider>
  );
}
