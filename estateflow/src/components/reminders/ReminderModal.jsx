import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect } from "../common/FormInput";

const defaultForm = {
  title: "", description: "", dueDate: "",
  priority: "Medium", relatedTo: "",
};

export default function ReminderModal({ isOpen, onClose, onSave, reminder }) {
  const isEdit = !!reminder;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      const dueDate = reminder.dueDate?.toDate
        ? reminder.dueDate.toDate().toISOString().split("T")[0]
        : reminder.dueDate || "";
      setForm({ ...defaultForm, ...reminder, dueDate });
    } else {
      setForm(defaultForm);
    }
  }, [reminder, isOpen]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form, isEdit);
    } finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Reminder" : "Add Follow-up Reminder"} size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput label="Reminder Title" name="title" value={form.title} onChange={handleChange}
          placeholder="Call Rahul about site visit" required />
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            placeholder="Additional notes..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
          <FormSelect label="Priority" name="priority" value={form.priority} onChange={handleChange}>
            {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </FormSelect>
        </div>
        <FormInput label="Related To (Lead/Client)" name="relatedTo" value={form.relatedTo} onChange={handleChange}
          placeholder="e.g. Rahul Sharma" />
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Set Reminder"}</Button>
        </div>
      </form>
    </Modal>
  );
}
