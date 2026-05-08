// Status badge component used across properties and leads

import { getStatusColor } from "../../utils/formatters";

export default function StatusBadge({ status, size = "sm" }) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${getStatusColor(status)}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
}
