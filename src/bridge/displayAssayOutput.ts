import fs from 'fs';
import path from 'path';

function printData() {
  const content = fs.readFileSync(path.resolve(process.cwd(), 'assay_output.txt'), 'utf8');
  console.log("=== BEGIN ASSAY_OUTPUT.TXT ===");
  console.log(content);
  console.log("=== END ASSAY_OUTPUT.TXT ===");
}

printData();
