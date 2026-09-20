import { X } from 'lucide-react';

export default function ProjectDetailsModal({ isOpen, onClose, project, sitesCount, analyticsCount }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        id="project-details-dialog"
        className="w-full max-w-md text-[#F3F4F6] rounded-2xl p-6 blurred-card-bg"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
          <h2 className="text-base font-semibold text-[#F3F4F6]">Project details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Name</span>
            <span className="font-medium text-[#F3F4F6]">{project.name}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Project ID</span>
            <span className="font-mono text-blue-400 font-medium">{project.id}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Owner ID</span>
            <span className="font-mono text-[#F3F4F6]">{project.owner_id || 1}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Created</span>
            <span className="text-[#F3F4F6]">{project.created_at || 'Recent'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Sites</span>
            <span className="font-medium text-[#F3F4F6]">{sitesCount} sites registered</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#22252C]/60">
            <span className="text-[#9CA3AF]">Data records</span>
            <span className="font-medium text-[#F3F4F6]">{analyticsCount} measurements</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#9CA3AF]">Spatial reference</span>
            <span className="font-mono text-blue-400">EPSG:4326 (WGS 84)</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-2 border-t border-[#2D3139]">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 text-xs font-semibold rounded-xl cursor-pointer btn-crystal-blue"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
