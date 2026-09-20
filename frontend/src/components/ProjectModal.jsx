import { useState } from 'react';
import { X } from 'lucide-react';

export default function ProjectModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a project name.');
      return;
    }
    onCreate(name.trim());
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="new-project-dialog"
        className="w-full max-w-md text-[#F3F4F6] rounded-2xl p-6 blurred-card-bg"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
          <h2 className="text-base font-semibold text-[#F3F4F6]">New project</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4">
          <div className="space-y-1.5">
            <label htmlFor="project-name-input" className="block text-xs font-medium text-[#9CA3AF]">
              Project name
            </label>
            <input
              id="project-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Western Ghats Agroforestry"
              className={`w-full px-3.5 py-2 text-sm bg-white/[0.04] text-[#F3F4F6] placeholder-[#6B7280] rounded-xl border transition-all outline-none ${
                error
                  ? 'border-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#2D3139]/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-6 mt-4 border-t border-[#2D3139]">
            <button
              id="cancel-project-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl border border-[#2D3139]/70 bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-project-btn"
              type="submit"
              className="px-4.5 py-2 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
