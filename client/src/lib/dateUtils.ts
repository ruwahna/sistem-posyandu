/**
 * Utility functions for date formatting in Posyandu application.
 */

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTH_NAMES_SHORT_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Formats a date string (e.g. "2025-10-01T00:00:00.000Z" or "2025-10-01")
 * into Indonesian date format, e.g. "01 Oktober 2025" or "1 Oktober 2025".
 */
export function formatTanggalIndonesia(
  dateStr?: string | Date | null,
  options: { shortMonth?: boolean; padDay?: boolean } = { padDay: true }
): string {
  if (!dateStr) return "-";

  let str = "";
  if (typeof dateStr === "string") {
    str = dateStr;
  } else if (dateStr instanceof Date) {
    str = dateStr.toISOString();
  }

  // Extract YYYY-MM-DD part before 'T' to prevent timezone offset shifts
  const dateOnly = str.split("T")[0];
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);

    if (
      !isNaN(year) &&
      !isNaN(monthIdx) &&
      monthIdx >= 0 &&
      monthIdx < 12 &&
      !isNaN(dayNum)
    ) {
      const monthName = options.shortMonth
        ? MONTH_NAMES_SHORT_ID[monthIdx]
        : MONTH_NAMES_ID[monthIdx];
      const formattedDay = options.padDay !== false
        ? String(dayNum).padStart(2, "0")
        : String(dayNum);
      return `${formattedDay} ${monthName} ${year}`;
    }
  }

  // Fallback to JS Date formatting if string splitting failed
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", {
        day: options.padDay !== false ? "2-digit" : "numeric",
        month: options.shortMonth ? "short" : "long",
        year: "numeric",
      });
    }
  } catch {
    // Return original string if error
  }

  return str;
}

/**
 * Normalizes any date string (ISO or timestamp) to YYYY-MM-DD for HTML <input type="date" />.
 */
export function formatTanggalInput(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  if (typeof dateStr === "string") {
    return dateStr.split("T")[0];
  }
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split("T")[0];
  }
  return "";
}
