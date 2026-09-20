import { useState } from 'react';
import { 
  Mail, 
  Building2, 
  Save, 
  LogOut, 
  ArrowLeft, 
  Check, 
  MapPin, 
  FolderKanban 
} from 'lucide-react';
import { api } from '../api/client.js';

export default function ProfilePage({ user, onBack, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Suhail',
    email: user?.email || 'iamxuhail@gmail.com',
    organization: user?.organization || 'Darukaa Earth',
    bio: user?.bio || 'Geospatial carbon project administrator & parcel GIS analyst.',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = api.updateProfile(formData);
    onUpdateUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="profile-page" className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with navigation */}
      <div className="flex items-center justify-between">
        <button
          id="profile-back-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#F3F4F6] bg-white/[0.04] hover:bg-white/[0.08] border border-[#2D3139]/70 hover:border-blue-500/50 rounded-xl transition-all cursor-pointer shadow-lg stitch-card-shadow"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Profile updated
            </span>
          )}
          <button
            id="profile-logout-btn"
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="p-6 bg-transparent rounded-2xl border border-[#2D3139]/70 liquid-crystal-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold tracking-tight shadow-xl border-2 border-[#181A20]">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DE'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#181A20] flex items-center justify-center" title="Active session">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#F3F4F6]">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-950/50 text-blue-400 border-blue-500/30">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] font-medium flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                {user?.email}
              </p>
              <p className="text-xs text-[#9CA3AF] font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                {user?.organization || 'Darukaa Earth'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              id="edit-profile-btn"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Bio text */}
        {!isEditing && (
          <div className="mt-5 pt-4 border-t border-[#2D3139]">
            <p className="text-xs text-[#9CA3AF] font-medium leading-relaxed">
              {user?.bio || 'Geospatial carbon project manager & GIS boundary analyst.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Form (Collapsible) */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-transparent rounded-2xl border border-[#2D3139]/70 p-6 space-y-4 liquid-crystal-card animate-fade-in">
          <h2 className="text-sm font-bold text-[#F3F4F6]">Edit Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/[0.04] text-[#F3F4F6] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/[0.04] text-[#F3F4F6] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/[0.04] text-[#F3F4F6] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Bio / Role Description</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/[0.04] text-[#F3F4F6] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2D3139]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Account & Workspace Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-transparent border border-[#2D3139]/70 rounded-2xl liquid-crystal-card">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs font-bold text-[#F3F4F6]">Access Scope</span>
          </div>
          <p className="text-xs text-[#9CA3AF] font-medium leading-relaxed">
            Administrator privilege with full project creation, site parcel drawing, and telemetry editing capability.
          </p>
        </div>

        <div className="p-5 bg-transparent border border-[#2D3139]/70 rounded-2xl liquid-crystal-card">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold text-[#F3F4F6]">Geodetic Reference</span>
          </div>
          <p className="text-xs text-[#9CA3AF] font-medium leading-relaxed">
            Parcels and boundary nodes are calculated in <span className="font-mono text-blue-400 font-bold">WGS 84 (EPSG:4326)</span> latitude & longitude coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}
