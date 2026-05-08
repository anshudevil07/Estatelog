import { useState, useEffect, useMemo } from "react";
import {
  HiPlus, HiPencil, HiTrash, HiEye, HiFilter,
  HiViewGrid, HiViewList, HiLocationMarker, HiHome,
} from "react-icons/hi";
import { propertyService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatFullCurrency, formatDate } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import { ConfirmModal } from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import { TableRowSkeleton } from "../components/common/SkeletonLoader";
import PropertyModal from "../components/property/PropertyModal";
import PropertyDetailModal from "../components/property/PropertyDetailModal";

const ITEMS_PER_PAGE = 6;

const statusOptions = ["All", "Available", "Sold", "Pending"];
const typeOptions = ["All", "Villa", "Apartment", "House", "Condo", "Penthouse", "Townhouse", "Studio", "Cabin", "Cottage"];
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Name A–Z", value: "name_asc" },
];

export default function PropertiesPage() {
  const toast = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid | table

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [detailProperty, setDetailProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } finally {
      setLoading(false);
    }
  }

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...properties];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((p) => p.status === statusFilter);
    if (typeFilter !== "All") list = list.filter((p) => p.type === typeFilter);

    list.sort((a, b) => {
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return new Date(b.listedDate) - new Date(a.listedDate);
    });

    return list;
  }, [properties, search, statusFilter, typeFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter, sortBy]);

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await propertyService.update(editProperty.id, data);
        toast.success("Property updated successfully");
      } else {
        await propertyService.create(data);
        toast.success("Property added successfully");
      }
      await loadProperties();
      setAddModalOpen(false);
      setEditProperty(null);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await propertyService.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      await loadProperties();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Properties</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Add Property
        </Button>
      </div>

      {/* Filters bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or location..."
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {typeOptions.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {/* View toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                aria-label="Grid view"
              >
                <HiViewGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 transition-colors ${viewMode === "table" ? "bg-violet-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                aria-label="Table view"
              >
                <HiViewList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {["Property", "Location", "Price", "Type", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
              </tbody>
            </table>
          </div>
        )
      ) : paginated.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Try adjusting your search or filters, or add a new property."
          action={
            <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
              Add Property
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => setDetailProperty(property)}
              onEdit={() => setEditProperty(property)}
              onDelete={() => setDeleteTarget(property)}
            />
          ))}
        </div>
      ) : (
        <PropertyTable
          properties={paginated}
          onView={(p) => setDetailProperty(p)}
          onEdit={(p) => setEditProperty(p)}
          onDelete={(p) => setDeleteTarget(p)}
        />
      )}

      {/* Pagination */}
      {!loading && filtered.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* Modals */}
      <PropertyModal
        isOpen={addModalOpen || !!editProperty}
        onClose={() => { setAddModalOpen(false); setEditProperty(null); }}
        onSave={handleSave}
        property={editProperty}
      />

      <PropertyDetailModal
        isOpen={!!detailProperty}
        onClose={() => setDetailProperty(null)}
        property={detailProperty}
        onEdit={() => { setEditProperty(detailProperty); setDetailProperty(null); }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

// ─── Property Card (Grid view) ────────────────────────────────────────────────
function PropertyCard({ property, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status} />
        </div>
        {property.featured && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 truncate">{property.name}</h3>
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-3">
          <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span>{property.bedrooms} bd</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>{property.bathrooms} ba</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-violet-600 dark:text-violet-400">
            {formatFullCurrency(property.price)}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={onView} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" title="View details">
              <HiEye className="w-4 h-4" />
            </button>
            <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
              <HiPencil className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property Table (List view) ───────────────────────────────────────────────
function PropertyTable({ properties, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              {["Property", "Location", "Price", "Type", "Beds/Baths", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{p.location}</td>
                <td className="px-4 py-3 text-sm font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap">{formatFullCurrency(p.price)}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{p.type}</td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{p.bedrooms}bd / {p.bathrooms}ba</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><HiEye className="w-4 h-4" /></button>
                    <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
