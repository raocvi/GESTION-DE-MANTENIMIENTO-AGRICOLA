const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Leer xlsx sin dependencias (es un ZIP con XML)
const filePath = path.join(__dirname, '..', '..', 'ANEXOS', 'Plan_Mantenimiento_CaseIH_A9900.xlsx');

console.log('Leyendo archivo:', filePath);
console.log('Existe:', fs.existsSync(filePath));

// Leer como ZIP
try {
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  
  console.log('\nArchivos dentro del XLSX:');
  zipEntries.forEach(e => console.log(' -', e.entryName, e.header.size, 'bytes'));
  
  // Leer strings compartidos
  const sharedStringsEntry = zip.getEntry('xl/sharedStrings.xml');
  let sharedStrings = [];
  if (sharedStringsEntry) {
    const xml = sharedStringsEntry.getData().toString('utf8');
    const matches = xml.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
    sharedStrings = matches.map(m => m.replace(/<t[^>]*>/, '').replace(/<\/t>/, ''));
  }
  
  console.log('\nStrings compartidos (primeros 50):', sharedStrings.slice(0, 50));
  
} catch(e) {
  console.error('Error:', e.message);
}
