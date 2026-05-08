import { useState, useEffect, useMemo } from "react";
import { HiPlus, HiPencil, HiTrash, HiEye, HiMail, HiPhone } from "react-icons/hi";
import { leadService, agentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import { ConfirmModal } from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { TableRowSkeleton } from "../components/common/SkeletonLoader";
import LeadModal from "../components/leads/LeadModal";
import LeadDetailDrawer from "../components/leads/LeadDetailDrawer";

const ITEMS_PER_PAGE = 8;
const statusOptions = ["All", "New", "Contacted", "Interested", "Closed"];
const sourceOptions = ["All", "Website", "Referral", "LinkedIn", "Google Ads", "Instagram", "Cold Call"];

export default function LeadsPage() {
  const toast = useToast();
  const { user, isAgent } = useAuth(); // know who is logged in

  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Agents only fetch their own leads — no need to fetch agents list
      if (isAgent) {
        const leadsData = await leadService.getAll(user?.role, user?.name);
        setLeads(leadsData);
      } else {
        // Admin and Manager fetch all leads + agents list for assignment
        const [leadsData, agentsData] = await Promise.all([
          leadService.getAll(user?.role, user?.name),
          agentService.getAgents().catch(() => []), // graceful fallback
        ]);
        setLeads(leadsData);
        setAgents(agentsData);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = [...leads];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((l) => l.status === statusFilter);
    if (sourceFilter !== "All") list = list.filter((l) => l.source === sourceFilter);
    list.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [leads, search, statusFilter, sourceFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, sourceFilter, sortBy]);

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await leadService.update(editLead.id, data);
        toast.success("Lead updated successfully");
      } else {
        // Agents: auto-assign lead to themselves
        const leadData = isAgent
          ? { ...data, assignedTo: user.name }
          : data;
        await leadService.create(leadData);
        toast.success("Lead added successfully");
      }
      setAddModalOpen(false);
      setEditLead(null);
      // Reload data after modal closes — errors here won't affect the success toast
      loadData();
    } catch (err) {
      console.error("Save lead error:", err);
      toast.error("Failed to save lead. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await leadService.delete(deleteTarget.id);
      toast.success(`Lead "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"} total
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone..." className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500">
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500">
              {sourceOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="newest">Newest First</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {["New", "Contacted", "Interested", "Closed"].map((s) => {
          const count = leads.filter((l) => l.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-violet-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400"
              }`}
            >
              {s} <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Lead", "Contact", "Source", "Assigned To", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}</tbody>
          </table>
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try adjusting your filters or add a new lead."
          action={<Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Add Lead</Button>}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    {["Lead", "Contact", "Source", "Assigned To", "Status", "Added", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginated.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{lead.propertyInterest}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <HiMail className="w-3 h-3" /><span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <HiPhone className="w-3 h-3" /><span>{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{lead.source}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{lead.assignedTo}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-400">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetailLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><HiEye className="w-4 h-4" /></button>
                          <button onClick={() => setEditLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((lead) => (
              <div key={lead.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{lead.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.propertyInterest}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <HiMail className="w-3.5 h-3.5" /><span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <HiPhone className="w-3.5 h-3.5" /><span>{lead.phone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">via {lead.source} · {formatDate(lead.createdAt)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><HiEye className="w-4 h-4" /></button>
                    <button onClick={() => setEditLead(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(lead)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && filtered.length > ITEMS_PER_PAGE && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
      )}

      <LeadModal
        isOpen={addModalOpen || !!editLead}
        onClose={() => { setAddModalOpen(false); setEditLead(null); }}
        onSave={handleSave}
        lead={editLead}
        agents={agents}
        isAgent={isAgent}
      />
      <LeadDetailDrawer isOpen={!!detailLead} onClose={() => setDetailLead(null)} lead={detailLead} onEdit={() => { setEditLead(detailLead); setDetailLead(null); }} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Lead" message={`Are you sure you want to delete lead "${deleteTarget?.name}"?`} />
    </div>
  );
}
