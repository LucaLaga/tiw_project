import logger from '../utils/logger.js';

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
            logger.error(`Error parsing JSON column ${col}: ${e.message}`);
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
        logger.error(`Error parsing JSON column ${col}: ${e.message}`);
      }
    }
  });
  return parsedRow;
}
