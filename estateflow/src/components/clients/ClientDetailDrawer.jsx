import { useEffect } from "react";
import { HiX, HiMail, HiPhone, HiUser, HiOfficeBuilding, HiCurrencyRupee, HiPencil } from "react-icons/hi";
import Button from "../common/Button";
import { formatDate } from "../../utils/formatters";

const typeColors = {
  Buyer: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Seller: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Investor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  Tenant: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

export default function ClientDetailDrawer({ isOpen, onClose, client, onEdit }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!client) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Client Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{client.name}</h3>
              {client.type && (
                <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[client.type] || ""}`}>
                  {client.type}
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</h4>
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <HiMail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${client.email}`} className="text-violet-600 dark:text-violet-400 hover:underline">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <HiPhone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${client.phone}`} className="text-slate-700 dark:text-slate-300">{client.phone}</a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</h4>
            {[
              { icon: <HiOfficeBuilding className="w-4 h-4" />, label: "Property Interest", value: client.propertyInterest },
              { icon: <HiCurrencyRupee className="w-4 h-4" />, label: "Budget", value: client.budget },
              { icon: <HiUser className="w-4 h-4" />, label: "Assigned To", value: client.assignedTo || "Unassigned" },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {client.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          <Button icon={<HiPencil className="w-4 h-4" />} className="flex-1" onClick={onEdit}>Edit Client</Button>
        </div>
      </div>
    </>
  );
}
