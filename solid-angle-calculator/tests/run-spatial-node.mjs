import { runSpatialTests } from "./spatial-tests.js";

const results = await runSpatialTests();
for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"} - ${result.name}${result.error ? `: ${result.error}` : ""}`);
}
const failed = results.filter((result) => !result.passed);
if (failed.length) process.exit(1);
console.log(`All ${results.length} spatial tests passed.`);
