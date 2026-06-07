const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'ANEXOS', 'Plan_Mantenimiento_CaseIH_A9900.xlsx');

// XLSX es un ZIP. Leer manualmente sin dependencias
function readZipCentralDir(buffer) {
  // Buscar el End of Central Directory record
  const EOCD_SIG = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 4; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Not a valid ZIP file');
  
  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);
  const centralDirSize = buffer.readUInt32LE(eocdOffset + 12);
  const numEntries = buffer.readUInt16LE(eocdOffset + 8);
  
  const entries = [];
  let pos = centralDirOffset;
  
  for (let i = 0; i < numEntries; i++) {
    if (buffer.readUInt32LE(pos) !== 0x02014b50) break;
    
    const compression = buffer.readUInt16LE(pos + 10);
    const compressedSize = buffer.readUInt32LE(pos + 20);
    const uncompressedSize = buffer.readUInt32LE(pos + 24);
    const fileNameLen = buffer.readUInt16LE(pos + 28);
    const extraLen = buffer.readUInt16LE(pos + 30);
    const commentLen = buffer.readUInt16LE(pos + 32);
    const localHeaderOffset = buffer.readUInt32LE(pos + 42);
    const fileName = buffer.slice(pos + 46, pos + 46 + fileNameLen).toString('utf8');
    
    entries.push({ fileName, compression, compressedSize, uncompressedSize, localHeaderOffset });
    pos += 46 + fileNameLen + extraLen + commentLen;
  }
  
  return entries;
}

function readEntry(buffer, entry) {
  const pos = entry.localHeaderOffset;
  if (buffer.readUInt32LE(pos) !== 0x04034b50) return null;
  
  const fileNameLen = buffer.readUInt16LE(pos + 26);
  const extraLen = buffer.readUInt16LE(pos + 28);
  const dataStart = pos + 30 + fileNameLen + extraLen;
  
  const compressed = buffer.slice(dataStart, dataStart + entry.compressedSize);
  
  if (entry.compression === 0) return compressed;
  if (entry.compression === 8) return zlib.inflateRawSync(compressed);
  return null;
}

function parseXML(xml) {
  return xml.toString('utf8');
}

function extractText(xml) {
  // Extraer texto de <t> tags
  const texts = [];
  const re = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    texts.push(m[1]);
  }
  return texts;
}

function parseSheet(xml, sharedStrings) {
  const rows = {};
  const rowRe = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  const cellRe = /<c\s+r="([A-Z]+)(\d+)"(?:\s+t="([^"]*)")?[^>]*>(?:.*?<v>([^<]*)<\/v>)?.*?<\/c>/g;
  
  let rowMatch;
  while ((rowMatch = rowRe.exec(xml)) !== null) {
    const rowNum = parseInt(rowMatch[1]);
    const rowContent = rowMatch[2];
    rows[rowNum] = {};
    
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowContent)) !== null) {
      const col = cellMatch[1];
      const type = cellMatch[3];
      const rawVal = cellMatch[4];
      
      if (rawVal === undefined || rawVal === null) continue;
      
      let value;
      if (type === 's') {
        value = sharedStrings[parseInt(rawVal)] || rawVal;
      } else if (type === 'b') {
        value = rawVal === '1' ? 'TRUE' : 'FALSE';
      } else {
        const num = parseFloat(rawVal);
        value = isNaN(num) ? rawVal : (Number.isInteger(num) ? num : num);
      }
      
      // Convertir columna de letra a número
      let colNum = 0;
      for (const ch of col) {
        colNum = colNum * 26 + (ch.charCodeAt(0) - 64);
      }
      
      rows[rowNum][colNum] = value;
    }
  }
  
  return rows;
}

try {
  const buffer = fs.readFileSync(filePath);
  console.log('Archivo leído:', buffer.length, 'bytes');
  
  const entries = readZipCentralDir(buffer);
  console.log('\nEntradas en el ZIP:');
  entries.forEach(e => console.log(` - ${e.fileName} (${e.uncompressedSize} bytes)`));
  
  // Leer shared strings
  const ssEntry = entries.find(e => e.fileName === 'xl/sharedStrings.xml');
  let sharedStrings = [];
  if (ssEntry) {
    const ssXml = readEntry(buffer, ssEntry).toString('utf8');
    const texts = extractText(ssXml);
    sharedStrings = texts;
    console.log('\nStrings compartidos (primeros 80):');
    sharedStrings.slice(0, 80).forEach((s, i) => console.log(`  [${i}] = ${JSON.stringify(s)}`));
  }
  
  // Leer workbook
  const wbEntry = entries.find(e => e.fileName === 'xl/workbook.xml');
  if (wbEntry) {
    const wbXml = readEntry(buffer, wbEntry).toString('utf8');
    const sheetNames = [];
    const sheetsRe = /<sheet\s+name="([^"]*)"[^\/]*\/>/g;
    let m;
    while ((m = sheetsRe.exec(wbXml)) !== null) {
      sheetNames.push(m[1]);
    }
    console.log('\nNombres de hojas:', sheetNames);
    
    // Leer cada hoja
    sheetNames.forEach((name, idx) => {
      const sheetEntry = entries.find(e => e.fileName === `xl/worksheets/sheet${idx+1}.xml`);
      if (!sheetEntry) return;
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`HOJA ${idx+1}: ${name}`);
      console.log('='.repeat(70));
      
      const sheetXml = readEntry(buffer, sheetEntry).toString('utf8');
      const rows = parseSheet(sheetXml, sharedStrings);
      
      const rowNums = Object.keys(rows).map(Number).sort((a,b) => a-b);
      console.log(`Total filas con datos: ${rowNums.length}`);
      
      rowNums.slice(0, 25).forEach(rowNum => {
        const row = rows[rowNum];
        const cells = Object.entries(row)
          .sort(([a],[b]) => Number(a)-Number(b))
          .map(([col, val]) => `C${col}:${JSON.stringify(val)}`)
          .join(' | ');
        if (cells) console.log(`  Fila ${rowNum}: ${cells}`);
      });
      
      if (rowNums.length > 25) {
        console.log(`  ... y ${rowNums.length - 25} filas más`);
      }
    });
  }

} catch(err) {
  console.error('Error:', err.message);
  console.error(err.stack);
}
