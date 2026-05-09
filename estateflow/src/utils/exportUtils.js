// Export utilities — Excel and PDF generation
// Uses xlsx for Excel, jspdf + jspdf-autotable for PDF

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Excel Export ─────────────────────────────────────────────────────────────

/**
 * Export any array of objects to an Excel file
 * @param {Array} data - array of plain objects
 * @param {string} filename - without extension
 * @param {string} sheetName - worksheet name
 */
export function exportToExcel(data, filename = "export", sheetName = "Sheet1") {
  if (!data || data.length === 0) return;

  // Clean data — remove Firestore Timestamps, convert to readable strings
  const cleaned = data.map(row => {
    const obj = {};
    Object.entries(row).forEach(([key, val]) => {
      if (val && typeof val === "object" && val.toDate) {
        obj[key] = val.toDate().toLocaleDateString("en-IN");
      } else if (val && typeof val === "object" && val.seconds) {
        obj[key] = new Date(val.seconds * 1000).toLocaleDateString("en-IN");
      } else if (typeof val === "object" && val !== null) {
        obj[key] = JSON.stringify(val);
      } else {
        obj[key] = val ?? "";
      }
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(cleaned);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(cleaned[0] || {}).map(key => ({
    wch: Math.max(key.length, ...cleaned.map(r => String(r[key] || "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export properties to Excel with formatted columns
 */
export function exportPropertiesToExcel(properties) {
  const data = properties.map(p => ({
    "Property Name": p.name || "",
    "Location": p.location || "",
    "Price (₹)": p.price || 0,
    "Type": p.type || "",
    "Bedrooms": p.bedrooms || "",
    "Bathrooms": p.bathrooms || "",
    "Sq Ft": p.sqft || "",
    "Status": p.status || "",
    "Agent": p.agent || "",
    "Listed Date": p.listedDate || "",
  }));
  exportToExcel(data, "EstateFlow_Properties", "Properties");
}

/**
 * Export leads to Excel
 */
export function exportLeadsToExcel(leads) {
  const data = leads.map(l => ({
    "Name": l.name || "",
    "Email": l.email || "",
    "Phone": l.phone || "",
    "Status": l.status || "",
    "Source": l.source || "",
    "Assigned To": l.assignedTo || "",
    "Property Interest": l.propertyInterest || "",
    "Budget": l.budget || "",
    "Notes": l.notes || "",
  }));
  exportToExcel(data, "EstateFlow_Leads", "Leads");
}

/**
 * Export clients to Excel
 */
export function exportClientsToExcel(clients) {
  const data = clients.map(c => ({
    "Name": c.name || "",
    "Email": c.email || "",
    "Phone": c.phone || "",
    "Type": c.type || "",
    "Property Interest": c.propertyInterest || "",
    "Budget": c.budget || "",
    "Assigned To": c.assignedTo || "",
    "Notes": c.notes || "",
  }));
  exportToExcel(data, "EstateFlow_Clients", "Clients");
}

/**
 * Export pipeline deals to Excel
 */
export function exportPipelineToExcel(deals) {
  const data = deals.map(d => ({
    "Client Name": d.clientName || "",
    "Phone": d.phone || "",
    "Property": d.propertyName || "",
    "Deal Value (₹)": d.value || 0,
    "Stage": d.stage || "",
    "Assigned To": d.assignedTo || "",
    "Notes": d.notes || "",
  }));
  exportToExcel(data, "EstateFlow_Pipeline", "Pipeline");
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

/**
 * Generate a styled PDF report
 */
export function exportToPDF(title, columns, rows, filename = "report") {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(109, 40, 217); // violet-700
  doc.rect(0, 0, 297, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("EstateFlow CRM", 14, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 297 - 14, 13, { align: "right" });

  // Date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 14, 27);

  // Table
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 247, 255],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} — EstateFlow CRM`, 297 / 2, 205, { align: "center" });
  }

  doc.save(`${filename}.pdf`);
}

export function exportPropertiesToPDF(properties) {
  const columns = ["Property", "Location", "Price (₹)", "Type", "Status", "Agent"];
  const rows = properties.map(p => [
    p.name || "", p.location || "",
    Number(p.price || 0).toLocaleString("en-IN"),
    p.type || "", p.status || "", p.agent || "",
  ]);
  exportToPDF("Properties Report", columns, rows, "EstateFlow_Properties");
}

export function exportLeadsToPDF(leads) {
  const columns = ["Name", "Email", "Phone", "Status", "Source", "Assigned To", "Budget"];
  const rows = leads.map(l => [
    l.name || "", l.email || "", l.phone || "",
    l.status || "", l.source || "", l.assignedTo || "", l.budget || "",
  ]);
  exportToPDF("Leads Report", columns, rows, "EstateFlow_Leads");
}

export function exportClientsToPDF(clients) {
  const columns = ["Name", "Email", "Phone", "Type", "Property Interest", "Budget", "Agent"];
  const rows = clients.map(c => [
    c.name || "", c.email || "", c.phone || "",
    c.type || "", c.propertyInterest || "", c.budget || "", c.assignedTo || "",
  ]);
  exportToPDF("Clients Report", columns, rows, "EstateFlow_Clients");
}

export function exportCommissionToPDF(commissions) {
  const columns = ["Agent", "Closed Deals", "Total Revenue (₹)", "Commission Rate", "Commission (₹)"];
  const rows = commissions.map(a => [
    a.agentName || "",
    String(a.closedDeals || 0),
    Number(a.totalRevenue || 0).toLocaleString("en-IN"),
    `${a.commissionRate || 0}%`,
    Number(a.commission || 0).toLocaleString("en-IN"),
  ]);
  exportToPDF("Commission Report", columns, rows, "EstateFlow_Commissions");
}
