"use client";

import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Footer } from '@/components/layout/Footer';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { CampusProvider } from '@/context/CampusContext';
import { CampusSelectorModal } from '@/components/shared/CampusSelectorModal';
import { WhatsAppFloatingButton } from '@/components/shared/WhatsAppFloatingButton';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { InstallPrompt } from '@/components/shared/InstallPrompt';

interface SiteLayoutProps {
  title?: string;
  children: ReactNode;
  hideChrome?: boolean;
}

export function SiteLayout({ title, children, hideChrome = false }: SiteLayoutProps) {
  return (
    <CampusProvider>
      <div className="min-h-screen flex flex-col bg-background with-tabbar md:pb-0">
        {!hideChrome && <Navbar />}
        {!hideChrome && <MobileHeader title={title} />}
        <CampusSelectorModal />
        <div className="flex-1 flex flex-col">{children}</div>
        {!hideChrome && <Footer />}
        {!hideChrome && <BottomTabBar />}
        <WhatsAppFloatingButton />
        <CookieConsent />
        <InstallPrompt />
      </div>
    </CampusProvider>
  );
}
