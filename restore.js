const fs = require('fs');
const logPath = 'C:\\Users\\raulo\\.gemini\\antigravity\\brain\\41682312-5b60-4eac-a574-cffb1f52a25a\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

const filesToRestore = [
  'tailwind.config.ts',
  'globals.css',
  'layout.tsx',
  'InteractiveDashboard.tsx',
  'AppShell.tsx',
  'Header.tsx',
  'Sidebar.tsx',
  'PageComponents.tsx'
];

let states = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    const step = data.step_index || 0;
    
    // Stitch was invoked ~1260, so we only want changes BEFORE that
    if (step >= 1250) continue; 

    if (data.tool_calls) {
      for (const call of data.tool_calls) {
        if (!call.args || !call.args.TargetFile) continue;
        
        let rawTarget = call.args.TargetFile;
        if (typeof rawTarget === 'string') {
          if (rawTarget.startsWith('"') && rawTarget.endsWith('"')) {
            rawTarget = rawTarget.slice(1, -1);
          }
          // Now normalize backslashes
          const target = rawTarget.replace(/\\/g, '/');
          
          for (const f of filesToRestore) {
            if (target.endsWith('/' + f) || target.endsWith(f)) {
              if (!states[f]) states[f] = { file: rawTarget, content: '' };
              
              if (call.name === 'write_to_file') {
                 states[f].content = call.args.CodeContent;
              } else if (call.name === 'replace_file_content') {
                 let targetStr = call.args.TargetContent;
                 let repStr = call.args.ReplacementContent;
                 if (typeof targetStr === 'string' && targetStr.startsWith('"') && targetStr.endsWith('"')) targetStr = targetStr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
                 if (typeof repStr === 'string' && repStr.startsWith('"') && repStr.endsWith('"')) repStr = repStr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
                 
                 if (states[f].content) {
                   states[f].content = states[f].content.replace(targetStr, repStr);
                 }
              } else if (call.name === 'multi_replace_file_content') {
                 if (states[f].content) {
                   let content = states[f].content;
                   let chunksStr = call.args.ReplacementChunks;
                   let chunks = [];
                   if (typeof chunksStr === 'string') {
                      let cleanStr = chunksStr;
                      if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
                         cleanStr = cleanStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
                      }
                      try { chunks = JSON.parse(cleanStr); } catch(e) {}
                   } else {
                      chunks = chunksStr;
                   }
                   if (Array.isArray(chunks)) {
                     for (const chunk of chunks) {
                       let targetStr = chunk.TargetContent;
                       let repStr = chunk.ReplacementContent;
                       if (typeof targetStr === 'string' && targetStr.startsWith('"') && targetStr.endsWith('"')) targetStr = targetStr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
                       if (typeof repStr === 'string' && repStr.startsWith('"') && repStr.endsWith('"')) repStr = repStr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
                       content = content.replace(targetStr, repStr);
                     }
                   }
                   states[f].content = content;
                 }
              }
            }
          }
        }
      }
    }
  } catch(e) {}
}

let restoredCount = 0;
for (const f in states) {
  if (states[f] && states[f].content) {
    try {
       // Remove any surrounding quotes from the content if it was double-encoded
       let finalContent = states[f].content;
       if (typeof finalContent === 'string' && finalContent.startsWith('"') && finalContent.endsWith('"')) {
           finalContent = finalContent.substring(1, finalContent.length - 1);
           finalContent = finalContent.replace(/\\n/g, '\n').replace(/\\"/g, '"');
       }
       fs.writeFileSync(states[f].file, finalContent, 'utf8');
       console.log('Restored: ' + states[f].file);
       restoredCount++;
    } catch(err) {
       console.error('Failed to restore ' + f + ': ' + err.message);
    }
  }
}
console.log('Total files restored:', restoredCount);
