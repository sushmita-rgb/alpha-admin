import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Mail, Lock, ArrowRight, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading, isAuthenticated, user, clearError } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/products', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter credentials', 'error');
      return;
    }
    const success = await login(email, password);
    if (success) {
      addToast(`Logged in successfully!`, 'success');
    } else {
      addToast('Invalid credentials provided', 'error');
    }
  };

  const autofill = (role) => {
    clearError();
    if (role === 'admin') {
      setEmail('admin@alpha.com');
      setPassword('123456');
    } else {
      setEmail('user@alpha.com');
      setPassword('123456');
    }
    addToast(`${role === 'admin' ? 'Admin' : 'User'} credentials filled`, 'info');
  };

  return (
    <div className="min-h-screen flex bg-notion-bg dark:bg-notion-dark-bg text-notion-text dark:text-notion-dark-text transition-colors duration-150 select-none overflow-hidden font-sans">
      
      {/* ================= LEFT COLUMN: CENTERED BRAND HERO ================= */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-[#0B0B0C] relative select-none text-slate-200">
        
        {/* Dark subtle grid background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Dark radial glow overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(35,131,226,0.1),transparent_70%)]" />

        <div className="w-12" /> {/* Empty spacing top */}

        {/* Brand visual (Vertically Centered) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-6 relative z-10 my-auto"
        >
          <img 
            src="/alpha1-removebg-preview.png" 
            alt="Alpha Logo" 
            className="h-36 lg:h-44 w-auto object-contain bg-transparent filter brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.06)]" 
          />
          
          <h1 className="text-4xl lg:text-5xl font-light tracking-[0.25em] text-white font-sans mr-[-0.25em] uppercase">
            ALPHA
          </h1>
          
          <p className="text-xs lg:text-sm text-slate-400 font-bold max-w-sm leading-relaxed tracking-wide">
            Modern Product Operations for High-Performance Teams.
          </p>
        </motion.div>

        {/* Footer */}
        <div className="text-[9px] text-slate-600 z-10 relative text-center">
          © 2026 Alpha Systems. All rights reserved. Powered by React 19 & Tailwind.
        </div>

      </div>

      {/* ================= RIGHT COLUMN: LOGIN FORM ================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center pt-12 pb-10 px-6 relative bg-gradient-to-b from-[#101827] to-[#0C1320] min-h-screen overflow-y-auto">
        
        {/* Subtle grid background on right panel for mobile visual consistency */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-[#3B82F6]/5 blur-[100px] pointer-events-none" />

        {/* MOBILE & TABLET COMPACT HERO (Hidden on Desktop) */}
        <div className="flex lg:hidden flex-col items-center text-center mb-9">
          {/* Logo: Fade + Scale */}
          <motion.img 
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src="/alpha1-removebg-preview.png" 
            alt="Alpha Logo" 
            className="w-20 h-auto object-contain bg-transparent filter brightness-110" 
          />
          
          {/* Heading: Fade Up */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="text-3xl font-extrabold tracking-[0.25em] text-white font-sans mr-[-0.25em] uppercase mt-4"
          >
            ALPHA
          </motion.h1>
          
          {/* Tagline: Fade Up */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="text-xs text-[#94A3B8] font-bold max-w-xs leading-relaxed tracking-wide mt-2.5"
          >
            Modern Product Operations for High-Performance Teams.
          </motion.p>
        </div>

        {/* DESKTOP HEADER (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:block w-full max-w-[400px] mb-6 space-y-2 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Log in to Alpha
          </h2>
          <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">
            Enter credentials below to enter the dashboard workspace.
          </p>
        </div>

        {/* Login Card: Fade Up with delay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="w-[90%] sm:w-full max-w-[400px] bg-[#171C26] border border-white/6 backdrop-blur-md rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 space-y-5 z-10"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-semibold text-rose-400">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-white/8 bg-[#111827] text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-white/8 bg-[#111827] text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder-slate-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white font-bold text-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-wider">
              <span className="bg-[#171C26] px-2.5 text-[#94A3B8]">Demo Credentials</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => autofill('admin')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-white/8 bg-[#111827] hover:bg-[#1C2333] hover:border-white/15 text-[10px] font-bold transition-all text-white cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Admin</span>
            </button>

            <button 
              type="button" 
              onClick={() => autofill('user')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-white/8 bg-[#111827] hover:bg-[#1C2333] hover:border-white/15 text-[10px] font-bold transition-all text-white cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>User</span>
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
