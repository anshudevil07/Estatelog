import { useEffect } from "react";
import { HiX, HiMail, HiPhone, HiUser, HiOfficeBuilding, HiCurrencyDollar, HiPencil, HiCalendar } from "react-icons/hi";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDate } from "../../utils/formatters";

export default function LeadDetailDrawer({ isOpen, onClose, lead, onEdit }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!lead) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md z-50
          bg-white dark:bg-slate-900
          border-l border-slate-200 dark:border-slate-700
          shadow-2xl flex flex-col
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-label="Lead details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name + status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{lead.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">via {lead.source}</p>
            </div>
            <StatusBadge status={lead.status} size="md" />
          </div>

          {/* Contact info */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Info</h4>
            <div className="flex items-center gap-3 text-sm">
              <HiMail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${lead.email}`} className="text-violet-600 dark:text-violet-400 hover:underline">{lead.email}</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HiPhone className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`tel:${lead.phone}`} className="text-slate-700 dark:text-slate-300">{lead.phone}</a>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Details</h4>
            {[
              { icon: <HiUser className="w-4 h-4" />, label: "Assigned To", value: lead.assignedTo || "Unassigned" },
              { icon: <HiOfficeBuilding className="w-4 h-4" />, label: "Property Interest", value: lead.propertyInterest || "—" },
              { icon: <HiCurrencyDollar className="w-4 h-4" />, label: "Budget", value: lead.budget || "—" },
              { icon: <HiCalendar className="w-4 h-4" />, label: "Added", value: formatDate(lead.createdAt) },
              { icon: <HiCalendar className="w-4 h-4" />, label: "Last Contact", value: formatDate(lead.lastContact) },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                {lead.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          <Button icon={<HiPencil className="w-4 h-4" />} className="flex-1" onClick={onEdit}>Edit Lead</Button>
        </div>
      </div>
    </>
  );
}
