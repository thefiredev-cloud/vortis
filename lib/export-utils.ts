/**
 * Export Utilities
 * Functions to export data in various formats
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(data[0]) as (keyof T)[]);

  const headers = columns
    ? columns.map((col) => col.label)
    : keys.map(String);

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Create header row
  const headerRow = headers.map(escapeCSV).join(',');

  // Create data rows
  const dataRows = data.map((row) =>
    keys.map((key) => escapeCSV(row[key])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv',
  columns?: { key: keyof T; label: string }[]
): void {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Download JSON file
 */
export function downloadJSON(
  data: any,
  filename: string = 'export.json',
  pretty: boolean = true
): void {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Download text file
 */
export function downloadText(
  content: string,
  filename: string = 'export.txt'
): void {
  const blob = new Blob([content], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

/**
 * Generic blob download
 */
function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy data to clipboard as text
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Copy table data to clipboard (tab-separated for Excel)
 */
export async function copyTableToClipboard<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): Promise<boolean> {
  if (data.length === 0) return false;

  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(data[0]) as (keyof T)[]);

  const headers = columns
    ? columns.map((col) => col.label)
    : keys.map(String);

  const headerRow = headers.join('\t');
  const dataRows = data.map((row) => keys.map((key) => row[key] || '').join('\t'));

  const text = [headerRow, ...dataRows].join('\n');
  return copyToClipboard(text);
}

/**
 * Print data as table
 */
export function printTable<T extends Record<string, any>>(
  data: T[],
  title?: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (typeof window === 'undefined') return;

  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(data[0]) as (keyof T)[]);

  const headers = columns
    ? columns.map((col) => col.label)
    : keys.map(String);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Print'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        ${title ? `<h1>${title}</h1>` : ''}
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${keys.map((key) => `<td>${row[key] || ''}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
