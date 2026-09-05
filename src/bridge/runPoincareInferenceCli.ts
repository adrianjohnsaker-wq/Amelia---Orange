import { runPoincareSeparationInference, formatInferenceResultsCsv } from './AmeliaPoincareInferenceAssay';

const report = runPoincareSeparationInference();

console.log("=== INFERENCE REPORT JSON ===");
console.log(JSON.stringify(report, null, 2));

console.log("\n=== RESULTS TABLE CSV ===");
console.log(formatInferenceResultsCsv(report.resultsTable));

console.log("\n=== INPUT CSV ===");
console.log(report.inputCsv);
console.log("\nINPUT CSV SHA256:", report.inputCsvSha256);
