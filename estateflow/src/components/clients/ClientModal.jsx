import { useState, useEffect, useMemo } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect, FormTextarea } from "../common/FormInput";

// ── Default society charges ───────────────────────────────────────────────────
// type: "sqft" = rate × area, "fixed" = flat amount entered manually
const DEFAULT_CHARGES = [
  { key: "parking",    label: "Parking Charges",         type: "fixed",  amount: "" },
  { key: "edc",        label: "EDC / IDC",               type: "sqft",   amount: "" },
  { key: "compound",   label: "Compound Wall",           type: "fixed",  amount: "" },
  { key: "clubhouse",  label: "Club House",              type: "fixed",  amount: "" },
  { key: "plc",        label: "PLC (Preferred Location)",type: "sqft",   amount: "" },
  { key: "ifms",       label: "IFMS / Sinking Fund",     type: "fixed",  amount: "" },
  { key: "maintenance",label: "Advance Maintenance",     type: "fixed",  amount: "" },
  { key: "legal",      label: "Legal / Documentation",   type: "fixed",  amount: "" },
  { key: "powerbackup",label: "Power Backup",            type: "sqft",   amount: "" },
  { key: "water",      label: "Water Connection",        type: "fixed",  amount: "" },
  { key: "electric",   label: "Electric Connection",     type: "fixed",  amount: "" },
  { key: "firefighting",label: "Fire Fighting Charges",  type: "sqft",   amount: "" },
];

const GST_RATES = ["5", "12", "18", "0"];

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
  // Cost Calculator
  area: "", ratePerSqft: "", gstRate: "5",
  charges: DEFAULT_CHARGES.map(c => ({ ...c })),
};

const TABS = [
  { id: "basic",       label: "Basic Info" },
  { id: "applicant",   label: "Applicant" },
  { id: "coapplicant", label: "Co-Applicant" },
  { id: "cost",        label: "Cost Sheet" },
];

