/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn } from 'lucide-react';
import { InputField } from './components/InputField';
import { Button } from './components/Button';
import { SecurityNotice } from './components/SecurityNotice';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { authService } from './services/authService';
import { User } from './types';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<'DE' | 'EN'>('DE');
  
  // Custom loading bar width state
  const [loadingBarWidth, setLoadingBarWidth] = useState('w-0');

  // Triggered when submitting the credentials form
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLoadingBarWidth('w-[70%]'); // Set loading bar to 70% during validation

    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setLoadingBarWidth('w-full'); // Animate the loading bar to 100% on success
        
        setTimeout(() => {
          setIsLoggedIn(true);
          setCurrentUser(response.user!);
          setIsLoading(false);
          setLoadingBarWidth('w-0'); // reset loading bar after navigation
        }, 400);
      } else {
        setError(response.error || 'Authentifizierung fehlgeschlagen.');
        setIsLoading(false);
        setLoadingBarWidth('w-0');
      }
    } catch (err) {
      setError('Verbindung zum städtischen Server konnte nicht hergestellt werden.');
      setIsLoading(false);
      setLoadingBarWidth('w-0');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  // Automatically pre-fill the mock email to make testing easy and delightful
  useEffect(() => {
    setEmail('vorname.nachname@essen.de');
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden relative bg-slate-50">
      {/* Top Loading Indicator (Subtle micro-interaction) */}
      <div 
        className={`fixed top-0 left-0 h-1 bg-[#4f46e5] transition-all duration-700 ease-out z-[60] ${loadingBarWidth}`}
        id="loading-bar"
      />

      {/* Subtle Grid Pattern Background (Mimics digital paper texture) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#4f46e5 0.6px, transparent 0.6px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative px-lg py-xl z-10">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="login-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-[440px] bg-white border border-border-default z-10 flex flex-col"
            >
              {/* Card Header: Logo & Branding */}
              <div className="pt-3xl px-3xl pb-xl flex flex-col items-center text-center">
                <div className="mb-lg w-20 h-20 rounded-lg overflow-hidden border border-border-default bg-surface">
                  <img 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGJbjvzct892_VvIfmGZRMBhMWCFa6GdusK-VXcNgHgnMCO3FRTuPrFw8jqjhEfnOO3YyCpc5eiWuJklj0cKlZ9XTzthpBz7TP53jmkkUAHhDTJA2zEmL1cHX0vlrBI78h0MsssDX3EVDYqC8T949n_LygOfuUhfNPji5LNrB4304GUIENDju6tfbRE1zl1KlZxctLMQJ4tt8kA9XYQ5MxlWe6wPcIzDOc-eQMqabVwVtGAAXJwCo8AyNoZUMbwlQH85qNajPo0bw9" 
                    alt="Offizielles Foto des Rathauses Essen"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold">
                  {currentLang === 'DE' ? 'Stadt Essen' : 'City of Essen'}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                  {currentLang === 'DE' ? 'Kommunale Entscheidungsplattform' : 'Municipal Decision Platform'}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="px-3xl pb-3xl space-y-lg">
                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-md bg-status-error/10 border border-status-error/30 text-status-error text-caption rounded-DEFAULT leading-relaxed"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email Field */}
                <InputField
                  id="email"
                  label={currentLang === 'DE' ? 'E-Mail-Adresse' : 'Email Address'}
                  type="email"
                  placeholder="vorname.nachname@essen.de"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="admin-focus"
                />

                {/* Password Field */}
                <InputField
                  id="password"
                  label={currentLang === 'DE' ? 'Passwort' : 'Password'}
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="admin-focus"
                  rightLabelAction={
                    <a 
                      className="font-caption text-caption text-primary hover:underline" 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(currentLang === 'DE' 
                          ? 'Wenden Sie sich bitte an den IT-Support der Stadt Essen.' 
                          : 'Please contact Essen Municipal IT Support.');
                      }}
                    >
                      {currentLang === 'DE' ? 'Vergessen?' : 'Forgot?'}
                    </a>
                  }
                />

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-sm py-xs">
                  <input 
                    id="remember" 
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary border-border-default rounded admin-focus cursor-pointer"
                  />
                  <label 
                    className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" 
                    htmlFor="remember"
                  >
                    {currentLang === 'DE' ? 'Angemeldet bleiben' : 'Stay signed in'}
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  icon={<LogIn size={18} className="stroke-[2.5]" />}
                  className="w-full"
                >
                  {currentLang === 'DE' ? 'Anmelden' : 'Sign In'}
                </Button>

                {/* Security Note badge */}
                <SecurityNotice 
                  message={
                    currentLang === 'DE' 
                      ? 'Sichere Verbindung zum städtischen Server ist aktiv. Ihre Daten werden verschlüsselt übertragen.'
                      : 'Secure connection to municipal server is active. Your data will be transmitted in encrypted form.'
                  }
                />
              </form>
            </motion.div>
          ) : (
            <DashboardView 
              user={currentUser!} 
              onLogout={handleLogout} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Global Municipal Footer */}
      <Footer 
        currentLang={currentLang} 
        onLangChange={(lang) => setCurrentLang(lang)} 
        version="v2.4.1"
      />
    </div>
  );
}
