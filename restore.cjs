const fs = require('fs');
const path = require('path');
const histDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
const targetStr = '/OJT 2nd Sem React/';
const outDir = process.cwd();

const latestVersions = {};

const dirs = fs.readdirSync(histDir);
for (const dir of dirs) {
    const entryPath = path.join(histDir, dir, 'entries.json');
    if (fs.existsSync(entryPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
            // Remove 'file:///' or similar prefixes and decode URI
            let resource = decodeURIComponent(data.resource || "");
            if (resource.includes(targetStr)) {
                let fileRel = resource.substring(resource.indexOf(targetStr) + targetStr.length).replace(/\\/g, '/');
                if (data.entries && data.entries.length > 0) {
                    // Start from the most recent
                    let validContentPath = null;
                    let maxTime = 0;
                    for (let i = data.entries.length - 1; i >= 0; i--) {
                        const entry = data.entries[i];
                        const contentPath = path.join(histDir, dir, entry.id);
                        if (fs.existsSync(contentPath)) {
                            // Verify size isn't 0
                            if (fs.statSync(contentPath).size > 0) {
                                validContentPath = contentPath;
                                maxTime = entry.timestamp;
                                break;
                            }
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

console.log(`Found ${Object.keys(latestVersions).length} files.`);
for (const [fileRel, info] of Object.entries(latestVersions)) {
    // Only restore files in src/ to undo my mistake safely
    if (fileRel.startsWith('src/') || fileRel === 'index.html' || fileRel === 'App.jsx' || fileRel === 'main.jsx') {
        const fullDest = path.join(outDir, fileRel);
        fs.mkdirSync(path.dirname(fullDest), { recursive: true });
        fs.copyFileSync(info.contentPath, fullDest);
        console.log(`Restored ${fileRel}`);
    } else {
        console.log(`Skipped ${fileRel}`);
    }
}
