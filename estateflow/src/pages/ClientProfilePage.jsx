import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiArrowLeft, HiMail, HiPhone, HiUser, HiOfficeBuilding,
  HiCurrencyRupee, HiCalendar, HiPlus, HiTrash, HiPencil,
  HiCheckCircle, HiClock, HiExclamationCircle, HiChat,
  HiLocationMarker, HiDocumentText,
} from "react-icons/hi";
import { clientService } from "../firebase/clientService";
import { paymentService, PAYMENT_STATUSES } from "../firebase/paymentService";
import { clientNoteService } from "../firebase/clientNoteService";
import { visitService } from "../firebase/visitService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatFullCurrency, formatCurrency, formatDate, getInitials } from "../utils/formatters";
import Button from "../components/common/Button";
import Modal, { ConfirmModal } from "../components/common/Modal";
import FormInput, { FormSelect, FormTextarea } from "../components/common/FormInput";
import StatusBadge from "../components/common/StatusBadge";

// ── Payment status colors ─────────────────────────────────────────────────────
const PAY_COLORS = {
  Paid: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Overdue: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  Partial: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

// ── Note type icons ───────────────────────────────────────────────────────────
const NOTE_ICONS = {
  note: "📝", call: "📞", meeting: "🤝", email: "📧",
  payment: "💰", visit: "🏠",
};

export default function ClientProfilePage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [paymentModal, setPaymentModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);
  const [deletePaymentLoading, setDeletePaymentLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (clientId) loadAll();
  }, [clientId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [c, p, n, v] = await Promise.all([
        clientService.getById(clientId),
        paymentService.getByClient(clientId),
        clientNoteService.getByClient(clientId),
        visitService.getAll("admin", ""),
      ]);
      setClient(c);
      setPayments(p);
      setNotes(n);
      // Filter visits for this client
      setVisits(v.filter(vis => vis.clientName === c.name));
    } catch (err) {
      toast.error("Failed to load client profile");
    } finally {
      setLoading(false);
    }
  }

  // ── Payment handlers ────────────────────────────────────────────────────────
  async function handleSavePayment(data, isEdit) {
    try {
      if (isEdit) {
        await paymentService.update(editPayment.id, data);
        toast.success("Payment updated");
      } else {
        await paymentService.create({ ...data, clientId, clientName: client.name });
        // Auto-add a note
        await clientNoteService.create(
          clientId,
          `Payment of ${formatFullCurrency(data.amount)} recorded — ${data.status}`,
          "payment",
          user?.name
        );
        toast.success("Payment recorded");
      }
      setPaymentModal(false);
      setEditPayment(null);
      loadAll();
    } catch { toast.error("Failed to save payment"); }
  }

  async function handleDeletePayment() {
    setDeletePaymentLoading(true);
    try {
      await paymentService.delete(deletePayment.id);
      toast.success("Payment deleted");
      setDeletePayment(null);
      loadAll();
    } catch { toast.error("Failed to delete payment"); }
    finally { setDeletePaymentLoading(false); }
  }

  // ── Note handlers ───────────────────────────────────────────────────────────
  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await clientNoteService.create(clientId, noteText, noteType, user?.name);
      setNoteText("");
      loadAll();
    } catch { toast.error("Failed to add note"); }
    finally { setAddingNote(false); }
  }

  async function handleDeleteNote(id) {
    try {
      await clientNoteService.delete(id);
      loadAll();
    } catch { toast.error("Failed to delete note"); }
  }

  const summary = paymentService.getSummary(payments);
  const progressPct = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Client not found.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Full history and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT COLUMN — Client info ── */}
        <div className="space-y-4">

          {/* Profile card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-violet-600 dark:text-violet-400 text-2xl font-black">{getInitials(client.name)}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{client.name}</h2>
            {client.type && (
              <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                {client.type}
              </span>
            )}

            {/* Contact buttons */}
            <div className="flex gap-2 mt-4">
              {client.phone && (
                <a href={`tel:${client.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800">
                  <HiPhone className="w-4 h-4" /> Call
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800">
                  <HiMail className="w-4 h-4" /> Email
                </a>
              )}
              {client.phone && (
                <a href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors border border-green-200 dark:border-green-800">
                  <span>💬</span> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ── Contact & Basic Details ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contact & Details</h3>
            {[
              { icon: <HiMail className="w-4 h-4" />, label: "Email", value: client.email },
              { icon: <HiPhone className="w-4 h-4" />, label: "Phone", value: client.phone },
              { icon: <HiOfficeBuilding className="w-4 h-4" />, label: "Property Interest", value: client.propertyInterest },
              { icon: <HiCurrencyRupee className="w-4 h-4" />, label: "Budget", value: client.budget },
              { icon: <HiUser className="w-4 h-4" />, label: "Assigned Agent", value: client.assignedTo || "Unassigned" },
              { icon: <HiCalendar className="w-4 h-4" />, label: "Added On", value: formatDate(client.createdAt) },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words">{item.value}</p>
                </div>
              </div>
            ))}
            {client.notes && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{client.notes}</p>
              </div>
            )}
          </div>

          {/* ── Applicant Details ── */}
          {(client.dob || client.panNumber || client.aadharNumber || client.flatNo || client.address) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs">👤</span>
                Applicant Details
              </h3>
              {[
                { label: "Date of Birth", value: client.dob },
                { label: "Flat / Unit No.", value: client.flatNo },
                { label: "PAN Number", value: client.panNumber },
                { label: "Aadhaar Number", value: client.aadharNumber },
                { label: "Address", value: client.address },
              ].filter(i => i.value).map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words mt-0.5">
                    {item.label === "PAN Number" ? (
                      <span className="font-mono tracking-wider">{item.value}</span>
                    ) : item.label === "Aadhaar Number" ? (
                      <span className="font-mono tracking-wider">
                        {/* Mask middle digits for privacy */}
                        {item.value.replace(/(\d{4})\s?(\d{4})\s?(\d{4})/, "XXXX XXXX $3")}
                      </span>
                    ) : item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Co-Applicant Details ── */}
          {client.coApplicantName && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs">👥</span>
                Co-Applicant
                {client.coApplicantRelation && (
                  <span className="text-xs font-normal text-slate-400">({client.coApplicantRelation})</span>
                )}
              </h3>
              {[
                { label: "Name", value: client.coApplicantName },
                { label: "Phone", value: client.coApplicantPhone },
                { label: "Email", value: client.coApplicantEmail },
                { label: "Date of Birth", value: client.coApplicantDob },
                { label: "PAN Number", value: client.coApplicantPan },
                { label: "Aadhaar Number", value: client.coApplicantAadhar },
              ].filter(i => i.value).map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {item.label.includes("PAN") ? (
                      <span className="font-mono tracking-wider">{item.value}</span>
                    ) : item.label.includes("Aadhaar") ? (
                      <span className="font-mono tracking-wider">
                        {item.value.replace(/(\d{4})\s?(\d{4})\s?(\d{4})/, "XXXX XXXX $3")}
                      </span>
                    ) : item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Cost Sheet Summary ── */}
          {client.costGrandTotal > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-violet-50 dark:bg-violet-900/20">
                <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">💰 Cost Sheet Summary</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  { label: "Area", value: client.area ? `${Number(client.area).toLocaleString("en-IN")} sq.ft.` : null },
                  { label: "Rate / sq.ft.", value: client.ratePerSqft ? `₹${Number(client.ratePerSqft).toLocaleString("en-IN")}` : null },
                  { label: "Base Value", value: client.costBaseValue ? `₹${Number(client.costBaseValue).toLocaleString("en-IN")}` : null },
                  { label: "Additional Charges", value: client.costChargesTotal ? `₹${Number(client.costChargesTotal).toLocaleString("en-IN")}` : null },
                  { label: `GST (${client.gstRate || 5}%)`, value: client.costGstAmount ? `₹${Number(client.costGstAmount).toLocaleString("en-IN")}` : null },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex justify-between px-5 py-2.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{row.label}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 bg-violet-600">
                  <span className="text-sm font-bold text-white">Grand Total</span>
                  <span className="text-base font-black text-white">₹{Number(client.costGrandTotal).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Site visits summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <HiLocationMarker className="w-4 h-4 text-violet-500" /> Site Visits ({visits.length})
            </h3>
            {visits.length === 0 ? (
              <p className="text-xs text-slate-400">No visits scheduled yet</p>
            ) : (
              <div className="space-y-2">
                {visits.map(v => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{v.propertyName || "Property visit"}</p>
                      <p className="text-xs text-slate-400">{v.visitDate ? formatDate(v.visitDate) : "—"} {v.visitTime && `· ${v.visitTime}`}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      v.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      v.status === "Confirmed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      v.status === "Cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{v.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN — Payments + Timeline ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Payment summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Amount", value: formatCurrency(summary.total), color: "text-slate-900 dark:text-white", bg: "bg-white dark:bg-slate-800" },
              { label: "Paid", value: formatCurrency(summary.paid), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Pending", value: formatCurrency(summary.pending), color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Overdue", value: formatCurrency(summary.overdue), color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-4 border border-slate-200 dark:border-slate-700 ${s.bg}`}>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payment progress bar */}
          {summary.total > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Progress</p>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPct}% paid</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                <span>Paid: {formatFullCurrency(summary.paid)}</span>
                <span>Balance: {formatFullCurrency(summary.balance)}</span>
              </div>
            </div>
          )}

          {/* Payment history table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <HiCurrencyRupee className="w-5 h-5 text-violet-500" /> Payment History
              </h3>
              <Button size="sm" icon={<HiPlus className="w-3.5 h-3.5" />} onClick={() => setPaymentModal(true)}>
                Add Payment
              </Button>
            </div>

            {payments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">No payments recorded yet</p>
                <button onClick={() => setPaymentModal(true)}
                  className="mt-3 text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
                  + Record first payment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      {["Description", "Amount", "Date", "Status", "Mode", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{p.description || "—"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatFullCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(p.paymentDate || p.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAY_COLORS[p.status] || ""}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{p.mode || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditPayment(p); setPaymentModal(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <HiPencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeletePayment(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <HiTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <HiDocumentText className="w-5 h-5 text-violet-500" /> Activity Timeline
              </h3>
            </div>

            {/* Add note form */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <select value={noteType} onChange={e => setNoteType(e.target.value)}
                  className="text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 shrink-0">
                  {Object.entries(NOTE_ICONS).map(([k, v]) => (
                    <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
                <input
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note, call log, or update..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400"
                />
                <Button type="submit" size="sm" loading={addingNote} icon={<HiPlus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </form>
            </div>

            {/* Timeline */}
            {notes.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">No activity yet. Add a note above.</p>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                  <div className="space-y-4">
                    {notes.map(note => (
                      <div key={note.id} className="flex gap-4 relative">
                        {/* Icon dot */}
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 text-sm">
                          {NOTE_ICONS[note.type] || "📝"}
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.text}</p>
                            <button onClick={() => handleDeleteNote(note.id)}
                              className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors shrink-0">
                              <HiTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {note.addedBy && (
                              <span className="text-xs text-slate-400">by {note.addedBy}</span>
                            )}
                            <span className="text-xs text-slate-300 dark:text-slate-600">
                              {note.createdAt ? formatDate(note.createdAt) : "Just now"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal}
        onClose={() => { setPaymentModal(false); setEditPayment(null); }}
        onSave={handleSavePayment}
        payment={editPayment}
      />

      <ConfirmModal
        isOpen={!!deletePayment}
        onClose={() => setDeletePayment(null)}
        onConfirm={handleDeletePayment}
        loading={deletePaymentLoading}
        title="Delete Payment"
        message={`Delete payment of ${formatFullCurrency(deletePayment?.amount)}?`}
      />
    </div>
  );
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ isOpen, onClose, onSave, payment }) {
  const isEdit = !!payment;
  const [form, setForm] = useState({
    description: "", amount: "", status: "Pending",
    paymentDate: "", mode: "Bank Transfer", receipt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      const date = payment.paymentDate?.toDate
        ? payment.paymentDate.toDate().toISOString().split("T")[0]
        : payment.paymentDate || "";
      setForm({ ...form, ...payment, amount: String(payment.amount || ""), paymentDate: date });
    } else {
      setForm({ description: "", amount: "", status: "Pending", paymentDate: new Date().toISOString().split("T")[0], mode: "Bank Transfer", receipt: "" });
    }
  }, [payment, isOpen]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount) return;
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) }, isEdit);
    } finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Payment" : "Record Payment"} size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput label="Description" name="description" value={form.description} onChange={handleChange}
          placeholder="Token amount, installment 1, final payment..." />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange}
            placeholder="500000" required />
          <FormInput label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}>
            {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </FormSelect>
          <FormSelect label="Payment Mode" name="mode" value={form.mode} onChange={handleChange}>
            {["Bank Transfer", "Cash", "Cheque", "UPI", "NEFT/RTGS", "Other"].map(m => <option key={m}>{m}</option>)}
          </FormSelect>
        </div>
        <FormInput label="Receipt / Reference No." name="receipt" value={form.receipt} onChange={handleChange}
          placeholder="UTR number, cheque no., etc." />
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Record Payment"}</Button>
        </div>
      </form>
    </Modal>
  );
}
