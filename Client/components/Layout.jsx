import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../pages/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        {user && <Sidebar />}
        <main className="flex-grow-1 bg-light p-4 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
