import { runCoreTests } from "./core-tests.js"; import { runSpatialTests } from "./spatial-tests.js";
// state tests use browser btoa/atob in Node 20+, which are available in the supported QA environment.
import { runStateTests } from "./state-tests.js";
const results=[...(await runCoreTests()),...(await runSpatialTests()),...(await runStateTests())];
for(const r of results) console.log(`${r.passed?'PASS':'FAIL'} - ${r.name}${r.error?`: ${r.error}`:''}`);
const failed=results.filter(r=>!r.passed); if(failed.length) process.exit(1); console.log(`All ${results.length} release tests passed.`);
