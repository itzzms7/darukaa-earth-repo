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
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#231C20] bg-white hover:bg-[#FAF5F7] border border-[#DEC8D4] hover:border-[#D65D80] rounded-md transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D65D80]" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Profile updated
            </span>
          )}
          <button
            id="profile-logout-btn"
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50/70 hover:bg-red-100/80 border border-red-200 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#DEC8D4] shadow-xs p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D65D80] to-[#E98FA9] text-white flex items-center justify-center text-2xl font-bold tracking-tight shadow-md border-2 border-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DE'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Active session">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#231C20]">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold border bg-[#FAF0F4] text-[#D65D80] border-[#DEC8D4]">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#756770] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-[#A698A0]" />
                {user?.email}
              </p>
              <p className="text-xs text-[#756770] flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#A698A0]" />
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#D65D80] hover:bg-[#C24D70] text-white transition-colors cursor-pointer shadow-xs"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Bio text */}
        {!isEditing && (
          <div className="mt-5 pt-4 border-t border-[#F0E2EA]">
            <p className="text-xs text-[#554A51] leading-relaxed">
              {user?.bio || 'Geospatial carbon project manager & GIS boundary analyst.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Form (Collapsible) */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white/95 rounded-xl border border-[#DEC8D4] shadow-xs p-6 space-y-4 animate-fade-in">
          <h2 className="text-sm font-bold text-[#231C20]">Edit Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#554A51] mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-md focus:outline-none focus:border-[#D65D80] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#554A51] mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-md focus:outline-none focus:border-[#D65D80] transition-colors"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#554A51] mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-md focus:outline-none focus:border-[#D65D80] transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#554A51] mb-1">Bio / Role Description</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-md focus:outline-none focus:border-[#D65D80] transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0E2EA]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-[#756770] hover:text-[#231C20] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#D65D80] hover:bg-[#C24D70] rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Account & Workspace Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-xl border border-[#DEC8D4] p-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#D65D80] mb-2">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs font-bold text-[#231C20]">Access Scope</span>
          </div>
          <p className="text-xs text-[#756770] leading-relaxed">
            Administrator privilege with full project creation, site parcel drawing, and telemetry editing capability.
          </p>
        </div>

        <div className="bg-white/90 rounded-xl border border-[#DEC8D4] p-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#D65D80] mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold text-[#231C20]">Geodetic Reference</span>
          </div>
          <p className="text-xs text-[#756770] leading-relaxed">
            Parcels and boundary nodes are calculated in <span className="font-mono text-[#231C20] font-semibold">WGS 84 (EPSG:4326)</span> latitude & longitude coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}
