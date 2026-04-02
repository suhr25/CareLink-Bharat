const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
const extra = '\n/* REACT ROOT FIX */\n#root { position: relative; z-index: 1; }\n#mainApp { position: relative; z-index: 1; min-height: 100vh; }\n.login-overlay { overflow: hidden; }\n';
css += extra;
fs.writeFileSync('src/index.css', css);
console.log('Done');
