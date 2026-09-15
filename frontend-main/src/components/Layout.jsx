import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Footer from './Footer';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

export default function Layout() {
  return (
    <div className="min-h-screen bg-cocoa-50 flex flex-col">
      <TopNav />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-10 min-h-[calc(100vh-4rem)] flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFloatingButton />
    </div>
  );
}