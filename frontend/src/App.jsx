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
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'site_detail' | 'profile' | 'signin' | 'signup'
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
    <div className="min-h-screen bg-[#DEE3FA] p-2 sm:p-4 md:p-6 lg:p-7 flex flex-col justify-between font-sans selection:bg-[#FCEEF3] selection:text-[#D65D80]">
      {/* Main Elevated Canvas Window matching reference design */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col bg-[#FAFBFD] rounded-2xl md:rounded-3xl border border-[#D5DCF5] shadow-2xl shadow-indigo-950/5 overflow-hidden relative">
        
        {/* Customized Theme Atmospheric Glowing Blooms (Matching Reference Image) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Primary Centered Vibrant Rose / Magenta Glow */}
          <div 
            className="absolute top-[10%] sm:top-[12%] left-1/2 -translate-x-1/2 w-[720px] max-w-[95vw] h-[440px] rounded-full blur-[95px] opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(225, 75, 122, 0.44) 0%, rgba(244, 114, 182, 0.28) 42%, rgba(251, 191, 140, 0.18) 70%, transparent 100%)'
            }}
          />
          {/* Secondary Soft Peach / Sunlight Glow right underneath */}
          <div 
            className="absolute top-[34%] sm:top-[38%] left-1/2 -translate-x-1/2 w-[620px] max-w-[90vw] h-[340px] rounded-full blur-[85px] opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(254, 215, 170, 0.5) 0%, rgba(253, 230, 138, 0.25) 45%, transparent 80%)'
            }}
          />
          {/* Subtle Ambient Periwinkle Halo at upper edges */}
          <div 
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[320px] rounded-full blur-[110px] opacity-35 bg-[#DEE3FA]"
          />
        </div>

        {/* Floating Content over the custom radiant background */}
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
                  <div className="h-7 w-32 bg-[#DEC8D4] rounded animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 h-80 bg-white/80 rounded-lg border border-[#DEC8D4] p-5 space-y-4 animate-pulse">
                      <div className="h-5 bg-[#DEC8D4] rounded w-1/3" />
                      <div className="h-16 bg-[#FAF5F7] rounded" />
                      <div className="h-16 bg-[#FAF5F7] rounded" />
                    </div>
                    <div className="md:col-span-7 h-80 bg-white/80 rounded-lg border border-[#DEC8D4] p-5 space-y-4 animate-pulse">
                      <div className="h-5 bg-[#DEC8D4] rounded w-1/4" />
                      <div className="h-20 bg-[#FAF5F7] rounded" />
                      <div className="h-20 bg-[#FAF5F7] rounded" />
                    </div>
                  </div>
                </motion.div>
              ) : activeView === 'dashboard' ? (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Dashboard onOpenSite={handleOpenSite} currentUser={currentUser} />
                </motion.div>
              ) : activeView === 'site_detail' ? (
                <motion.div
                  key={`site-detail-${activeSite?.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SignUpPage
                    onSuccess={handleAuthSuccess}
                    onNavigateToSignIn={handleOpenSignIn}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Clean Footer: Bottom-right 'Geo-spatial Analytic Engine' section removed */}
          <footer className="border-t border-[#DEC8D4]/60 bg-white/70 backdrop-blur-xs py-3.5 mt-auto">
            <div className="px-4 sm:px-6 flex items-center justify-between text-xs text-[#756770]">
              <span className="font-medium text-[#231C20]">
                Darukaa<span className="text-[#D65D80]">.Earth</span> &copy; 2026
              </span>
              <div className="flex items-center gap-3">
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleOpenProfile}
                    className="text-[#756770] hover:text-[#D65D80] transition-colors cursor-pointer"
                  >
                    Profile
                  </button>
                )}
                <span className="text-[#DEC8D4]">•</span>
                <span className="text-[#756770]">WGS 84</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
