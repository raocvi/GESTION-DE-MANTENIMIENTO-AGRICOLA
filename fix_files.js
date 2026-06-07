const fs = require('fs');
const files = [
  '@core/components/shared/PageComponents.tsx',
  '@core/components/layout/Sidebar.tsx',
  '@core/components/layout/Header.tsx',
  '@core/components/layout/AppShell.tsx',
  'src/app/(app)/layout.tsx',
  'app/globals.css',
  'tailwind.config.ts',
  'app/(app)/dashboard/_components/InteractiveDashboard.tsx'
];

let fixed = 0;
for(const file of files) {
   if (fs.existsSync(file)) {
       let content = fs.readFileSync(file, 'utf8').trim();
       if (content.startsWith('"') && content.endsWith('"')) {
           try {
               const decoded = JSON.parse(content);
               fs.writeFileSync(file, decoded, 'utf8');
               console.log('Fixed', file);
               fixed++;
           } catch(e) {
               console.error('Failed to parse', file, e);
           }
       }
   }
}
console.log('Total fixed: ' + fixed);
