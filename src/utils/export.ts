export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const printElement = (elementId: string) => {
  const content = document.getElementById(elementId);
  if (!content) return;
  const printWindow = window.open('', '', 'height=700,width=900');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>Print Report - Smart Hostel</title>');
  printWindow.document.write(
    '<style>body{font-family:sans-serif;padding:24px;color:#1e293b} table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:left;font-size:13px} th{background-color:#f1f5f9;font-weight:600} .header{border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:20px} h1{font-size:20px;margin:0 0 4px 0;color:#0f172a} .badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600}</style>'
  );
  printWindow.document.write('</head><body>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
