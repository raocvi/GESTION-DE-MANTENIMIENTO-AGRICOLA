const ExcelJS = require('exceljs');
const path = require('path');

async function analyzeExcel() {
  const filePath = path.join(__dirname, '..', 'ANEXOS', 'Plan_Mantenimiento_CaseIH_A9900.xlsx');
  
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  
  console.log('=== ANÁLISIS DEL ARCHIVO EXCEL ===');
  console.log('Total de hojas:', wb.worksheets.length);
  console.log('Hojas:', wb.worksheets.map(ws => ({
    name: ws.name,
    rows: ws.rowCount,
    cols: ws.columnCount
  })));
  
  wb.worksheets.forEach(ws => {
    console.log('\n' + '='.repeat(60));
    console.log('HOJA:', ws.name, '| Filas:', ws.rowCount, '| Columnas:', ws.columnCount);
    console.log('='.repeat(60));
    
    // Mostrar las primeras 10 filas
    let rowCount = 0;
    ws.eachRow((row, rowNum) => {
      if (rowNum <= 15) {
        const values = [];
        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
          if (colNum <= 20) {
            const val = cell.value;
            if (val !== null && val !== undefined && val !== '') {
              values.push(`[Col${colNum}]: ${JSON.stringify(val)}`);
            }
          }
        });
        if (values.length > 0) {
          console.log(`Fila ${rowNum}: ${values.join(' | ')}`);
        }
      }
      rowCount++;
    });
    
    if (rowCount > 15) {
      console.log(`... y ${rowCount - 15} filas más`);
    }
  });
}

analyzeExcel().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
