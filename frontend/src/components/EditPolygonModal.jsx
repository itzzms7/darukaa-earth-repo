import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PolygonMapEditor from './PolygonMapEditor.jsx';

export default function EditPolygonModal({ isOpen, onClose, geometry, onSave }) {
  const [currentPoints, setCurrentPoints] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (geometry?.coordinates?.[0]) {
      setCurrentPoints(geometry.coordinates[0]);
    } else {
      setCurrentPoints([]);
    }
    setError('');
  }, [geometry, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!currentPoints || currentPoints.length < 3) {
      setError('A polygon boundary requires at least 3 corner points.');
      return;
    }

    // Ensure polygon is closed
    const pts = [...currentPoints];
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      pts.push([first[0], first[1]]);
    }

    onSave({
      type: 'Polygon',
      coordinates: [pts],
    });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="edit-polygon-dialog"
        className="w-full max-w-2xl text-[#F3F4F6] rounded-2xl p-5 max-h-[94vh] flex flex-col blurred-card-bg"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3139]">
          <div>
            <h2 className="text-base font-bold text-[#F3F4F6]">Edit site boundary map</h2>
            <p className="text-xs text-[#9CA3AF] font-medium mt-0.5">
              Click map to add vertices or drag points with the mouse to reshape the site.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-3 overflow-y-auto pr-1 flex-1">
          {/* Interactive Map Drawable Interface + Live Coordinates Section */}
          <PolygonMapEditor
            initialPoints={geometry?.coordinates?.[0] || []}
            onChange={(newPoints) => {
              setCurrentPoints(newPoints);
              if (error && newPoints && newPoints.length >= 3) {
                setError('');
              }
            }}
            height={380}
          />
          {error && (
            <p className="text-xs text-[#EF4444] mt-1.5 font-medium">{error}</p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 mt-2 border-t border-[#2D3139]">
          <button
            id="cancel-polygon-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl border border-[#2D3139]/70 bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-polygon-btn"
            type="button"
            onClick={handleSave}
            className="px-4.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
          >
            Save boundary
          </button>
        </div>
      </div>
    </div>
  );
}
