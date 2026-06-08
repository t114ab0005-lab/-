const fs = require('fs');
try {
  fs.copyFileSync('test-run.log', 'test-run-out.js');
  console.log("Successfully copied!");
} catch (e) {
  console.error("Copy failed:", e);
}
process.exit(0);
