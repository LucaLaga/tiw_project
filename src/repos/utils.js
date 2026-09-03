export function parseJsonColumns(rows, columns) {
  if (!rows) return rows;
  if (Array.isArray(rows)) {
    return rows.map(row => {
      const parsedRow = { ...row };
      columns.forEach(col => {
        if (parsedRow[col]) {
          try {
            parsedRow[col] = JSON.parse(parsedRow[col]);
          } catch (e) {
            // Fallback if not JSON
          }
        }
      });
      return parsedRow;
    });
  }
  const parsedRow = { ...rows };
  columns.forEach(col => {
    if (parsedRow[col]) {
      try {
        parsedRow[col] = JSON.parse(parsedRow[col]);
      } catch (e) {
        // Fallback if not JSON
      }
    }
  });
  return parsedRow;
}
