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
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-transparent border-b border-[#2D3139]/60 shadow-xs"
    >
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer p-1 rounded-lg liquid-crystal-hover"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 shadow-xs transition-all">
              <Globe2 className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#F3F4F6] group-hover:text-blue-400 transition-colors leading-none">
                Darukaa<span className="text-blue-500">.Earth</span>
              </span>
              <span className="text-[10px] text-[#9CA3AF] font-semibold tracking-wide uppercase mt-0.5 hidden sm:inline">
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
                className="w-8 h-8 rounded-full border border-[#2D3139]/70 bg-transparent flex items-center justify-center text-blue-400 transition-all cursor-pointer shadow-xs liquid-crystal-hover"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Role & User Switch Pill */}
              <div className="relative">
                <button
                  id="user-auth-btn"
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#2D3139]/70 bg-transparent transition-all cursor-pointer shadow-xs liquid-crystal-hover"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#F3F4F6]">
                    <span className="font-semibold">Admin</span>
                    <span className="text-[#6B7280] hidden sm:inline">•</span>
                    <span className="text-[#9CA3AF] text-[11px] font-medium hidden sm:inline truncate max-w-[130px]">
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>
                </button>

                {/* User Auth Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 mt-1 w-64 bg-black/85 backdrop-blur-2xl rounded-xl border border-[#2D3139]/80 shadow-2xl py-2 z-50 text-xs animate-fade-in stitch-card-shadow">
                    {/* User Identity Header */}
                    <div className="px-3.5 py-2.5 border-b border-[#22252C]">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#F3F4F6] truncate">{currentUser.name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          Admin
                        </span>
                      </div>
                      <p className="text-[#9CA3AF] text-[11px] truncate mt-0.5">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Active Session</span>
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
                        className="w-full text-left px-3.5 py-2 text-[#F3F4F6] hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-[#F3F4F6]">Profile & Settings</span>
                          <span className="text-[10px] text-[#9CA3AF]">View and edit user account details</span>
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
                        className="w-full text-left px-3.5 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#22252C]"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2D3139]/70 hover:border-blue-500/50 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-[#F3F4F6] transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                Sign In
              </button>
              <button
                id="nav-signup-btn"
                type="button"
                onClick={onOpenSignUp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer btn-crystal-blue"
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
