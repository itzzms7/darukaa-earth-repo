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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]">
      <div 
        id="new-project-dialog"
        className="w-full max-w-md bg-white rounded-lg border border-[#DEC8D4] p-6 shadow-xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EBD7E2]">
          <h2 className="text-base font-semibold text-[#231C20]">New project</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#756770] hover:text-[#231C20] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4">
          <div className="space-y-1.5">
            <label htmlFor="project-name-input" className="block text-xs font-medium text-[#231C20]">
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
              className={`w-full px-3 py-2 text-sm bg-[#FAF6F8] rounded border transition-colors outline-none ${
                error
                  ? 'border-[#E03137] focus:border-[#E03137]'
                  : 'border-[#DEC8D4] focus:border-[#D65D80] focus:ring-1 focus:ring-[#D65D80]/20'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-[#E03137] mt-1 font-medium">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-6 mt-4 border-t border-[#EBD7E2]">
            <button
              id="cancel-project-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#756770] hover:text-[#231C20] rounded border border-[#DEC8D4] bg-white hover:bg-[#FAF6F8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-project-btn"
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#D65D80] hover:bg-[#C44E72] rounded transition-colors active:scale-[0.98] shadow-xs cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
