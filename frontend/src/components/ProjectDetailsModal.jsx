import { X } from 'lucide-react';

export default function ProjectDetailsModal({ isOpen, onClose, project, sitesCount, analyticsCount }) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px]">
      <div
        id="project-details-dialog"
        className="w-full max-w-md bg-white rounded-lg border border-[#F0E2EA] p-6 shadow-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E2EA]">
          <h2 className="text-base font-semibold text-[#231C20]">Project details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#756770] hover:text-[#231C20] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Name</span>
            <span className="font-medium text-[#231C20]">{project.name}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Project ID</span>
            <span className="font-mono text-[#231C20]">{project.id}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Owner ID</span>
            <span className="font-mono text-[#231C20]">{project.owner_id || 1}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Created</span>
            <span className="text-[#231C20]">{project.created_at || 'Recent'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Sites</span>
            <span className="font-medium text-[#231C20]">{sitesCount} sites registered</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#FAF0F4]">
            <span className="text-[#756770]">Data records</span>
            <span className="font-medium text-[#231C20]">{analyticsCount} measurements</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#756770]">Spatial reference</span>
            <span className="font-mono text-[#231C20]">EPSG:4326 (WGS 84)</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-2 border-t border-[#F0E2EA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#231C20] bg-[#FAF5F7] hover:bg-[#F5EBF0] rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
