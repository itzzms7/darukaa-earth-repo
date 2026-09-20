import { useState } from 'react';
import { X } from 'lucide-react';
import PolygonMapEditor from './PolygonMapEditor.jsx';

export default function SiteModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [polygonError, setPolygonError] = useState('');
  const [currentPoints, setCurrentPoints] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Enter a site name.');
      return;
    }

    if (!currentPoints || currentPoints.length < 3) {
      setPolygonError('Please draw at least 3 corner points or drop a box to form a boundary.');
      return;
    }

    // Ensure polygon is closed
    const pts = [...currentPoints];
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      pts.push([first[0], first[1]]);
    }

    const geometry = {
      type: 'Polygon',
      coordinates: [pts],
    };

    onCreate(name.trim(), geometry);
    setName('');
    setNameError('');
    setPolygonError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="new-site-dialog"
        className="w-full max-w-2xl text-[#F3F4F6] rounded-2xl p-5 max-h-[94vh] flex flex-col blurred-card-bg"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3139]">
          <h2 className="text-base font-semibold text-[#F3F4F6]">New site</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-3 overflow-y-auto pr-1 flex-1 space-y-3.5">
          {/* Site Name Field */}
          <div>
            <label htmlFor="site-name-input" className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Site name
            </label>
            <input
              id="site-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Shola Ridge Parcel Bravo"
              className={`w-full px-3.5 py-2 text-xs bg-white/[0.04] text-[#F3F4F6] placeholder-[#6B7280] rounded-xl border transition-all outline-none ${
                nameError
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#2D3139]/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15'
              }`}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-[#EF4444] mt-1 font-medium">{nameError}</p>
            )}
          </div>

          {/* Interactive Map Drawable Interface + Live Coordinates Section */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Draw site boundary on map
            </label>
            <PolygonMapEditor
              onChange={(pts) => {
                setCurrentPoints(pts);
                if (polygonError && pts && pts.length >= 3) {
                  setPolygonError('');
                }
              }}
              height={340}
            />
            {polygonError && (
              <p className="text-xs text-[#EF4444] mt-1.5 font-medium">{polygonError}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2D3139]">
            <button
              id="cancel-site-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl border border-[#2D3139]/70 bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-site-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
            >
              Create site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
