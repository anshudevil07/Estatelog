import { useState, useEffect, useRef, useMemo } from "react";
import { HiPhotograph, HiCurrencyRupee } from "react-icons/hi";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect, FormTextarea } from "../common/FormInput";
import { validatePropertyForm } from "../../utils/validators";

const defaultForm = {
  // Basic
  name: "", location: "", city: "", state: "", pincode: "",
  price: "", ratePerSqft: "", type: "Apartment",
  status: "Available", facing: "", floor: "", totalFloors: "",
  // Size
  superArea: "", carpetArea: "", builtUpArea: "",
  bedrooms: "", bathrooms: "", balconies: "", parking: "",
  // Details
  furnishing: "Unfurnished", possession: "", ageOfProperty: "",
  reraNumber: "", description: "",
  // Amenities
  amenities: [],
  // Image
  image: "",
};

const AMENITIES_LIST = [
  "Swimming Pool", "Gym / Fitness Center", "Clubhouse", "Children's Play Area",
  "24/7 Security", "CCTV Surveillance", "Power Backup", "Lift / Elevator",
  "Covered Parking", "Visitor Parking", "Garden / Landscaping", "Jogging Track",
  "Indoor Games", "Community Hall", "Rainwater Harvesting", "Solar Panels",
  "Intercom", "Fire Safety", "Vastu Compliant", "Gated Community",
];

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "size", label: "Size & Rooms" },
  { id: "details", label: "Details" },
  { id: "amenities", label: "Amenities" },
];

