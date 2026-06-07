const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'ANEXOS', 'Plan_Mantenimiento_CaseIH_A9900.xlsx');

function readZipCentralDir(buffer) {
  const EOCD_SIG = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 4; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error('Not a valid ZIP file');
  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);
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
  const fileNameLen = buffer.readUInt16LE(pos + 26);
  const extraLen = buffer.readUInt16LE(pos + 28);
  const dataStart = pos + 30 + fileNameLen + extraLen;
  const compressed = buffer.slice(dataStart, dataStart + entry.compressedSize);
  if (entry.compression === 0) return compressed;
  if (entry.compression === 8) return zlib.inflateRawSync(compressed);
  return null;
}

function getSharedStrings(buffer, entries) {
  const ssEntry = entries.find(e => e.fileName === 'xl/sharedStrings.xml');
  if (!ssEntry) return [];
  const xml = readEntry(buffer, ssEntry).toString('utf8');
  const strings = [];
  // Parse all <si> elements
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRe.exec(xml)) !== null) {
    const siContent = m[1];
    const tRe = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
    const parts = [];
    let tm;
    while ((tm = tRe.exec(siContent)) !== null) {
      parts.push(tm[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#xD;/g,''));
    }
    strings.push(parts.join(''));
  }
  return strings;
}

function parseSheet(xml, sharedStrings) {
  const rows = {};
  const cellRe = /<c\s+r="([A-Z]+)(\d+)"(?:\s+[^>]*)?>([\s\S]*?)<\/c>/g;
  let m;
  while ((m = cellRe.exec(xml)) !== null) {
    const col = m[1], rowNum = parseInt(m[2]), inner = m[3];
    const typeM = /\st="([^"]*)"/.exec(m[0]);
    const type = typeM ? typeM[1] : '';
    const vM = /<v>([^<]*)<\/v>/.exec(inner);
    if (!vM) continue;
    const rawVal = vM[1];
    let value;
    if (type === 's') value = sharedStrings[parseInt(rawVal)] || '';
    else if (type === 'b') value = rawVal === '1';
    else { const n = parseFloat(rawVal); value = isNaN(n) ? rawVal : n; }
    let colNum = 0;
    for (const ch of col) colNum = colNum * 26 + (ch.charCodeAt(0) - 64);
    if (!rows[rowNum]) rows[rowNum] = {};
    rows[rowNum][colNum] = value;
  }
  return rows;
}

function getSheetNames(buffer, entries) {
  const wbEntry = entries.find(e => e.fileName === 'xl/workbook.xml');
  if (!wbEntry) return [];
  const xml = readEntry(buffer, wbEntry).toString('utf8');
  const names = [];
  const re = /<sheet\s+name="([^"]*)"[^\/]*\/>/g;
  let m;
  while ((m = re.exec(xml)) !== null) names.push(m[1]);
  return names;
}

try {
  const buffer = fs.readFileSync(filePath);
  const entries = readZipCentralDir(buffer);
  const sharedStrings = getSharedStrings(buffer, entries);
  const sheetNames = getSheetNames(buffer, entries);
  
  console.log('=== ANÁLISIS COMPLETO DEL EXCEL CASE IH A9900 ===\n');
  console.log('Total shared strings:', sharedStrings.length);
  
  // Mostrar TODOS los shared strings agrupados
  console.log('\n--- TODOS LOS SHARED STRINGS ---');
  sharedStrings.forEach((s, i) => {
    if (s.trim()) console.log(`[${i}] "${s}"`);
  });
  
  console.log('\n--- HOJAS ---');
  sheetNames.forEach((name, idx) => {
    const sheetEntry = entries.find(e => e.fileName === `xl/worksheets/sheet${idx+1}.xml`);
    if (!sheetEntry) return;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`HOJA ${idx+1}: "${name}"`);
    console.log('='.repeat(80));
    
    const xml = readEntry(buffer, sheetEntry).toString('utf8');
    const rows = parseSheet(xml, sharedStrings);
    const rowNums = Object.keys(rows).map(Number).sort((a,b)=>a-b);
    
    console.log(`Filas: ${rowNums.length}`);
    
    // Mostrar primeras 60 filas completas
    rowNums.slice(0, 60).forEach(rn => {
      const row = rows[rn];
      const cells = Object.entries(row).sort(([a],[b])=>Number(a)-Number(b))
        .map(([c,v])=>`[C${c}]=${JSON.stringify(v)}`).join('  ');
      if (cells.trim()) console.log(`  R${rn}: ${cells}`);
    });
    
    if (rowNums.length > 60) console.log(`  ... y ${rowNums.length-60} filas más`);
  });
  
} catch(e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}
