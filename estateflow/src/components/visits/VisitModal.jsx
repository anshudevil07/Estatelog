import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect } from "../common/FormInput";
import { VISIT_STATUSES } from "../../firebase/visitService";

const defaultForm = {
  clientName: "", clientPhone: "", propertyName: "",
  visitDate: "", visitTime: "", agentName: "",
  status: "Requested", notes: "",
};

export default function VisitModal({ isOpen, onClose, onSave, visit, isAgent, agentName }) {
  const isEdit = !!visit;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visit) {
      const visitDate = visit.visitDate?.toDate
        ? visit.visitDate.toDate().toISOString().split("T")[0]
        : visit.visitDate || "";
      setForm({ ...defaultForm, ...visit, visitDate });
    } else {
      setForm({ ...defaultForm, agentName: isAgent ? agentName : "" });
    }
  }, [visit, isOpen, isAgent, agentName]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    setSaving(true);
    try { await onSave(form, isEdit); }
    finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Visit" : "Schedule Site Visit"} size="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Client Name" name="clientName" value={form.clientName} onChange={handleChange} placeholder="Rahul Sharma" required />
          <FormInput label="Client Phone" name="clientPhone" type="tel" value={form.clientPhone} onChange={handleChange} placeholder="+91 98765 43210" />
        </div>
        <FormInput label="Property Name / Location" name="propertyName" value={form.propertyName} onChange={handleChange} placeholder="Sunset Villa, Mumbai" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Visit Date" name="visitDate" type="date" value={form.visitDate} onChange={handleChange} required />
          <FormInput label="Visit Time" name="visitTime" type="time" value={form.visitTime} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Agent Name" name="agentName" value={form.agentName} onChange={handleChange} placeholder="Agent name" disabled={isAgent} />
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}>
            {VISIT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </FormSelect>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            placeholder="Any special instructions..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Schedule Visit"}</Button>
        </div>
      </form>
    </Modal>
  );
}
