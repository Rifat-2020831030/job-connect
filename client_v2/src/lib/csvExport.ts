import type { TrackedJob } from "@/components/tracker/TrackerTable";

/**
 * Escapes a single cell value for CSV (RFC 4180 compliant) with formula injection protection (CWE-1236).
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str = String(value);

  // Spreadsheet formula injection mitigation (Excel, Google Sheets, LibreOffice Calc)
  // Cells starting with =, +, -, @, \t, or \r can trigger formula/macro execution when opened.
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If cell contains commas, quotes, or newlines, enclose in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Formats a date string into YYYY-MM-DD local calendar format for seamless spreadsheet date parsing.
 */
export function formatCSVDate(dateString?: string | null): string {
  if (!dateString) return "";
  const trimmed = dateString.trim();
  if (/^not\s*specified$/i.test(trimmed) || /^unknown$/i.test(trimmed)) {
    return "";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts enum tracker status to human readable title.
 */
export function formatTrackerStatus(status?: string): string {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return "Pending Confirmation";
    case "APPLIED":
      return "Applied";
    case "INTERVIEWING":
      return "Interviewing";
    case "OFFER":
      return "Offer";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
    default:
      return status || "";
  }
}

/**
 * Builds RFC 4180 compliant CSV string from an array of TrackedJobs.
 */
export function buildTrackedJobsCSV(jobs: TrackedJob[]): string {
  const headers = [
    "Job Title",
    "Company",
    "Location",
    "Status",
    "Type",
    "Platform",
    "Applied Date",
    "Deadline",
    "Job URL",
    "Notes",
    "Last Updated",
  ];

  const headerRow = headers.map(escapeCSVCell).join(",");

  const dataRows = jobs.map((job) => {
    const details = job.jobDetails || {};
    const platform =
      details.platform ||
      (job.type === "INTERNAL" ? "Chakrilagbe" : "");

    const row = [
      details.title || "",
      details.company || "",
      details.location || "",
      formatTrackerStatus(job.status),
      job.type === "EXTERNAL" ? "External" : "Internal",
      platform,
      formatCSVDate(job.createdAt),
      formatCSVDate(details.deadline),
      details.url || "",
      job.notes || "",
      formatCSVDate(job.updatedAt),
    ];

    return row.map(escapeCSVCell).join(",");
  });

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser download of the CSV content with UTF-8 BOM.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel reliably detects UTF-8 encoding
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
