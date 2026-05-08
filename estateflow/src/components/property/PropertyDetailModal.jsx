import { HiLocationMarker, HiPencil, HiHome, HiCalendar, HiUser } from "react-icons/hi";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatFullCurrency, formatDate } from "../../utils/formatters";

export default function PropertyDetailModal({ isOpen, onClose, property, onEdit }) {
  if (!property) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Details" size="lg">
      {/* Image */}
      <div className="h-56 rounded-xl overflow-hidden mb-5 -mx-0">
        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{property.name}</h2>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mt-1">
            <HiLocationMarker className="w-4 h-4 shrink-0" />
            <span>{property.location}</span>
          </div>
        </div>
        <StatusBadge status={property.status} size="md" />
      </div>

      {/* Price */}
      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-5">
        {formatFullCurrency(property.price)}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Type", value: property.type },
          { label: "Bedrooms", value: `${property.bedrooms} bd` },
          { label: "Bathrooms", value: `${property.bathrooms} ba` },
          { label: "Area", value: `${property.sqft?.toLocaleString()} sqft` },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {property.description && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
        {property.agent && (
          <div className="flex items-center gap-1.5">
            <HiUser className="w-4 h-4" />
            <span>Listed by <span className="font-medium text-slate-700 dark:text-slate-300">{property.agent}</span></span>
          </div>
        )}
        {property.listedDate && (
          <div className="flex items-center gap-1.5">
            <HiCalendar className="w-4 h-4" />
            <span>Listed {formatDate(property.listedDate)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button icon={<HiPencil className="w-4 h-4" />} onClick={onEdit}>Edit Property</Button>
      </div>
    </Modal>
  );
}
