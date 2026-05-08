import { useState, useRef } from "react";
import { HiUser, HiLockClosed, HiBell, HiColorSwatch, HiPhotograph, HiEye, HiEyeOff } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";
import { getInitials } from "../utils/formatters";

const tabs = [
  { id: "profile", label: "Profile", icon: <HiUser className="w-4 h-4" /> },
  { id: "password", label: "Password", icon: <HiLockClosed className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <HiBell className="w-4 h-4" /> },
  { id: "appearance", label: "Appearance", icon: <HiColorSwatch className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "password" && <PasswordTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "appearance" && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    phone: "+1 (555) 100-0001",
    bio: "Real estate admin managing the EstateFlow platform.",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ name: form.name, email: form.email, avatar: avatarPreview });
    toast.success("Profile updated successfully");
    setSaving(false);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Profile Information</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xl font-bold">
                {getInitials(form.name)}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition-colors"
            title="Change photo"
          >
            <HiPhotograph className="w-3.5 h-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{form.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{form.role}</p>
          <button onClick={() => fileRef.current?.click()} className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-1">
            Change photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormInput label="Role" name="role" value={form.role} onChange={handleChange} disabled />
          <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────
function PasswordTab() {
  const toast = useToast();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.current) errs.current = "Current password is required";
    if (!form.newPass || form.newPass.length < 6) errs.newPass = "New password must be at least 6 characters";
    if (form.newPass !== form.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password updated successfully");
    setForm({ current: "", newPass: "", confirm: "" });
    setSaving(false);
  }

  const toggleIcon = (field) => (
    <button type="button" onClick={() => setShow((p) => ({ ...p, [field]: !p[field] }))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
      {show[field] ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Change Password</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Use a strong password with at least 6 characters.</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <FormInput label="Current Password" name="current" type={show.current ? "text" : "password"} value={form.current} onChange={handleChange} error={errors.current} required rightElement={toggleIcon("current")} />
        <FormInput label="New Password" name="newPass" type={show.newPass ? "text" : "password"} value={form.newPass} onChange={handleChange} error={errors.newPass} required rightElement={toggleIcon("newPass")} />
        <FormInput label="Confirm New Password" name="confirm" type={show.confirm ? "text" : "password"} value={form.confirm} onChange={handleChange} error={errors.confirm} required rightElement={toggleIcon("confirm")} />
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>Update Password</Button>
        </div>
      </form>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    newLead: true, dealClosed: true, propertyUpdate: false,
    weeklyReport: true, agentActivity: false, systemAlerts: true,
  });

  const items = [
    { key: "newLead", label: "New Lead Assigned", desc: "Get notified when a lead is assigned to you" },
    { key: "dealClosed", label: "Deal Closed", desc: "Notifications when a deal is successfully closed" },
    { key: "propertyUpdate", label: "Property Updates", desc: "When a property status changes" },
    { key: "weeklyReport", label: "Weekly Report", desc: "Receive a weekly performance summary" },
    { key: "agentActivity", label: "Agent Activity", desc: "Updates on your team's activity" },
    { key: "systemAlerts", label: "System Alerts", desc: "Important system and security notifications" },
  ];

  function handleSave() {
    toast.success("Notification preferences saved");
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Choose what you want to be notified about.</p>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${prefs[item.key] ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"}`}
              role="switch"
              aria-checked={prefs[item.key]}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[item.key] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-5">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Appearance</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Customize how EstateFlow looks for you.</p>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                onClick={() => { if (theme !== t) toggleTheme(); }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === t
                    ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className={`w-full h-12 rounded-lg mb-2 ${t === "dark" ? "bg-slate-900" : "bg-white border border-slate-200"}`} />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{t} Mode</p>
                {theme === t && <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Active</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accent Color</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Currently using Violet — more colors coming soon.</p>
          <div className="flex gap-2">
            {["bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-rose-600"].map((c, i) => (
              <button key={i} className={`w-8 h-8 rounded-full ${c} ${i === 0 ? "ring-2 ring-offset-2 ring-violet-600 dark:ring-offset-slate-800" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
