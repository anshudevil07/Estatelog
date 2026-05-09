import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect, FormTextarea } from "../common/FormInput";

const defaultForm = {
  name: "", email: "", phone: "", type: "Buyer",
  propertyInterest: "", budget: "", assignedTo: "", notes: "",
};

export default function ClientModal({ isOpen, onClose, onSave, client, isAgent }) {
  const isEdit = !!client;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(client ? { ...defaultForm, ...client } : defaultForm);
  }, [client, isOpen]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form, isEdit); }
    finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Client" : "Add New Client"} size="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" />
          <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Client Type" name="type" value={form.type} onChange={handleChange}>
            {["Buyer", "Seller", "Investor", "Tenant"].map(t => <option key={t}>{t}</option>)}
          </FormSelect>
          <FormInput label="Budget Range" name="budget" value={form.budget} onChange={handleChange} placeholder="₹50L – ₹80L" />
        </div>
        <FormInput label="Property Interest" name="propertyInterest" value={form.propertyInterest} onChange={handleChange} placeholder="3BHK in Pune" />
        {!isAgent && (
          <FormInput label="Assigned Agent" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Agent name" />
        )}
        <FormTextarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes about this client..." />
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Add Client"}</Button>
        </div>
      </form>
    </Modal>
  );
}
