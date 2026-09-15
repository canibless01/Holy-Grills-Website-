import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Welcome to Holy Grills',
    body: "These Terms set out the rules for using the Holy Grills app — FUTA's only flame grill. By creating an account or placing an order, you agree to the terms below. If you don't agree, please don't use the app. Holy Grills is built for students and staff around FUTA, Akure, and is operated as a campus food service.",
  },
  {
    title: '2. Your account',
    body: "You must be at least 16 years old to create an account and place orders. Keep your login details safe — you are responsible for activity on your account. Tell us right away if you think anyone has used your account without permission. We may suspend accounts that break these Terms.",
  },
  {
    title: '3. Orders, pricing & delivery',
    body: "Prices are shown in Naira (₦) and include applicable taxes where required. We only deliver during open kitchen windows — check the Kitchen Radar before placing an order. Items are subject to availability; if something sells out we will not charge you for it, and we will ask you to remove it from your cart. Squad Orders require at least two items and unlock a 10% discount, with Holy Points split across the squad.",
  },
  {
    title: '4. Holy Points & rewards',
    body: "Holy Points (HP) are earned through orders, streaks, events, and challenges. Pending HP becomes Active after your order is delivered. HP has no cash value outside the app and cannot be transferred except where we explicitly allow it. We may adjust HP balances to correct errors or remove points earned through fraud.",
  },
  {
    title: '5. Wallet & payments',
    body: "You can fund your in-app wallet or pay with a card, and you can split a payment between wallet and card. Wallet funds are non-refundable except where required by law or where we cancel an order on our side. If an order is cancelled before the kitchen starts, any wallet portion is returned to your balance.",
  },
  {
    title: '6. Privacy — what we collect and why',
    body: "We collect the information you give us at sign-up (name, email, phone, date of birth, department, level) plus order and delivery information so we can prepare and deliver your food. We use device and usage data to keep the app secure, fix issues, and personalise your experience. We do not sell your data. Push, email, and in-app notifications can be toggled any time in Notification Preferences.",
  },
  {
    title: '7. How we protect your data',
    body: "We store your data securely and limit access to staff who need it to run the service. Payment instruments are handled by licensed payment partners — we do not store full card numbers on our servers.",
  },
  {
    title: '8. Your rights',
    body: "You can update or request deletion of your data at any time from Profile & Settings, or by emailing us. You can also log out of all devices, change your password, and permanently delete your account. We will honour valid deletion requests within a reasonable period, retaining only what we are legally required to keep.",
  },
  {
    title: '9. Conduct on the platform',
    body: "Don't abuse, harass, or mislead Holy Grills staff, riders, or other students. Don't try to game Holy Points, refer yourself, or place fraudulent orders. We may suspend accounts, void points, or refuse service where these rules are broken.",
  },
  {
    title: '10. Changes to these Terms',
    body: "We may update these Terms as the service grows. Material changes will be highlighted in-app and on the Terms page. Continuing to use Holy Grills after a change means you accept the updated Terms.",
  },
];

export default function TermsPrivacy() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-flame-50 text-flame-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">
          <Shield className="w-3.5 h-3.5" /> Your Trust
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-cocoa-800 mt-3">Terms & Privacy</h1>
        <p className="text-sm text-cocoa-500 mt-2 max-w-md mx-auto">
          Plain-English rules for using Holy Grills, plus how we handle your data. Last updated August 2026.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl bg-white border border-cocoa-100 p-5">
            <h3 className="font-heading font-bold text-base text-cocoa-800 mb-2">{s.title}</h3>
            <p className="text-sm text-cocoa-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      {/* Need help */}
      <div className="rounded-2xl bg-cocoa-800 p-6 text-center text-white">
        <Flame className="w-6 h-6 mx-auto mb-2 text-flame-400" />
        <h3 className="font-heading font-bold text-lg mb-1">Have a question about your data?</h3>
        <p className="text-sm text-cocoa-300 mb-4">Email us and we will get back to you.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <a href="mailto:holygrillfuta@gmail.com" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-semibold">Email us</a>
          <Link to="/faq" className="px-4 py-2 rounded-lg flame-gradient font-bold">Read the FAQs →</Link>
        </div>
      </div>
    </div>
  );
}