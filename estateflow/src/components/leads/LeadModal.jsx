import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect, FormTextarea } from "../common/FormInput";
import { validateLeadForm } from "../../utils/validators";

const defaultForm = {
  name: "", email: "", phone: "", status: "New",
  source: "Website", assignedTo: "", propertyInterest: "",
  budget: "", notes: "",
};

export default function LeadModal({ isOpen, onClose, onSave, lead, agents = [], isAgent = false }) {
  const isEdit = !!lead;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({ ...defaultForm, ...lead });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [lead, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateLeadForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave(form, isEdit);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Lead" : "Add New Lead"} size="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <FormInput
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Rahul Sharma"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="rahul@email.com"
            required
          />
          <FormInput
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} required>
            {["New", "Contacted", "Interested", "Closed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FormSelect>
          <FormSelect label="Source" name="source" value={form.source} onChange={handleChange}>
            {["Website", "Referral", "LinkedIn", "Google Ads", "Instagram", "Cold Call", "Walk-in"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FormSelect>
        </div>

        {/* Only Admin and Manager can assign leads to agents */}
        {!isAgent && (
          <FormSelect
            label="Assign to Agent"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">— Unassigned —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </FormSelect>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Property Interest"
            name="propertyInterest"
            value={form.propertyInterest}
            onChange={handleChange}
            placeholder="e.g. 3BHK in Pune"
          />
          <FormInput
            label="Budget Range"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="e.g. ₹50L – ₹80L"
          />
        </div>

        <FormTextarea
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any additional notes about this lead..."
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "Save Changes" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
