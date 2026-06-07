const fs = require('fs');
const logPath = 'C:\\\\Users\\\\raulo\\\\.gemini\\\\antigravity\\\\brain\\\\41682312-5b60-4eac-a574-cffb1f52a25a\\\\.system_generated\\\\logs\\\\transcript.jsonl';

const files = [
  'tailwind.config.ts',
  'globals.css',
  'layout.tsx',
  'AppShell.tsx',
  'Header.tsx',
  'Sidebar.tsx',
  'PageComponents.tsx',
  'InteractiveDashboard.tsx'
];

const results = {};

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const data = JSON.parse(line);
        if (data.tool_calls) {
            for (const call of data.tool_calls) {
                const args = call.args || {};
                if (args.CodeContent && !args.CodeContent.includes('<truncated')) {
                    const target = args.TargetFile || '';
                    for (const fname of files) {
                        if (target.endsWith(fname)) {
                            if (!results[fname]) {
                                results[fname] = args.CodeContent;
                            }
                        }
                    }
                }
            }
        }
    } catch(e) {}
}

for (const fname in results) {
    console.log('Found', fname);
    fs.writeFileSync('restored_' + fname, results[fname], 'utf8');
}
