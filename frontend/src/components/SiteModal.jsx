import { useState } from 'react';
import { X } from 'lucide-react';
import PolygonMapEditor from './PolygonMapEditor.jsx';

export default function SiteModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [currentPoints, setCurrentPoints] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Enter a site name.');
      return;
    }

    if (!currentPoints || currentPoints.length < 4) {
      alert('A site requires at least 4 coordinate points to form a polygon.');
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px]">
      <div
        id="new-site-dialog"
        className="w-full max-w-2xl bg-white rounded-lg border border-[#DEC8D4] p-5 shadow-xl max-h-[94vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EBD7E2]">
          <h2 className="text-base font-semibold text-[#231C20]">New site</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#756770] hover:text-[#231C20] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-3 overflow-y-auto pr-1 flex-1 space-y-3.5">
          {/* Site Name Field */}
          <div>
            <label htmlFor="site-name-input" className="block text-xs font-medium text-[#231C20] mb-1">
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
              className={`w-full px-3 py-1.5 text-xs bg-[#FAF6F8] rounded border transition-colors outline-none ${
                nameError
                  ? 'border-[#E03137] focus:border-[#E03137]'
                  : 'border-[#DEC8D4] focus:border-[#D65D80]'
              }`}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-[#E03137] mt-1 font-medium">{nameError}</p>
            )}
          </div>

          {/* Interactive Map Drawable Interface + Live Coordinates Section */}
          <div>
            <label className="block text-xs font-medium text-[#231C20] mb-1.5">
              Draw site boundary on map
            </label>
            <PolygonMapEditor
              onChange={(pts) => setCurrentPoints(pts)}
              height={260}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBD7E2]">
            <button
              id="cancel-site-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#756770] hover:text-[#231C20] rounded border border-[#DEC8D4] bg-white hover:bg-[#FAF6F8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-site-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#D65D80] hover:bg-[#C44E72] rounded transition-colors active:scale-[0.98] shadow-xs cursor-pointer"
            >
              Create site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
