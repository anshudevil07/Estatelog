import { useState, useEffect, useMemo } from "react";
import { HiPlus, HiPencil, HiTrash, HiEye, HiMail, HiPhone, HiUser } from "react-icons/hi";
import { clientService } from "../firebase/clientService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, getInitials } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import { ConfirmModal } from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import ClientModal from "../components/clients/ClientModal";
import ClientDetailDrawer from "../components/clients/ClientDetailDrawer";

const ITEMS_PER_PAGE = 9;
const CLIENT_TYPES = ["All", "Buyer", "Seller", "Investor", "Tenant"];

export default function ClientsPage() {
  const { user, isAgent } = useAuth();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await clientService.getAll(user?.role, user?.name);
      setClients(data);
    } catch { toast.error("Failed to load clients"); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let list = [...clients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q));
    }
    if (typeFilter !== "All") list = list.filter(c => c.type === typeFilter);
    return list;
  }, [clients, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [search, typeFilter]);

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await clientService.update(editClient.id, data);
        toast.success("Client updated");
      } else {
        const clientData = isAgent ? { ...data, assignedTo: user.name } : data;
        await clientService.create(clientData);
        toast.success("Client added");
      }
      setAddModalOpen(false);
      setEditClient(null);
      loadClients();
    } catch { toast.error("Failed to save client"); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await clientService.delete(deleteTarget.id);
      toast.success("Client deleted");
      setDeleteTarget(null);
      loadClients();
    } catch { toast.error("Failed to delete client"); }
    finally { setDeleteLoading(false); }
  }

  const typeColors = {
    Buyer: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Seller: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    Investor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    Tenant: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} clients</p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Add Client</Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone..." className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          {CLIENT_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState title="No clients found" description="Add your first client to get started."
          action={<Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Add Client</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(client => (
            <div key={client.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">{getInitials(client.name)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{client.name}</p>
                    {client.type && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[client.type] || "bg-slate-100 text-slate-600"}`}>
                        {client.type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setDetailClient(client)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><HiEye className="w-4 h-4" /></button>
                  <button onClick={() => setEditClient(client)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(client)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-1.5">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <HiMail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <HiPhone className="w-3.5 h-3.5 shrink-0" /><span>{client.phone}</span>
                  </div>
                )}
                {client.propertyInterest && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>🏠</span><span className="truncate">{client.propertyInterest}</span>
                  </div>
                )}
                {client.budget && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>💰</span><span>{client.budget}</span>
                  </div>
                )}
              </div>

              {client.assignedTo && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5 text-xs text-slate-400">
                  <HiUser className="w-3.5 h-3.5" /><span>{client.assignedTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > ITEMS_PER_PAGE && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
      )}

      <ClientModal isOpen={addModalOpen || !!editClient} onClose={() => { setAddModalOpen(false); setEditClient(null); }} onSave={handleSave} client={editClient} isAgent={isAgent} />
      <ClientDetailDrawer isOpen={!!detailClient} onClose={() => setDetailClient(null)} client={detailClient} onEdit={() => { setEditClient(detailClient); setDetailClient(null); }} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Client" message={`Delete client "${deleteTarget?.name}"?`} />
    </div>
  );
}
