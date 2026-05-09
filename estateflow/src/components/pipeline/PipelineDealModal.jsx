import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect } from "../common/FormInput";
import { STAGES } from "../../firebase/pipelineService";

const defaultForm = {
  clientName: "", phone: "", email: "",
  propertyName: "", value: "", stage: "New Lead",
  assignedTo: "", notes: "",
};

export default function PipelineDealModal({ isOpen, onClose, onSave, deal, isAgent }) {
  const isEdit = !!deal;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(deal ? { ...defaultForm, ...deal, value: String(deal.value || "") } : defaultForm);
  }, [deal, isOpen]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    setSaving(true);
    try {
      await onSave({ ...form, value: Number(form.value) || 0 }, isEdit);
    } finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Deal" : "Add Deal to Pipeline"} size="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput label="Client Name" name="clientName" value={form.clientName} onChange={handleChange} placeholder="Rahul Sharma" required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" />
        </div>
        <FormInput label="Property" name="propertyName" value={form.propertyName} onChange={handleChange} placeholder="Sunset Villa, Mumbai" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Deal Value (₹)" name="value" type="number" value={form.value} onChange={handleChange} placeholder="5000000" />
          <FormSelect label="Stage" name="stage" value={form.stage} onChange={handleChange}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </FormSelect>
        </div>
        {!isAgent && (
          <FormInput label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Agent name" />
        )}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            placeholder="Any notes about this deal..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Add Deal"}</Button>
        </div>
      </form>
    </Modal>
  );
}
