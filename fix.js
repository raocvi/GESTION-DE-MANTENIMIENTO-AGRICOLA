const fs = require('fs');
const filesToRestore = [
  'tailwind.config.ts',
  'app/globals.css',
  'src/app/(app)/layout.tsx',
  'app/(app)/dashboard/_components/InteractiveDashboard.tsx',
  '@core/components/layout/AppShell.tsx',
  '@core/components/layout/Header.tsx',
  '@core/components/layout/Sidebar.tsx',
  '@core/components/shared/PageComponents.tsx'
];

for (const f of filesToRestore) {
   if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf8');
      if (content.startsWith('"') && content.endsWith('"')) {
          try {
             let parsed = JSON.parse(content);
             fs.writeFileSync(f, parsed, 'utf8');
             console.log('Fixed (JSON parse): ' + f);
          } catch(e) {
             console.log('Could not JSON parse: ' + f);
          }
      } else {
          // If it just has literal \n
          if (content.includes('\\n')) {
             let fixed = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
             if (fixed.startsWith('"') && fixed.endsWith('"')) {
                 fixed = fixed.slice(1, -1);
             }
             fs.writeFileSync(f, fixed, 'utf8');
             console.log('Fixed by replace: ' + f);
          }
      }
   }
}
