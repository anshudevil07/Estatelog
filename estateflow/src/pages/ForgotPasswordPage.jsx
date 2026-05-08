import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMail, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { resetPassword } from "../firebase/authService";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!validateEmail(email)) { setError("Enter a valid email address"); return; }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else {
        toast.error("Failed to send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-xl">EstateFlow</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <HiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              We sent a password reset link to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
              <HiArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Reset your password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormInput
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@estateflow.com"
                error={error}
                icon={<HiMail className="w-4 h-4" />}
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <HiArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
