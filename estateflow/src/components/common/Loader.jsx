import { ImSpinner8 } from "react-icons/im";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <ImSpinner8 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <ImSpinner8 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    </div>
  );
}
