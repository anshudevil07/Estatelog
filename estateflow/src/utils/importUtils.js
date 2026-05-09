// Bulk Import utilities — parse CSV/Excel files into structured data
import * as XLSX from "xlsx";

/**
 * Parse an uploaded Excel or CSV file into an array of objects
 * Returns { data, errors }
 */
export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        resolve({ data: rows, errors: [] });
      } catch (err) {
        reject(new Error("Failed to parse file: " + err.message));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Map raw Excel rows to Lead objects
 * Accepts flexible column names (case-insensitive)
 */
export function mapRowsToLeads(rows) {
  return rows.map((row, i) => {
    const get = (keys) => {
      for (const key of keys) {
        const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
        if (found && row[found]) return String(row[found]).trim();
      }
      return "";
    };

    return {
      name: get(["name", "full name", "client name", "lead name"]),
      email: get(["email", "email address", "e-mail"]),
      phone: get(["phone", "mobile", "contact", "phone number", "mobile number"]),
      status: get(["status", "lead status"]) || "New",
      source: get(["source", "lead source"]) || "Import",
      assignedTo: get(["assigned to", "agent", "assigned agent"]),
      propertyInterest: get(["property", "property interest", "interested in"]),
      budget: get(["budget", "budget range"]),
      notes: get(["notes", "remarks", "comments"]),
      _rowIndex: i + 2, // for error reporting (row 1 = header)
    };
  }).filter(l => l.name); // skip empty rows
}

/**
 * Map raw Excel rows to Property objects
 */
export function mapRowsToProperties(rows) {
  return rows.map((row, i) => {
    const get = (keys) => {
      for (const key of keys) {
        const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
        if (found && row[found] !== undefined) return String(row[found]).trim();
      }
      return "";
    };

    return {
      name: get(["name", "property name", "title"]),
      location: get(["location", "address", "city"]),
      price: Number(get(["price", "value", "amount"]).replace(/[^0-9.]/g, "")) || 0,
      type: get(["type", "property type"]) || "House",
      bedrooms: Number(get(["bedrooms", "beds", "bhk"])) || 0,
      bathrooms: Number(get(["bathrooms", "baths"])) || 0,
      sqft: Number(get(["sqft", "area", "sq ft", "square feet"])) || 0,
      status: get(["status"]) || "Available",
      agent: get(["agent", "listed by"]),
      description: get(["description", "details", "notes"]),
      image: get(["image", "photo", "image url"]),
      _rowIndex: i + 2,
    };
  }).filter(p => p.name);
}

/**
 * Validate imported leads — returns array of error messages
 */
export function validateLeadImport(leads) {
  const errors = [];
  leads.forEach((lead, i) => {
    if (!lead.name) errors.push(`Row ${lead._rowIndex}: Name is required`);
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      errors.push(`Row ${lead._rowIndex}: Invalid email "${lead.email}"`);
    }
  });
  return errors;
}

/**
 * Download a sample CSV template for leads
 */
export function downloadLeadTemplate() {
  const template = [
    { Name: "Rahul Sharma", Email: "rahul@email.com", Phone: "+91 98765 43210", Status: "New", Source: "Website", "Assigned To": "Agent Name", "Property Interest": "3BHK in Pune", Budget: "₹50L-₹80L", Notes: "Interested in ready possession" },
    { Name: "Priya Patel", Email: "priya@email.com", Phone: "+91 87654 32109", Status: "Contacted", Source: "Referral", "Assigned To": "", "Property Interest": "Villa in Mumbai", Budget: "₹2Cr+", Notes: "" },
  ];
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
  XLSX.writeFile(wb, "EstateFlow_Leads_Template.xlsx");
}

/**
 * Download a sample CSV template for properties
 */
export function downloadPropertyTemplate() {
  const template = [
    { Name: "Sunset Villa", Location: "Mumbai, MH", Price: 5000000, Type: "Villa", Bedrooms: 4, Bathrooms: 3, Sqft: 2500, Status: "Available", Agent: "Agent Name", Description: "Luxury villa with pool" },
    { Name: "Sky Apartment", Location: "Pune, MH", Price: 1500000, Type: "Apartment", Bedrooms: 2, Bathrooms: 2, Sqft: 1100, Status: "Available", Agent: "", Description: "" },
  ];
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Properties Template");
  XLSX.writeFile(wb, "EstateFlow_Properties_Template.xlsx");
}
