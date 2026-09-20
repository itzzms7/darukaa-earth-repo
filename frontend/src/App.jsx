import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import SiteDetailPage from './components/SiteDetailPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import SignInPage from './components/SignInPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import { api } from './api/client.js';

export default function App() {
  //const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'site_detail' | 'profile' | 'signin' | 'signup'
  const [activeView, setActiveView] = useState( api.getCurrentUser() ? 'dashboard' : 'signin' );
  const [activeProject, setActiveProject] = useState(null);
  const [activeSite, setActiveSite] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = (viewName, callback) => {
    setIsTransitioning(true);
    setActiveView(viewName);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (callback) callback();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 180);
  };

  const handleOpenSite = (project, site) => {
    transitionTo('site_detail', () => {
      setActiveProject(project);
      setActiveSite(site);
    });
  };

  const handleBackToDashboard = () => {
    transitionTo('dashboard');
  };

  const handleOpenProfile = () => {
    transitionTo('profile');
  };

  const handleOpenSignIn = () => {
    transitionTo('signin');
  };

  const handleOpenSignUp = () => {
    transitionTo('signup');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    transitionTo('signin');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    transitionTo('dashboard');
  };

  const handleUpdateSite = (updatedSite) => {
    setActiveSite(updatedSite);
  };

  return (
    <div className="min-h-screen site-abstract-gradient-bg p-2 sm:p-4 md:p-6 lg:p-7 flex flex-col justify-between font-sans selection:bg-blue-500/20 selection:text-blue-400 relative overflow-x-hidden">
      {/* Soft Moving Ambient Glow Layers: Blue, Soft White Glow, Subtle Gold Glow & Black Mix */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle moving Blue glow */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[850px] h-[750px] rounded-full blur-[140px] pointer-events-none animate-orb-blue"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.42) 0%, rgba(56, 189, 248, 0.22) 40%, rgba(2, 132, 199, 0.1) 65%, transparent 75%)'
          }}
        />

        {/* Subtle moving Gold glow */}
        <div 
          className="absolute top-[30%] -right-[12%] w-[850px] h-[750px] rounded-full blur-[150px] pointer-events-none animate-orb-gold"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.26) 0%, rgba(217, 119, 6, 0.14) 40%, rgba(180, 83, 9, 0.06) 65%, transparent 75%)'
          }}
        />

        {/* Subtle moving Soft White glow */}
        <div 
          className="absolute top-[10%] left-[30%] w-[650px] h-[550px] rounded-full blur-[130px] pointer-events-none animate-orb-white"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(240, 246, 255, 0.08) 45%, transparent 70%)'
          }}
        />

        {/* Second soft Blue & Gold mix orb at bottom */}
        <div 
          className="absolute -bottom-[15%] left-[20%] w-[900px] h-[700px] rounded-full blur-[160px] pointer-events-none animate-orb-blue"
          style={{
            background: 'radial-gradient(circle, rgba(30, 64, 175, 0.35) 0%, rgba(234, 179, 8, 0.12) 45%, transparent 75%)'
          }}
        />

        {/* Deep Black Mix Vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(5, 6, 9, 0.55) 85%, rgba(3, 4, 6, 0.8) 100%)'
          }}
        />
      </div>

      {/* Main Elevated Canvas Window (Background removed to transparent glass) */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col bg-[#080A10]/40 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-[#2D3139]/70 shadow-2xl shadow-black/60 overflow-hidden relative z-10">
        
        {/* Subtle Console Interior AI Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute top-[4%] sm:top-[6%] left-1/2 -translate-x-1/2 w-[760px] max-w-[95vw] h-[360px] rounded-full blur-[110px] opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 75%)'
            }}
          />
        </div>

        {/* Floating Content over the transparent canvas */}
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar 
            onHomeClick={handleBackToDashboard}
            currentUser={currentUser}
            onOpenProfile={handleOpenProfile}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
            onLogout={handleLogout}
          />

          <main className="flex-1 w-full px-4 sm:px-6 py-6">
            <AnimatePresence mode="wait">
              {isTransitioning ? (
                <motion.div
                  key="page-skeleton-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="h-7 w-32 bg-white/[0.05] rounded-lg animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 h-80 space-y-4 animate-pulse">
                      <div className="h-5 bg-white/[0.05] rounded w-1/3" />
                      <div className="h-16 rounded-xl border border-[#2D3139]/50 bg-white/[0.02]" />
                      <div className="h-16 rounded-xl border border-[#2D3139]/50 bg-white/[0.02]" />
                    </div>
                    <div className="md:col-span-7 h-80 space-y-4 animate-pulse">
                      <div className="h-5 bg-white/[0.05] rounded w-1/4" />
                      <div className="h-16 rounded-xl border border-[#2D3139]/50 bg-white/[0.02]" />
                      <div className="h-16 rounded-xl border border-[#2D3139]/50 bg-white/[0.02]" />
                    </div>
                  </div>
                </motion.div>
              ) : activeView === 'dashboard' ? (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Dashboard onOpenSite={handleOpenSite} currentUser={currentUser} />
                </motion.div>
              ) : activeView === 'site_detail' ? (
                <motion.div
                  key={`site-detail-${activeSite?.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SiteDetailPage
                    project={activeProject}
                    site={activeSite}
                    currentUser={currentUser}
                    onBack={handleBackToDashboard}
                    onUpdateSite={handleUpdateSite}
                  />
                </motion.div>
              ) : activeView === 'profile' ? (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProfilePage
                    user={currentUser}
                    onBack={handleBackToDashboard}
                    onUpdateUser={handleUpdateUser}
                    onLogout={handleLogout}
                  />
                </motion.div>
              ) : activeView === 'signin' ? (
                <motion.div
                  key="signin-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SignInPage
                    onSuccess={handleAuthSuccess}
                    onNavigateToSignUp={handleOpenSignUp}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="signup-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SignUpPage
                    onSuccess={handleAuthSuccess}
                    onNavigateToSignIn={handleOpenSignIn}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer (Transparent card bg) */}
          <footer className="border-t border-[#22252C]/60 bg-transparent py-3.5 mt-auto">
            <div className="px-4 sm:px-6 flex items-center justify-between text-xs text-[#9CA3AF]">
              <span className="font-semibold text-[#F3F4F6]">
                Darukaa<span className="text-blue-400">.Earth</span> &copy; 2026
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#9CA3AF]">Muhammad Suhail</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
