import { useState, useEffect, useMemo } from "react";
import { HiPlus, HiPencil, HiTrash, HiCalendar, HiLocationMarker, HiUser, HiClock } from "react-icons/hi";
import { visitService, VISIT_STATUSES } from "../firebase/visitService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/common/Modal";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import VisitModal from "../components/visits/VisitModal";

const STATUS_COLORS = {
  Requested:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Confirmed:  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Completed:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Cancelled:  "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function VisitsPage() {
  const { user, isAgent } = useAuth();
  const toast = useToast();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editVisit, setEditVisit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadVisits(); }, []);

  async function loadVisits() {
    setLoading(true);
    try {
      const data = await visitService.getAll(user?.role, user?.name);
      setVisits(data);
    } catch { toast.error("Failed to load visits"); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    if (statusFilter === "All") return visits;
    return visits.filter(v => v.status === statusFilter);
  }, [visits, statusFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(v => {
      const date = v.visitDate?.toDate
        ? v.visitDate.toDate().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
        : v.visitDate || "No date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(v);
    });
    return groups;
  }, [filtered]);

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await visitService.update(editVisit.id, data);
        toast.success("Visit updated");
      } else {
        const visitData = isAgent ? { ...data, agentName: user.name } : data;
        await visitService.create(visitData);
        toast.success("Visit scheduled");
      }
      setAddModalOpen(false);
      setEditVisit(null);
      loadVisits();
    } catch { toast.error("Failed to save visit"); }
  }

  async function handleStatusChange(visit, status) {
    try {
      await visitService.updateStatus(visit.id, status);
      toast.success(`Visit marked as ${status}`);
      loadVisits();
    } catch { toast.error("Failed to update status"); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await visitService.delete(deleteTarget.id);
      toast.success("Visit deleted");
      setDeleteTarget(null);
      loadVisits();
    } catch { toast.error("Failed to delete visit"); }
    finally { setDeleteLoading(false); }
  }

  const counts = VISIT_STATUSES.reduce((acc, s) => {
    acc[s] = visits.filter(v => v.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Site Visits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {visits.length} total · {counts.Confirmed || 0} confirmed · {counts.Requested || 0} pending
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Schedule Visit
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VISIT_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
            className={`p-3 rounded-2xl border text-center transition-all ${
              statusFilter === s
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{counts[s] || 0}</p>
            <p className={`text-xs font-medium mt-0.5 ${STATUS_COLORS[s]?.split(" ")[2] || "text-slate-500"}`}>{s}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...VISIT_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-violet-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Visit list grouped by date */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No visits found" description="Schedule a property site visit."
          action={<Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Schedule Visit</Button>} />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, dateVisits]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <HiCalendar className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{date}</h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="space-y-3">
                {dateVisits.map(visit => (
                  <div key={visit.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{visit.clientName}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[visit.status] || ""}`}>
                            {visit.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {visit.propertyName && (
                            <span className="flex items-center gap-1"><HiLocationMarker className="w-3.5 h-3.5" />{visit.propertyName}</span>
                          )}
                          {visit.visitTime && (
                            <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" />{visit.visitTime}</span>
                          )}
                          {visit.agentName && (
                            <span className="flex items-center gap-1"><HiUser className="w-3.5 h-3.5" />{visit.agentName}</span>
                          )}
                        </div>
                        {visit.notes && <p className="text-xs text-slate-400 mt-1.5 italic">{visit.notes}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Quick status change */}
                        {visit.status === "Requested" && (
                          <button onClick={() => handleStatusChange(visit, "Confirmed")}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors">
                            Confirm
                          </button>
                        )}
                        {visit.status === "Confirmed" && (
                          <button onClick={() => handleStatusChange(visit, "Completed")}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                            Complete
                          </button>
                        )}
                        <button onClick={() => setEditVisit(visit)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(visit)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitModal isOpen={addModalOpen || !!editVisit} onClose={() => { setAddModalOpen(false); setEditVisit(null); }} onSave={handleSave} visit={editVisit} isAgent={isAgent} agentName={user?.name} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Visit" message={`Delete visit for "${deleteTarget?.clientName}"?`} />
    </div>
  );
}