export default function ClientModal({ isOpen, onClose, onSave, client, isAgent }) {
  const isEdit = !!client;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (client) {
      setForm({
        ...defaultForm,
        ...client,
        charges: client.charges
          ? DEFAULT_CHARGES.map(dc => {
              const saved = client.charges.find(c => c.key === dc.key);
              return saved ? { ...dc, ...saved } : { ...dc };
            })
          : DEFAULT_CHARGES.map(c => ({ ...c })),
        gstRate: client.gstRate || "5",
      });
    } else {
      setForm({ ...defaultForm, charges: DEFAULT_CHARGES.map(c => ({ ...c })) });
    }
    setActiveTab("basic");
  }, [client, isOpen]);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleChargeChange(key, field, value) {
    setForm(p => ({
      ...p,
      charges: p.charges.map(c => c.key === key ? { ...c, [field]: value } : c),
    }));
  }

  // ── Auto-calculations ─────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const area = parseFloat(form.area) || 0;
    const rate = parseFloat(form.ratePerSqft) || 0;
    const baseValue = area * rate;

    let chargesTotal = 0;
    const chargeRows = form.charges.map(c => {
      const amt = parseFloat(c.amount) || 0;
      const value = c.type === "sqft" ? amt * area : amt;
      chargesTotal += value;
      return { ...c, value };
    });

    const subtotal = baseValue + chargesTotal;
    const gstPct = parseFloat(form.gstRate) || 0;
    const gstAmount = (subtotal * gstPct) / 100;
    const grandTotal = subtotal + gstAmount;

    return { area, rate, baseValue, chargeRows, chargesTotal, subtotal, gstPct, gstAmount, grandTotal };
  }, [form.area, form.ratePerSqft, form.charges, form.gstRate]);

  function fmt(n) {
    if (!n) return "—";
    return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      // Save calculated totals alongside form data
      await onSave({
        ...form,
        costBaseValue: calc.baseValue,
        costChargesTotal: calc.chargesTotal,
        costSubtotal: calc.subtotal,
        costGstAmount: calc.gstAmount,
        costGrandTotal: calc.grandTotal,
      }, isEdit);
    } finally { setSaving(false); }
  }

  const currentTabIdx = TABS.findIndex(t => t.id === activeTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Client" : "Add New Client"} size="xl">
      <form onSubmit={handleSubmit} noValidate>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}>
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
          </div>
        )}

        {/* ── TAB 2: Applicant Details ── */}
        {activeTab === "applicant" && (
          <div className="space-y-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5">
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">Primary Applicant — {form.name || "Client"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
              <FormInput label="Flat / Unit No." name="flatNo" value={form.flatNo} onChange={handleChange} placeholder="A-204, Tower 3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInput label="PAN Number" name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
                <p className="text-xs text-slate-400 mt-1">Format: ABCDE1234F</p>
              </div>
              <div>
                <FormInput label="Aadhaar Number" name="aadharNumber" value={form.aadharNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                <p className="text-xs text-slate-400 mt-1">12-digit Aadhaar</p>
              </div>
            </div>
            <FormTextarea label="Full Address" name="address" value={form.address} onChange={handleChange}
              placeholder="House No., Street, Area, City, State, PIN" />
          </div>
        )}

        {/* ── TAB 3: Co-Applicant ── */}
        {activeTab === "coapplicant" && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Co-Applicant details (optional)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Co-Applicant Name" name="coApplicantName" value={form.coApplicantName} onChange={handleChange} placeholder="Priya Sharma" />
              <FormSelect label="Relation" name="coApplicantRelation" value={form.coApplicantRelation} onChange={handleChange}>
                <option value="">— Select —</option>
                {["Spouse", "Parent", "Sibling", "Child", "Business Partner", "Other"].map(r => <option key={r}>{r}</option>)}
              </FormSelect>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Phone" name="coApplicantPhone" type="tel" value={form.coApplicantPhone} onChange={handleChange} placeholder="+91 98765 43210" />
              <FormInput label="Email" name="coApplicantEmail" type="email" value={form.coApplicantEmail} onChange={handleChange} placeholder="priya@email.com" />
            </div>
            <FormInput label="Date of Birth" name="coApplicantDob" type="date" value={form.coApplicantDob} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="PAN Number" name="coApplicantPan" value={form.coApplicantPan} onChange={handleChange} placeholder="ABCDE1234F" />
              <FormInput label="Aadhaar Number" name="coApplicantAadhar" value={form.coApplicantAadhar} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
            </div>
          </div>
        )}

        {/* ── TAB 4: Cost Sheet ── */}
        {activeTab === "cost" && (
          <div className="space-y-4">

            {/* Area + Rate inputs */}
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-3">
                Base Value Calculation
              </p>
              <div className="grid grid-cols-3 gap-3 items-end">
                <FormInput
                  label="Area (sq. ft.)"
                  name="area"
                  type="number"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="1250"
                />
                <FormInput
                  label="Rate per sq. ft. (₹)"
                  name="ratePerSqft"
                  type="number"
                  value={form.ratePerSqft}
                  onChange={handleChange}
                  placeholder="6500"
                />
                {/* Auto-calculated base value */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-violet-300 dark:border-violet-700 px-3 py-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">Base Value</p>
                  <p className="text-base font-black text-violet-600 dark:text-violet-400">
                    {calc.baseValue > 0 ? fmt(calc.baseValue) : "—"}
                  </p>
                  {calc.area > 0 && calc.rate > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {calc.area.toLocaleString()} × ₹{calc.rate.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Charges table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Additional Charges
                </p>
                <p className="text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 mr-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> per sq.ft. × area
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> fixed amount
                  </span>
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {form.charges.map((charge, idx) => {
                  const row = calc.chargeRows[idx];
                  return (
                    <div key={charge.key} className="grid grid-cols-12 gap-2 items-center px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      {/* Label */}
                      <div className="col-span-4 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${charge.type === "sqft" ? "bg-blue-400" : "bg-emerald-400"}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{charge.label}</span>
                      </div>

                      {/* Type toggle */}
                      <div className="col-span-2">
                        <select
                          value={charge.type}
                          onChange={e => handleChargeChange(charge.key, "type", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          <option value="sqft">per sq.ft.</option>
                          <option value="fixed">fixed ₹</option>
                        </select>
                      </div>

                      {/* Amount input */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={charge.amount}
                          onChange={e => handleChargeChange(charge.key, "amount", e.target.value)}
                          placeholder={charge.type === "sqft" ? "rate/sqft" : "amount"}
                          className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Calculated value */}
                      <div className="col-span-3 text-right">
                        <span className={`text-sm font-semibold ${row?.value > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-600"}`}>
                          {row?.value > 0 ? fmt(row.value) : "—"}
                        </span>
                        {charge.type === "sqft" && row?.value > 0 && calc.area > 0 && (
                          <p className="text-xs text-slate-400">
                            ₹{parseFloat(charge.amount).toLocaleString()} × {calc.area.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Base Value</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{fmt(calc.baseValue)}</span>
                </div>
                <div className="flex justify-between px-5 py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Additional Charges</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{fmt(calc.chargesTotal)}</span>
                </div>
                <div className="flex justify-between px-5 py-3 bg-white dark:bg-slate-800">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sub Total</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(calc.subtotal)}</span>
                </div>

                {/* GST row */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400">GST</span>
                    <select
                      name="gstRate"
                      value={form.gstRate}
                      onChange={handleChange}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <span className="text-xs text-slate-400">
                      (5% for under-construction, 12% for commercial)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{fmt(calc.gstAmount)}</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between px-5 py-4 bg-violet-600">
                  <span className="text-base font-bold text-white">Grand Total</span>
                  <span className="text-xl font-black text-white">{fmt(calc.grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <span key={tab.id} className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab.id ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            {currentTabIdx < TABS.length - 1 ? (
              <Button type="button" onClick={() => setActiveTab(TABS[currentTabIdx + 1].id)}>
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
