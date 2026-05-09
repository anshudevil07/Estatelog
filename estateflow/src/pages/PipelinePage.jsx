import { useState, useEffect } from "react";
import { HiPlus, HiTrash, HiPencil, HiCurrencyRupee, HiUser, HiDotsVertical } from "react-icons/hi";
import { pipelineService, STAGES } from "../firebase/pipelineService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, getInitials } from "../utils/formatters";
import { ConfirmModal } from "../components/common/Modal";
import Button from "../components/common/Button";
import PipelineDealModal from "../components/pipeline/PipelineDealModal";

// Stage color config
const STAGE_COLORS = {
  "New Lead":    { bg: "bg-slate-100 dark:bg-slate-800",    header: "bg-slate-200 dark:bg-slate-700",    dot: "bg-slate-400",    text: "text-slate-600 dark:text-slate-300" },
  "Site Visit":  { bg: "bg-blue-50 dark:bg-blue-900/20",    header: "bg-blue-100 dark:bg-blue-900/40",   dot: "bg-blue-400",     text: "text-blue-600 dark:text-blue-300" },
  "Negotiation": { bg: "bg-amber-50 dark:bg-amber-900/20",  header: "bg-amber-100 dark:bg-amber-900/40", dot: "bg-amber-400",    text: "text-amber-600 dark:text-amber-300" },
  "Agreement":   { bg: "bg-violet-50 dark:bg-violet-900/20",header: "bg-violet-100 dark:bg-violet-900/40",dot: "bg-violet-400",  text: "text-violet-600 dark:text-violet-300" },
  "Closed":      { bg: "bg-emerald-50 dark:bg-emerald-900/20",header: "bg-emerald-100 dark:bg-emerald-900/40",dot: "bg-emerald-400",text: "text-emerald-600 dark:text-emerald-300" },
};

export default function PipelinePage() {
  const { user, isAgent } = useAuth();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => { loadDeals(); }, []);

  async function loadDeals() {
    setLoading(true);
    try {
      const data = await pipelineService.getAll(user?.role, user?.name);
      setDeals(data);
    } catch { toast.error("Failed to load pipeline"); }
    finally { setLoading(false); }
  }

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await pipelineService.update(editDeal.id, data);
        toast.success("Deal updated");
      } else {
        const dealData = isAgent ? { ...data, assignedTo: user.name } : data;
        await pipelineService.create(dealData);
        toast.success("Deal added to pipeline");
      }
      setAddModalOpen(false);
      setEditDeal(null);
      loadDeals();
    } catch { toast.error("Failed to save deal"); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await pipelineService.delete(deleteTarget.id);
      toast.success("Deal removed");
      setDeleteTarget(null);
      loadDeals();
    } catch { toast.error("Failed to delete deal"); }
    finally { setDeleteLoading(false); }
  }

  // Drag and drop handlers
  function handleDragStart(e, id) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(e, stage) {
    e.preventDefault();
    if (!draggedId) return;
    const deal = deals.find(d => d.id === draggedId);
    if (!deal || deal.stage === stage) { setDraggedId(null); return; }
    // Optimistic update
    setDeals(prev => prev.map(d => d.id === draggedId ? { ...d, stage } : d));
    try {
      await pipelineService.updateStage(draggedId, stage);
      toast.success(`Moved to "${stage}"`);
    } catch {
      toast.error("Failed to move deal");
      loadDeals();
    }
    setDraggedId(null);
  }

  function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {});

  const totalValue = deals.filter(d => d.stage === "Closed").reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deal Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {deals.length} deals · {formatCurrency(totalValue)} closed
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Add Deal
        </Button>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-5 gap-2">
        {STAGES.map(stage => {
          const c = STAGE_COLORS[stage];
          const count = dealsByStage[stage]?.length || 0;
          const val = dealsByStage[stage]?.reduce((s, d) => s + (Number(d.value) || 0), 0) || 0;
          return (
            <div key={stage} className={`rounded-xl p-3 text-center ${c.bg}`}>
              <p className={`text-xs font-semibold ${c.text}`}>{stage}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(val)}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(s => (
            <div key={s} className="min-w-[260px] bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24" />
              {[1,2].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const c = STAGE_COLORS[stage];
            const stageDeals = dealsByStage[stage] || [];
            return (
              <div
                key={stage}
                className={`min-w-[260px] max-w-[260px] rounded-2xl flex flex-col ${c.bg} border border-slate-200 dark:border-slate-700`}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className={`px-4 py-3 rounded-t-2xl flex items-center justify-between ${c.header}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    <span className={`text-sm font-semibold ${c.text}`}>{stage}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2.5 min-h-[200px]">
                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-xs text-slate-400">Drop here</p>
                    </div>
                  )}
                  {stageDeals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onEdit={() => setEditDeal(deal)}
                      onDelete={() => setDeleteTarget(deal)}
                      onDragStart={e => handleDragStart(e, deal.id)}
                      isDragging={draggedId === deal.id}
                    />
                  ))}
                </div>

                {/* Add button */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => { setAddModalOpen(true); }}
                    className="w-full py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                  >
                    <HiPlus className="w-3.5 h-3.5" /> Add deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PipelineDealModal
        isOpen={addModalOpen || !!editDeal}
        onClose={() => { setAddModalOpen(false); setEditDeal(null); }}
        onSave={handleSave}
        deal={editDeal}
        isAgent={isAgent}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Deal"
        message={`Remove "${deleteTarget?.clientName}" from the pipeline?`}
      />
    </div>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, onEdit, onDelete, onDragStart, isDragging }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? "opacity-40 scale-95" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">
              {getInitials(deal.clientName)}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{deal.clientName}</p>
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(p => !p)} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <HiDotsVertical className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-6 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <HiPencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <HiTrash className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {deal.propertyName && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">🏠 {deal.propertyName}</p>
      )}

      {deal.value && (
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <HiCurrencyRupee className="w-3.5 h-3.5" />
          <span className="text-sm font-bold">{formatCurrency(Number(deal.value))}</span>
        </div>
      )}

      {deal.assignedTo && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <HiUser className="w-3 h-3" />
          <span>{deal.assignedTo}</span>
        </div>
      )}
    </div>
  );
}
