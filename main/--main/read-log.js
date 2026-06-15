const fs = require('fs');
try {
  const content = fs.readFileSync('test-run.log', 'utf8');
  fs.writeFileSync('log-output.js', '// ' + content.replace(/\r?\n/g, '\n// '));
  console.log("Log read successfully");
} catch (e) {
  fs.writeFileSync('log-output.js', '// Error: ' + e.message);
}
process.exit(0);
