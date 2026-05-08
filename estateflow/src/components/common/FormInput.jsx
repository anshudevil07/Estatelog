// Reusable form input with label, error, and icon support

export default function FormInput({
  label,
  error,
  icon,
  rightElement,
  className = "",
  inputClassName = "",
  required,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full rounded-lg border px-3 py-2.5 text-sm
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
            ${icon ? "pl-10" : ""}
            ${rightElement ? "pr-10" : ""}
            ${error ? "border-red-400 focus:ring-red-400" : ""}
            ${inputClassName}
          `}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// Textarea variant
export function FormTextarea({ label, error, className = "", required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-lg border px-3 py-2.5 text-sm resize-none
          bg-white dark:bg-slate-800
          border-slate-200 dark:border-slate-700
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          transition-colors
          ${error ? "border-red-400 focus:ring-red-400" : ""}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// Select variant
export function FormSelect({ label, error, className = "", required, children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full rounded-lg border px-3 py-2.5 text-sm
          bg-white dark:bg-slate-800
          border-slate-200 dark:border-slate-700
          text-slate-900 dark:text-slate-100
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          transition-colors cursor-pointer
          ${error ? "border-red-400 focus:ring-red-400" : ""}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
