const fs = require('fs');
const path = require('path');
const histDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
const outDir = process.cwd();

const latestVersions = {};
const dirs = fs.readdirSync(histDir);

for (const dir of dirs) {
    const entryPath = path.join(histDir, dir, 'entries.json');
    if (fs.existsSync(entryPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
            let resource = decodeURIComponent(data.resource || "").replace(/\\/g, '/');
            const target = '/OJT 2nd Sem React/';
            let idx = resource.lastIndexOf(target);
            if (idx !== -1) {
                let fileRel = resource.substring(idx + target.length);
                if (data.entries && data.entries.length > 0) {
                    let validContentPath = null;
                    let maxTime = 0;
                    const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
                    for (let i = data.entries.length - 1; i >= 0; i--) {
                        const entry = data.entries[i];
                        if (entry.timestamp > thirtyMinsAgo) continue; // Skip my recent edits
                        
                        const contentPath = path.join(histDir, dir, entry.id);
                        if (fs.existsSync(contentPath)) {
                            validContentPath = contentPath;
                            maxTime = entry.timestamp;
                            break;
                        }
                    }
                    if (validContentPath) {
                        if (!latestVersions[fileRel] || latestVersions[fileRel].time < maxTime) {
                            latestVersions[fileRel] = {
                                time: maxTime,
                                contentPath: validContentPath
                            };
                        }
                    }
                }
            }
        } catch (e) { }
    }
}

console.log(`Found ${Object.keys(latestVersions).length} candidate files.`);
let restored = 0;
for (const [fileRel, info] of Object.entries(latestVersions)) {
    if (fileRel.startsWith('src/') || fileRel === 'index.html' || fileRel === 'App.jsx' || fileRel === 'main.jsx') {
        const fullDest = path.join(outDir, fileRel);
        fs.mkdirSync(path.dirname(fullDest), { recursive: true });
        
        // Don't overwrite if it's our newly created single-file React App.jsx...
        // Wait, the user WANTS to overwrite it! They said "I want my previous project back"
        // But what if it restores my CURRENT App.jsx from history since I just saved it?
        // Ah! maxTime will pick the LATEST history, which INCLUDES my single-file App.jsx!
        
        console.log(`Candidate to restore: ${fileRel}`);
    }
}
