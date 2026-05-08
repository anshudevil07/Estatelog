import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiHome } from "react-icons/hi";
import Button from "../components/common/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8 mx-auto w-48 h-48">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/20" />
          {/* House icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="text-8xl font-black text-violet-200 dark:text-violet-800 select-none leading-none">
                404
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Looks like this property doesn't exist. The page you're looking for may have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            icon={<HiArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            icon={<HiHome className="w-4 h-4" />}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