export default function PropertyModal({ isOpen, onClose, onSave, property }) {
  const isEdit = !!property;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const fileRef = useRef(null);

  useEffect(() => {
    if (property) {
      setForm({
        ...defaultForm,
        ...property,
        price: String(property.price || ""),
        ratePerSqft: String(property.ratePerSqft || ""),
        amenities: property.amenities || [],
      });
      setImagePreview(property.image || "");
    } else {
      setForm(defaultForm);
      setImagePreview("");
    }
    setErrors({});
    setActiveTab("basic");
  }, [property, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  function toggleAmenity(amenity) {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter(a => a !== amenity)
        : [...p.amenities, amenity],
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImagePreview(ev.target.result);
      setForm(p => ({ ...p, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  // Auto-calculate price from area × rate
  const autoPrice = useMemo(() => {
    const area = parseFloat(form.superArea) || 0;
    const rate = parseFloat(form.ratePerSqft) || 0;
    return area > 0 && rate > 0 ? area * rate : null;
  }, [form.superArea, form.ratePerSqft]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePropertyForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); setActiveTab("basic"); return; }

    setSaving(true);
    try {
      await onSave({
        ...form,
        price: autoPrice || Number(form.price) || 0,
        ratePerSqft: Number(form.ratePerSqft) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        sqft: Number(form.superArea) || Number(form.sqft) || 0,
        superArea: Number(form.superArea) || 0,
        carpetArea: Number(form.carpetArea) || 0,
        builtUpArea: Number(form.builtUpArea) || 0,
      }, isEdit);
    } finally { setSaving(false); }
  }

  const currentTabIdx = TABS.findIndex(t => t.id === activeTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Property" : "Add New Property"} size="xl">
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
            {/* Image upload */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Featured Image</label>
              <div onClick={() => fileRef.current?.click()}
                className="relative h-36 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-violet-400 transition-colors group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Change Image</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <HiPhotograph className="w-7 h-7" />
                    <p className="text-sm">Click to upload or paste URL below</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <FormInput className="mt-2" name="image" type="url"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={e => { setForm(p => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); }}
                placeholder="Or paste image URL..." />
            </div>

            <FormInput label="Property Name / Project Name" name="name" value={form.name} onChange={handleChange}
              error={errors.name} placeholder="Sunset Heights — 3BHK" required className="col-span-2" />

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Society / Area" name="location" value={form.location} onChange={handleChange}
                error={errors.location} placeholder="Wakad, Hinjewadi" required />
              <FormInput label="City" name="city" value={form.city} onChange={handleChange} placeholder="Pune" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="State" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
              <FormInput label="PIN Code" name="pincode" value={form.pincode} onChange={handleChange} placeholder="411057" />
              <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} required>
                {["Available", "Pending", "Sold"].map(s => <option key={s}>{s}</option>)}
              </FormSelect>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Property Type" name="type" value={form.type} onChange={handleChange} required>
                {["Apartment", "Villa", "House", "Plot", "Penthouse", "Studio", "Duplex", "Row House", "Bungalow", "Commercial", "Office", "Shop"].map(t => <option key={t}>{t}</option>)}
              </FormSelect>
              <FormSelect label="Furnishing" name="furnishing" value={form.furnishing} onChange={handleChange}>
                {["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(f => <option key={f}>{f}</option>)}
              </FormSelect>
            </div>

            <FormInput label="RERA Registration Number" name="reraNumber" value={form.reraNumber} onChange={handleChange}
              placeholder="P52100012345" />
          </div>
        )}

        {/* ── TAB 2: Size & Rooms ── */}
        {activeTab === "size" && (
          <div className="space-y-4">
            {/* Rate × Area = Price calculator */}
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-3">
                Price Calculator
              </p>
              <div className="grid grid-cols-3 gap-3 items-end">
                <FormInput label="Super Area (sq.ft.)" name="superArea" type="number" value={form.superArea}
                  onChange={handleChange} placeholder="1250" />
                <FormInput label="Rate per sq.ft. (₹)" name="ratePerSqft" type="number" value={form.ratePerSqft}
                  onChange={handleChange} placeholder="6500" icon={<HiCurrencyRupee className="w-4 h-4" />} />
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-violet-300 dark:border-violet-700 px-3 py-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">Total Price</p>
                  <p className="text-base font-black text-violet-600 dark:text-violet-400">
                    {autoPrice ? `₹${autoPrice.toLocaleString("en-IN")}` : "—"}
                  </p>
                  {autoPrice && (
                    <p className="text-xs text-slate-400 mt-0.5">Auto-calculated</p>
                  )}
                </div>
              </div>
              {!autoPrice && (
                <FormInput className="mt-3" label="Or enter price manually (₹)" name="price" type="number"
                  value={form.price} onChange={handleChange} error={errors.price}
                  placeholder="e.g. 8125000" icon={<HiCurrencyRupee className="w-4 h-4" />} />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="Carpet Area (sq.ft.)" name="carpetArea" type="number" value={form.carpetArea}
                onChange={handleChange} placeholder="980" />
              <FormInput label="Built-up Area (sq.ft.)" name="builtUpArea" type="number" value={form.builtUpArea}
                onChange={handleChange} placeholder="1100" />
              <FormInput label="Super Area (sq.ft.)" name="superArea" type="number" value={form.superArea}
                onChange={handleChange} placeholder="1250" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormInput label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms}
                onChange={handleChange} error={errors.bedrooms} placeholder="3" required />
              <FormInput label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms}
                onChange={handleChange} error={errors.bathrooms} placeholder="2" required />
              <FormInput label="Balconies" name="balconies" type="number" value={form.balconies}
                onChange={handleChange} placeholder="2" />
              <FormInput label="Parking" name="parking" type="number" value={form.parking}
                onChange={handleChange} placeholder="1" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="Floor No." name="floor" type="number" value={form.floor}
                onChange={handleChange} placeholder="5" />
              <FormInput label="Total Floors" name="totalFloors" type="number" value={form.totalFloors}
                onChange={handleChange} placeholder="14" />
              <FormSelect label="Facing" name="facing" value={form.facing} onChange={handleChange}>
                <option value="">— Select —</option>
                {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map(f => <option key={f}>{f}</option>)}
              </FormSelect>
            </div>
          </div>
        )}

        {/* ── TAB 3: Details ── */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Possession Date" name="possession" type="date" value={form.possession}
                onChange={handleChange} />
              <FormInput label="Age of Property (years)" name="ageOfProperty" type="number"
                value={form.ageOfProperty} onChange={handleChange} placeholder="0 for new" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Description / About Property
              </label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                placeholder="Describe the property — location highlights, nearby landmarks, special features, connectivity, etc."
                className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
            </div>
          </div>
        )}

        {/* ── TAB 4: Amenities ── */}
        {activeTab === "amenities" && (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Select all amenities available in this property / society
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map(amenity => {
                const selected = form.amenities.includes(amenity);
                return (
                  <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left ${
                      selected
                        ? "bg-violet-50 dark:bg-violet-900/30 border-violet-400 text-violet-700 dark:text-violet-300"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}>
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      selected ? "bg-violet-600" : "border border-slate-300 dark:border-slate-600"
                    }`}>
                      {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                    </span>
                    {amenity}
                  </button>
                );
              })}
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-3 font-medium">
                {form.amenities.length} amenities selected
              </p>
            )}
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
              <Button type="button" onClick={() => setActiveTab(TABS[currentTabIdx + 1].id)}>Next →</Button>
            ) : (
              <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Add Property"}</Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
