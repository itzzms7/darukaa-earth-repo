import { useState, useRef, useEffect } from 'react';
import { Globe2, ShieldCheck, User, LogOut, Check, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ 
  onHomeClick, 
  currentUser, 
  onOpenProfile, 
  onOpenSignIn, 
  onOpenSignUp, 
  onLogout 
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-[#DEC8D4]/70 shadow-xs"
    >
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Window Control Indicator Dots (Matching Reference Image) */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#DEC8D4]/70 hidden sm:flex">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
          </div>

          {/* Brand */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-[#FAF0F4] border border-[#D65D80]/30 flex items-center justify-center text-[#D65D80] group-hover:bg-[#FCEBF2] shadow-xs transition-colors">
              <Globe2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#231C20] group-hover:text-[#D65D80] transition-colors leading-none">
                Darukaa<span className="text-[#D65D80]">.Earth</span>
              </span>
              <span className="text-[10px] text-[#756770] font-medium tracking-wide uppercase mt-0.5 hidden sm:inline">
                Geospatial Carbon & Biodiversity
              </span>
            </div>
          </button>
        </div>

        {/* User Authentication Status Section */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5" ref={menuRef}>
              {/* Direct Icon button to visit profile page */}
              <button
                id="direct-profile-btn"
                type="button"
                onClick={onOpenProfile}
                title="View Profile"
                className="w-8 h-8 rounded-full border border-[#DEC8D4] hover:border-[#D65D80] bg-white hover:bg-[#FAF5F7] flex items-center justify-center text-[#D65D80] transition-colors cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Role & User Switch Pill */}
              <div className="relative">
                <button
                  id="user-auth-btn"
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#DEC8D4] hover:border-[#D65D80] bg-white hover:bg-[#FAF5F7] transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FAF0F4] text-[#D65D80] flex items-center justify-center text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#231C20]">
                    <span className="font-semibold">Admin</span>
                    <span className="text-[#A698A0] hidden sm:inline">•</span>
                    <span className="text-[#756770] text-[11px] hidden sm:inline truncate max-w-[130px]">
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>
                </button>

                {/* User Auth Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 mt-1 w-60 bg-white rounded-xl border border-[#DEC8D4] shadow-xl py-2 z-50 text-xs animate-fade-in">
                    {/* User Identity Header */}
                    <div className="px-3.5 py-2.5 border-b border-[#F0E2EA]">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#231C20] truncate">{currentUser.name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-[#FAF0F4] text-[#D65D80] border-[#DEC8D4]">
                          Admin
                        </span>
                      </div>
                      <p className="text-[#756770] text-[11px] truncate mt-0.5">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Active Session (FastAPI Synchronized)</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Visit Profile Page Option */}
                      <button
                        id="menu-profile-btn"
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#231C20] hover:bg-[#FAF5F7] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#D65D80]" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Profile & Settings</span>
                          <span className="text-[10px] text-[#756770]">View and edit user account details</span>
                        </div>
                      </button>

                      {/* Logout Option */}
                      <button
                        id="menu-logout-btn"
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50/70 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#F0E2EA]"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-semibold text-xs">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Logged Out Controls */
            <div className="flex items-center gap-2">
              <button
                id="nav-signin-btn"
                type="button"
                onClick={onOpenSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DEC8D4] hover:border-[#D65D80] bg-white hover:bg-[#FAF5F7] text-xs font-semibold text-[#231C20] transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D65D80]" />
                Sign In
              </button>
              <button
                id="nav-signup-btn"
                type="button"
                onClick={onOpenSignUp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D65D80] hover:bg-[#C24D70] text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
