import { useState, useRef } from "react";
import {
  HiDownload, HiUpload, HiDocumentText, HiTable,
  HiCheckCircle, HiExclamationCircle, HiX, HiTemplate,
} from "react-icons/hi";
import { propertyService, leadService } from "../services/api";
import { clientService } from "../firebase/clientService";
import { reportService } from "../firebase/reportService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  exportPropertiesToExcel, exportLeadsToExcel, exportClientsToExcel, exportPipelineToExcel,
  exportPropertiesToPDF, exportLeadsToPDF, exportClientsToPDF, exportCommissionToPDF,
} from "../utils/exportUtils";
import {
  parseImportFile, mapRowsToLeads, mapRowsToProperties,
  validateLeadImport, downloadLeadTemplate, downloadPropertyTemplate,
} from "../utils/importUtils";
import Button from "../components/common/Button";

export default function ExportImportPage() {
  const { user, isAgent } = useAuth();
  const toast = useToast();
  const [exporting, setExporting] = useState("");
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState("leads");
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [importSaving, setImportSaving] = useState(false);
  const fileRef = useRef(null);

  // ── Export handlers ──────────────────────────────────────────────────────
  async function handleExport(type, format) {
    setExporting(`${type}-${format}`);
    try {
      if (type === "properties") {
        const data = await propertyService.getAll();
        format === "excel" ? exportPropertiesToExcel(data) : exportPropertiesToPDF(data);
      } else if (type === "leads") {
        const data = await leadService.getAll(user?.role, user?.name);
        format === "excel" ? exportLeadsToExcel(data) : exportLeadsToPDF(data);
      } else if (type === "clients") {
        const data = await clientService.getAll(user?.role, user?.name);
        format === "excel" ? exportClientsToExcel(data) : exportClientsToPDF(data);
      } else if (type === "pipeline") {
        const { pipelineService } = await import("../firebase/pipelineService");
        const data = await pipelineService.getAll(user?.role, user?.name);
        exportPipelineToExcel(data);
      } else if (type === "commissions") {
        const data = await reportService.getCommissions();
        exportCommissionToPDF(data);
      }
      toast.success(`${type} exported successfully`);
    } catch (err) {
      toast.error("Export failed: " + err.message);
    } finally {
      setExporting("");
    }
  }

  // ── Import handlers ──────────────────────────────────────────────────────
  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportErrors([]);
    setImportPreview(null);

    try {
      const { data } = await parseImportFile(file);
      const mapped = importType === "leads" ? mapRowsToLeads(data) : mapRowsToProperties(data);
      const errors = importType === "leads" ? validateLeadImport(mapped) : [];
      setImportPreview(mapped);
      setImportErrors(errors);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  async function handleImportSave() {
    if (!importPreview || importPreview.length === 0) return;
    setImportSaving(true);
    let success = 0;
    let failed = 0;

    try {
      for (const item of importPreview) {
        const { _rowIndex, ...data } = item;
        try {
          if (importType === "leads") {
            const leadData = isAgent ? { ...data, assignedTo: user.name } : data;
            await leadService.create(leadData);
          } else {
            await propertyService.create(data);
          }
          success++;
        } catch { failed++; }
      }
      toast.success(`Imported ${success} ${importType}${failed > 0 ? ` (${failed} failed)` : ""}`);
      setImportPreview(null);
      setImportErrors([]);
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      setImportSaving(false);
    }
  }

  const exportCards = [
    {
      title: "Properties",
      desc: "All property listings with details",
      icon: "🏠",
      type: "properties",
      formats: ["excel", "pdf"],
    },
    {
      title: "Leads",
      desc: "Lead list with contact and status",
      icon: "👤",
      type: "leads",
      formats: ["excel", "pdf"],
    },
    {
      title: "Clients",
      desc: "Client profiles and details",
      icon: "🤝",
      type: "clients",
      formats: ["excel", "pdf"],
    },
    {
      title: "Pipeline",
      desc: "All deals across pipeline stages",
      icon: "📊",
      type: "pipeline",
      formats: ["excel"],
    },
    {
      title: "Commission Report",
      desc: "Agent commissions on closed deals",
      icon: "💰",
      type: "commissions",
      formats: ["pdf"],
      adminOnly: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Export & Import</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Download your data as Excel or PDF, or bulk import from a spreadsheet
        </p>
      </div>

      {/* ── EXPORT SECTION ── */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <HiDownload className="w-5 h-5 text-violet-500" /> Export Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportCards
            .filter(c => !c.adminOnly || !isAgent)
            .map(card => (
              <div key={card.type} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{card.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {card.formats.includes("excel") && (
                    <button
                      onClick={() => handleExport(card.type, "excel")}
                      disabled={!!exporting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 border border-emerald-200 dark:border-emerald-800"
                    >
                      {exporting === `${card.type}-excel` ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : <HiTable className="w-3.5 h-3.5" />}
                      Excel
                    </button>
                  )}
                  {card.formats.includes("pdf") && (
                    <button
                      onClick={() => handleExport(card.type, "pdf")}
                      disabled={!!exporting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 border border-red-200 dark:border-red-800"
                    >
                      {exporting === `${card.type}-pdf` ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : <HiDocumentText className="w-3.5 h-3.5" />}
                      PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── IMPORT SECTION ── */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <HiUpload className="w-5 h-5 text-violet-500" /> Bulk Import
        </h2>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          {/* Import type + template download */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              {["leads", "properties"].map(t => (
                <button key={t} onClick={() => { setImportType(t); setImportPreview(null); setImportErrors([]); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    importType === t ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}>
                  Import {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => importType === "leads" ? downloadLeadTemplate() : downloadPropertyTemplate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <HiTemplate className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors group"
          >
            <HiUpload className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3 group-hover:text-violet-400 transition-colors" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Click to upload Excel (.xlsx) or CSV file
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Download the template above to see the required format
            </p>
            {importing && <p className="text-xs text-violet-500 mt-2 animate-pulse">Parsing file...</p>}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />

          {/* Errors */}
          {importErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiExclamationCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{importErrors.length} validation errors</p>
              </div>
              <ul className="space-y-1">
                {importErrors.slice(0, 5).map((err, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400">• {err}</li>
                ))}
                {importErrors.length > 5 && <li className="text-xs text-red-400">...and {importErrors.length - 5} more</li>}
              </ul>
            </div>
          )}

          {/* Preview */}
          {importPreview && importPreview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {importPreview.length} {importType} ready to import
                  </p>
                </div>
                <button onClick={() => { setImportPreview(null); setImportErrors([]); }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <HiX className="w-4 h-4" />
                </button>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                    <tr>
                      {Object.keys(importPreview[0]).filter(k => k !== "_rowIndex").map(k => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {importPreview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        {Object.entries(row).filter(([k]) => k !== "_rowIndex").map(([k, v]) => (
                          <td key={k} className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap max-w-[150px] truncate">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importPreview.length > 10 && (
                <p className="text-xs text-slate-400 mt-2 text-center">Showing 10 of {importPreview.length} rows</p>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="secondary" onClick={() => { setImportPreview(null); setImportErrors([]); }}>
                  Cancel
                </Button>
                <Button
                  loading={importSaving}
                  onClick={handleImportSave}
                  disabled={importErrors.length > 0}
                >
                  Import {importPreview.length} {importType}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
