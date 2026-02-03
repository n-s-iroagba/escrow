'use client';

import Link from "next/link";
import {
  ShieldCheck,

  FileText,
  Lock,
  RefreshCcw,

  Gavel,
  BadgeCheck,
  Menu,
  X
} from "lucide-react";
import { APP_NAME } from "@/constants/data";
import { MiniChart, TickerTape } from "react-ts-tradingview-widgets";

import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white font-display text-gray-900">
      {/* Navigation */}
      <nav className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13ec5b] rounded text-xs flex items-center justify-center font-bold text-[#0d1b12]">X</div>
            <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 text-sm font-bold">
            <Link
              href="/login"
              className="bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-2.5 rounded-full font-bold text-sm transition-colors"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-2.5 rounded-full font-bold text-sm transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#13ec5b] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            <Link
              href="/login"
              className="block w-full text-center bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-3 rounded-full font-bold text-sm transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-3 rounded-full font-bold text-sm transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
      <TickerTape colorTheme="light" />


      {/* Hero Section */}
      <section className="px-6 pt-12 pb-4 md:pt-6 md:pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-block bg-green-50 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-8">
              Built for Billion-Dollar Trust
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 font-serif">
              Secure Your Trades <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec5b] to-green-600 italic font-sans pr-2">
                with Unrivaled Trust.
              </span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              {APP_NAME} provides the world's most secure digital asset custody.
              Backed by the vision of global innovation, we ensure every transaction is ironclad, transparent, and instantaneous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/sign-up"
                className="bg-[#0d1b12] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20"
              >
                Initiate Secure Escrow
              </Link>
              <Link href="/login" className="text-center bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
                Login
              </Link>
            </div>

            <div className="flex items-center gap-12 border-t border-gray-100 pt-8">
              <div>
                <p className="text-3xl font-bold text-gray-900">$420B+</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Volume Secured</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">100%</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Hero Graphic */}
          <div className="lg:w-1/2 relative w-full">
            <div className="relative z-10 bg-[#0d1b12] rounded-3xl p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="border border-white/20 p-6 mb-4 rounded-lg">
                <div className="text-5xl mb-2">♡</div>
                <p className="font-serif text-xl tracking-widest uppercase">Visionary</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-1">Leadership</p>
              </div>

              <div className="bg-[#f0fdf4] text-[#0d1b12] p-4 rounded-xl text-left w-full max-w-sm shadow-lg">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Founder's Vision</p>
                <p className="font-serif italic text-base leading-snug">
                  "Trust is the ultimate currency of the future. We've built the vault to hold it."
                </p>
              </div>
            </div>
            {/* Decorative Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-200 rounded-full blur-[100px] opacity-20 -z-10"></div>
          </div>
        </div>
      </section>


      {/* Workflow Section */}
      <section className="bg-gray-50 py-3 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Precision-Engineered Workflow</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our three-step verification process ensures that both parties are satisfied before a single cent is moved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                title: "1. Agreement Setup",
                desc: "Both parties define terms and conditions."
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "2. Fund Depository",
                desc: "The buyer deposits funds into our secure, audited escrow vault. Funds are held in absolute stasis until verified."
              },
              {
                icon: <RefreshCcw className="w-6 h-6" />,
                title: "3. Verified Release",
                desc: "Once delivery is confirmed, funds are released instantly. No waiting periods, no middleman delays."
              }
            ].map((step, idx) => (
              <div key={idx} className="group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MiniChart colorTheme="light" width="100%"></MiniChart>
      +

      {/* Security Section */}
      <section className="px-6 py-6 max-w-7xl mx-auto">
        <div className="bg-[#0d1b12] rounded-[40px] p-8 md:p-16 relative overflow-hidden text-white flex flex-col md:flex-row gap-16">
          <div className="md:w-1/2 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-12 leading-tight">
              Fortress-Grade Security <br />
              for Every Transaction
            </h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#13ec5b]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Multi-Signature Custody</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Funds require multiple authorizations across decentralized global nodes, eliminating any single point of failure.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#13ec5b]">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Automated Arbitration</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Disputes are resolved through our AI-powered legal framework, ensuring fair outcomes based on verifiable data.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#13ec5b]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Institutional Insurance</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    All assets held in X-Escrow are backed by a comprehensive $10B insurance fund for total peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 flex items-center justify-center relative z-10">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl max-w-sm w-full">
              <div className="flex justify-center mb-6 text-[#13ec5b]">
                <BadgeCheck className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Audited by Top-Tier Firms</h3>
              <p className="text-center text-gray-400 text-sm mb-8">
                Quarterly security audits and real-time stress testing ensure we stay ahead of any threat.
              </p>
              <button className="w-full py-4 bg-[#13ec5b] text-[#0d1b12] font-bold rounded-xl hover:bg-[#10c94d] transition-colors">
                View Security Audit
              </button>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-l from-green-900/20 to-transparent"></div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-4 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6">
          Ready to Trade with Absolute <br /> Certainty?
        </h2>
        <p className="text-gray-500 mb-10">
          Join over 50,000 high-volume traders who trust X-Escrow for their most significant digital transactions.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your business email"
            className="flex-1 px-6 py-4 rounded-full border border-gray-200 focus:border-green-500 outline-none"
          />
          <button className="bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-8 py-4 rounded-full font-bold shadow-lg shadow-green-200 transition-all">
            Get Started Now
          </button>
        </div>
        <p className="text-[10px] font-bold text-gray-300 uppercase mt-8 tracking-widest">
          Endorsed by Global Innovators
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#13ec5b] rounded-sm text-[10px] flex items-center justify-center font-bold text-[#0d1b12]">X</div>
            <span className="font-bold tracking-tight text-gray-900">X-ESCROW</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-900">Compliance</Link>
            <Link href="#" className="hover:text-gray-900">Contact</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2024 X-Escrow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
