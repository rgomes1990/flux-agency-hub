
import React from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Sidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <Header />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
