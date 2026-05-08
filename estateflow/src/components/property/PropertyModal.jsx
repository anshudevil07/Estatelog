import { useState, useEffect, useRef } from "react";
import { HiPhotograph, HiCurrencyRupee } from "react-icons/hi";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FormInput, { FormSelect } from "../common/FormInput";
import { validatePropertyForm } from "../../utils/validators";

const defaultForm = {
  name: "", location: "", price: "", type: "House",
  bedrooms: "", bathrooms: "", sqft: "", status: "Available",
  description: "", image: "",
};

export default function PropertyModal({ isOpen, onClose, onSave, property }) {
  const isEdit = !!property;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (property) {
      setForm({ ...defaultForm, ...property, price: String(property.price) });
      setImagePreview(property.image || "");
    } else {
      setForm(defaultForm);
      setImagePreview("");
    }
    setErrors({});
  }, [property, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm((prev) => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePropertyForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave(
        { ...form, price: Number(form.price), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), sqft: Number(form.sqft) },
        isEdit
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Property" : "Add New Property"} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        {/* Image upload */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Featured Image
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative h-40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-violet-400 transition-colors group"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Change Image</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <HiPhotograph className="w-8 h-8" />
                <p className="text-sm">Click to upload image</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {/* Or use URL */}
          <FormInput
            className="mt-2"
            name="image"
            type="url"
            value={form.image.startsWith("data:") ? "" : form.image}
            onChange={(e) => { setForm((p) => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); }}
            placeholder="Or paste image URL..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Property Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Sunset Ridge Villa" required className="sm:col-span-2" />
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} error={errors.location} placeholder="Beverly Hills, CA" required />
          <FormInput label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} placeholder="e.g. 5000000" required icon={<HiCurrencyRupee className="w-4 h-4" />} />
          <FormSelect label="Property Type" name="type" value={form.type} onChange={handleChange} required>
            {["House", "Villa", "Apartment", "Condo", "Penthouse", "Townhouse", "Studio", "Cabin", "Cottage"].map((t) => <option key={t}>{t}</option>)}
          </FormSelect>
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} required>
            {["Available", "Pending", "Sold"].map((s) => <option key={s}>{s}</option>)}
          </FormSelect>
          <FormInput label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} error={errors.bedrooms} placeholder="4" required />
          <FormInput label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} error={errors.bathrooms} placeholder="3" required />
          <FormInput label="Square Feet" name="sqft" type="number" value={form.sqft} onChange={handleChange} error={errors.sqft} placeholder="2900" required />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of the property..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Add Property"}</Button>
        </div>
      </form>
    </Modal>
  );
}
