import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect, FormTextarea } from "../common/FormInput";

const defaultForm = {
  // Basic
  name: "", email: "", phone: "", type: "Buyer",
  propertyInterest: "", budget: "", assignedTo: "", notes: "",
  // Applicant details
  dob: "", panNumber: "", aadharNumber: "", flatNo: "", address: "",
  // Co-Applicant
  coApplicantName: "", coApplicantPhone: "", coApplicantEmail: "",
  coApplicantDob: "", coApplicantPan: "", coApplicantAadhar: "",
  coApplicantRelation: "",
};

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "applicant", label: "Applicant Details" },
  { id: "coapplicant", label: "Co-Applicant" },
];

export default function ClientModal({ isOpen, onClose, onSave, client, isAgent }) {
  const isEdit = !!client;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    setForm(client ? { ...defaultForm, ...client } : defaultForm);
    setActiveTab("basic");
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Client" : "Add New Client"} size="lg">
      <form onSubmit={handleSubmit} noValidate>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Basic Info ── */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange}
              placeholder="Rahul Sharma" required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="rahul@email.com" />
              <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="+91 98765 43210" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Client Type" name="type" value={form.type} onChange={handleChange}>
                {["Buyer", "Seller", "Investor", "Tenant"].map(t => <option key={t}>{t}</option>)}
              </FormSelect>
              <FormInput label="Budget Range" name="budget" value={form.budget} onChange={handleChange}
                placeholder="₹50L – ₹80L" />
            </div>
            <FormInput label="Property Interest" name="propertyInterest" value={form.propertyInterest}
              onChange={handleChange} placeholder="3BHK in Pune" />
            {!isAgent && (
              <FormInput label="Assigned Agent" name="assignedTo" value={form.assignedTo}
                onChange={handleChange} placeholder="Agent name" />
            )}
            <FormTextarea label="Notes" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Any notes about this client..." />
          </div>
        )}

        {/* ── TAB 2: Applicant Details ── */}
        {activeTab === "applicant" && (
          <div className="space-y-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5 mb-2">
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                Primary Applicant — {form.name || "Client"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Date of Birth" name="dob" type="date" value={form.dob}
                onChange={handleChange} />
              <FormInput label="Flat / Unit No." name="flatNo" value={form.flatNo}
                onChange={handleChange} placeholder="A-204, Tower 3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInput label="PAN Number" name="panNumber" value={form.panNumber}
                  onChange={handleChange} placeholder="ABCDE1234F" inputClassName="uppercase" />
                <p className="text-xs text-slate-400 mt-1">Format: ABCDE1234F</p>
              </div>
              <div>
                <FormInput label="Aadhaar Number" name="aadharNumber" value={form.aadharNumber}
                  onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                <p className="text-xs text-slate-400 mt-1">12-digit Aadhaar</p>
              </div>
            </div>

            <FormTextarea label="Full Address" name="address" value={form.address}
              onChange={handleChange} placeholder="House No., Street, Area, City, State, PIN" />
          </div>
        )}

        {/* ── TAB 3: Co-Applicant ── */}
        {activeTab === "coapplicant" && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 mb-2">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Co-Applicant details (optional — spouse, parent, partner, etc.)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Co-Applicant Name" name="coApplicantName" value={form.coApplicantName}
                onChange={handleChange} placeholder="Priya Sharma" />
              <FormSelect label="Relation" name="coApplicantRelation" value={form.coApplicantRelation}
                onChange={handleChange}>
                <option value="">— Select —</option>
                {["Spouse", "Parent", "Sibling", "Child", "Business Partner", "Other"].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </FormSelect>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Phone" name="coApplicantPhone" type="tel" value={form.coApplicantPhone}
                onChange={handleChange} placeholder="+91 98765 43210" />
              <FormInput label="Email" name="coApplicantEmail" type="email" value={form.coApplicantEmail}
                onChange={handleChange} placeholder="priya@email.com" />
            </div>

            <FormInput label="Date of Birth" name="coApplicantDob" type="date" value={form.coApplicantDob}
              onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInput label="PAN Number" name="coApplicantPan" value={form.coApplicantPan}
                  onChange={handleChange} placeholder="ABCDE1234F" inputClassName="uppercase" />
              </div>
              <div>
                <FormInput label="Aadhaar Number" name="coApplicantAadhar" value={form.coApplicantAadhar}
                  onChange={handleChange} placeholder="XXXX XXXX XXXX" />
              </div>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex gap-1">
            {TABS.map((tab, i) => (
              <span key={tab.id} className={`w-2 h-2 rounded-full transition-colors ${
                activeTab === tab.id ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
              }`} />
            ))}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            {activeTab !== "coapplicant" ? (
              <Button type="button" onClick={() => {
                const idx = TABS.findIndex(t => t.id === activeTab);
                setActiveTab(TABS[idx + 1].id);
              }}>
                Next →
              </Button>
            ) : (
              <Button type="submit" loading={saving}>
                {isEdit ? "Save Changes" : "Add Client"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
