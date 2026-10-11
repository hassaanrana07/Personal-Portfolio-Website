import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  UserPlus, 
  User, 
  CheckCircle2, 
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../../utils/useGlassTilt';
import adminApi from '../../services/adminApi';

export default function AdminLogin({ 
  onLogin, 
  onSetup, 
  onBackToPublic, 
  requestedMode = null,
  loading: authLoading, 
  error: authError 
}) {
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [mode, setMode] = useState('login'); // 'login' | 'setup'
  const [checkingSetup, setCheckingSetup] = useState(true);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Setup Form State
  const [setupName, setSetupName] = useState('Hassaan Ali Akbar');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [showSetupConfirmPassword, setShowSetupConfirmPassword] = useState(false);
  
  const [localError, setLocalError] = useState('');
  const [localNotice, setLocalNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check setup status on mount & sync with requestedMode
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await adminApi.getSetupStatus();
        if (isMounted && res && res.success) {
          const required = Boolean(res.isSetupRequired);
          setIsSetupRequired(required);
          setAdminCount(res.adminCount || 0);

          if (requestedMode === 'setup') {
            if (required) {
              setMode('setup');
            } else {
              setMode('login');
              setLocalNotice('Administrator account is already initialized in the database. Initial registration is closed to protect your portfolio.');
            }
          } else if (requestedMode === 'login') {
            setMode('login');
          } else {
            // Default based on setup requirement
            setMode(required ? 'setup' : 'login');
          }
        }
      } catch {
        // Fallback to login mode if server unreachable
        if (isMounted) setMode('login');
      } finally {
        if (isMounted) setCheckingSetup(false);
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, [requestedMode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLocalError('');
    setLocalNotice('');
    setIsSubmitting(true);

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;

    if (!setupEmail.trim() || !setupPassword.trim()) {
      setLocalError('Please enter your personal email address and choose a password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(setupEmail.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (setupPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long for security.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    setLocalError('');
    setLocalNotice('');
    setIsSubmitting(true);

    try {
      if (onSetup) {
        await onSetup(setupName.trim(), setupEmail.trim(), setupPassword);
      } else {
        await adminApi.setupAdmin({
          name: setupName.trim(),
          email: setupEmail.trim(),
          password: setupPassword
        });
        await onLogin(setupEmail.trim(), setupPassword);
      }
    } catch (err) {
      setLocalError(err.message || 'Administrator setup failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full bg-[#0D0B0A] text-[#F5F1EC] flex flex-col justify-between items-center px-4 py-10 relative overflow-hidden font-sans">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5722]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#FF9A3D]/05 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#9A9088] hover:text-[#FF9A3D] transition-colors py-2 px-3.5 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#9A9088] bg-white/03 px-3 py-1.5 rounded-xl border border-white/05">
          <ShieldCheck className="w-4 h-4 text-[#FF9A3D]" />
          <span>{mode === 'setup' ? 'First-Time Setup Gateway' : 'Administrator Gateway'}</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md my-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="glass p-8 border border-white/10 shadow-2xl relative cursor-default"
          onMouseMove={handleGlassMouseMove}
          onMouseLeave={handleGlassMouseLeave}
        >
          
          {/* Header Icon & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5722]/20 border border-[#FF5722]/30 text-[#FF9A3D] mb-1 shadow-inner">
              {mode === 'setup' ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h1 className="font-sora text-2xl font-bold text-[#F5F1EC] tracking-tight">
              {mode === 'setup' ? 'First-Time Admin Setup' : 'Admin CMS Portal'}
            </h1>
            <p className="text-xs font-mono text-[#9A9088]">
              {mode === 'setup' 
                ? 'Configure your personal administrator email & password to take ownership of this portfolio' 
                : 'Enter your administrator credentials to access the portfolio dashboard'}
            </p>
          </div>

          {/* Notice Banner (e.g. when setup requested but closed) */}
          {localNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 font-mono leading-relaxed"
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{localNotice}</span>
            </motion.div>
          )}

          {/* Error Banner */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 font-mono leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </motion.div>
          )}

          {checkingSetup ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#9A9088]">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF9A3D]" />
              <span>Verifying system setup state...</span>
            </div>
          ) : mode === 'setup' ? (
            /* ==================== FIRST-TIME SETUP FORM ==================== */
            <div className="space-y-5">
              
              {!isSetupRequired && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Setup Closed</span>
                  </div>
                  <p className="leading-relaxed">
                    An administrator account already exists in the database. Public setup is disabled to prevent unauthorized account creation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLocalNotice('');
                      setLocalError('');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold transition-colors cursor-pointer text-center"
                  >
                    Go to Admin Login
                  </button>
                </div>
              )}

              {isSetupRequired && (
                <form onSubmit={handleSetupSubmit} className="space-y-4 font-mono text-sm">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="setup-name" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                      Administrator Name
                    </label>
                    <div className="relative">
                      <input
                        id="setup-name"
                        type="text"
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="Hassaan Ali Akbar"
                        required
                        className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                      />
                      <User className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="setup-email" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                      Personal Admin Email
                    </label>
                    <div className="relative">
                      <input
                        id="setup-email"
                        type="email"
                        value={setupEmail}
                        onChange={(e) => {
                          setSetupEmail(e.target.value);
                          if (localError) setLocalError('');
                        }}
                        placeholder="hassaanalee07@gmail.com"
                        autoComplete="username"
                        required
                        className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                      />
                      <Mail className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="setup-password" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                      Choose Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        id="setup-password"
                        type={showSetupPassword ? 'text' : 'password'}
                        value={setupPassword}
                        onChange={(e) => {
                          setSetupPassword(e.target.value);
                          if (localError) setLocalError('');
                        }}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                      />
                      <Key className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowSetupPassword(!showSetupPassword)}
                        className="absolute right-3.5 top-3.5 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                        aria-label={showSetupPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="setup-confirm-password" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="setup-confirm-password"
                        type={showSetupConfirmPassword ? 'text' : 'password'}
                        value={setupConfirmPassword}
                        onChange={(e) => {
                          setSetupConfirmPassword(e.target.value);
                          if (localError) setLocalError('');
                        }}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                      />
                      <Key className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowSetupConfirmPassword(!showSetupConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                        aria-label={showSetupConfirmPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showSetupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full mt-2 bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] py-3.5 px-6 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5722]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CONFIGURING ADMINISTRATOR ACCOUNT...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>CREATE ADMIN ACCOUNT & SIGN IN</span>
                      </>
                    )}
                  </motion.button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLocalError('');
                        setLocalNotice('');
                      }}
                      className="text-xs font-mono text-[#9A9088] hover:text-[#FF9A3D] transition-colors cursor-pointer"
                    >
                      Already have an account? <span className="underline font-bold">Switch to Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ==================== LOGIN FORM ==================== */
            <div className="space-y-5">
              
              {/* If setup is required, show prominent prompt to configure account */}
              {isSetupRequired && (
                <div className="p-4 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/30 text-xs font-mono text-[#F5F1EC] space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-[#FF9A3D]">
                    <Sparkles className="w-4 h-4" />
                    <span>First-Time Setup Required</span>
                  </div>
                  <p className="text-[#9A9088] leading-relaxed">
                    No administrator account exists in the database. Please initialize your account first.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('setup');
                      setLocalError('');
                      setLocalNotice('');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Configure Administrator Account</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-sm">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                    Admin Email
                  </label>
                  <div className="relative">
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (localError) setLocalError('');
                      }}
                      placeholder="admin@hassaan.dev"
                      autoComplete="username"
                      required
                      className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                    />
                    <Mail className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-password" className="block text-xs font-bold text-[#9A9088] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (localError) setLocalError('');
                      }}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full bg-[#171310]/80 border border-white/10 rounded-xl text-[#F5F1EC] pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#FF9A3D] focus:ring-1 focus:ring-[#FF9A3D]/30 transition-all placeholder-[#666]"
                    />
                    <Key className="w-4 h-4 text-[#9A9088] absolute left-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-2 bg-[#FF9A3D] hover:bg-[#ffaa5a] text-[#0D0B0A] py-3.5 px-6 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF9A3D]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>SIGN IN TO DASHBOARD</span>
                    </>
                  )}
                </motion.button>

                {/* Info / Reset Helper */}
                <div className="pt-2 text-center text-[11px] font-mono text-[#888] space-y-1">
                  {isSetupRequired ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('setup');
                        setLocalError('');
                        setLocalNotice('');
                      }}
                      className="text-[#FF9A3D] hover:underline cursor-pointer font-bold"
                    >
                      Need to initialize your admin account? Click here
                    </button>
                  ) : (
                    <p className="text-[#777]">
                      Need to reset credentials? Run <code className="text-[#AAA] bg-white/05 px-1 py-0.5 rounded">npm run admin:setup</code> in server console.
                    </p>
                  )}
                </div>

              </form>
            </div>
          )}

        </motion.div>
      </main>

      {/* Footer Note */}
      <footer className="text-center font-mono text-xs text-[#9A9088] z-10">
        <span>Protected Admin System &bull; Hassaan Ali Akbar Portfolio 2.0</span>
      </footer>

    </div>
  );
}
