const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);
    const escaped = stringValue.replace(/"/g, '""');

    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

export const downloadCsv = (filename, rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return false;
    }

    const safeRows = rows.map((row) => row || {});
    const headers = [...new Set(safeRows.flatMap((row) => Object.keys(row)))];

    if (headers.length === 0) {
        return false;
    }

    const csvLines = [
        headers.join(','),
        ...safeRows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    return true;
};