import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowLeft, HiShieldCheck, HiBriefcase, HiUserCircle } from "react-icons/hi";
import { signupUser } from "../../firebase/authService";
import { useToast } from "../../context/ToastContext";
import { validateEmail } from "../../utils/validators";
import Button from "../../components/common/Button";
import FormInput, { FormSelect } from "../../components/common/FormInput";

// Role descriptions shown to admin
const roleInfo = {
  admin: {
    icon: <HiShieldCheck className="w-5 h-5" />,
    color: "border-red-400 bg-red-50 dark:bg-red-900/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Admin",
    desc: "Full access — can manage everything including agents, properties, leads, and settings.",
  },
  manager: {
    icon: <HiBriefcase className="w-5 h-5" />,
    color: "border-violet-400 bg-violet-50 dark:bg-violet-900/20",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    label: "Manager",
    desc: "Can manage properties and all leads. Can assign leads to agents. Cannot manage users.",
  },
  agent: {
    icon: <HiUserCircle className="w-5 h-5" />,
    color: "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Agent",
    desc: "Can only see and manage leads assigned to them. Read-only access to properties.",
  },
};

export default function AddTeamMember() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signupUser(form.name, form.email, form.password, form.role);
      toast.success(`${roleInfo[form.role].label} account created for ${form.name}`);
      navigate("/admin/agents");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const selected = roleInfo[form.role];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/agents")}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Team Member</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create a new account and assign a role
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              error={errors.name}
              icon={<HiUser className="w-4 h-4" />}
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@company.com"
              error={errors.email}
              icon={<HiMail className="w-4 h-4" />}
              required
            />
          </div>

          <FormInput
            label="Temporary Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            error={errors.password}
            icon={<HiLockClosed className="w-4 h-4" />}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Role selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-3">
              Assign Role <span className="text-red-500">*</span>
            </label>

            {/* Role cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {Object.entries(roleInfo).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: key }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.role === key
                      ? info.color
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${info.badge}`}>
                    {info.icon}
                    {info.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {info.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected role summary */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${selected.color}`}>
            <span className={`mt-0.5 ${selected.badge.includes("red") ? "text-red-600" : selected.badge.includes("violet") ? "text-violet-600" : "text-blue-600"}`}>
              {selected.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Creating a <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${selected.badge}`}>{selected.label}</span> account
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selected.desc}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/agents")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
