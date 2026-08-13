import { assertEqual, assertThrows } from "./assertions.js";
import { encodeShareState, decodeShareState, createShareURL } from "../js/state/state.js";
const TESTS=[]; const test=(name,fn)=>TESTS.push({name,fn});

test("Simple share-state round trip",()=>{ const s={mode:"simple",geometry:"cone",values:{angle:60,angleUnit:"degrees",angleDefinition:"half"}}; const d=decodeShareState(encodeShareState(s)); assertEqual(JSON.stringify(d),JSON.stringify(s),"simple state"); });
test("Spatial share-state round trip",()=>{ const s={mode:"spatial",coordinateMode:"cartesian",observer:{x:0,y:0,z:0},vertices:[{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}]}; const d=decodeShareState(encodeShareState(s)); assertEqual(JSON.stringify(d),JSON.stringify(s),"spatial state"); });
test("Share URL removes unrelated query parameters",()=>{ const url=createShareURL({mode:"simple",geometry:"cone",values:{}},{href:"https://example.test/tool/?embed=1&x=2"}); const u=new URL(url); assertEqual(u.searchParams.has("embed"),false,"embed removed"); assertEqual(u.searchParams.has("state"),true,"state present"); });
test("Oversized share state is rejected",()=>{ assertThrows(()=>encodeShareState({mode:"spatial",text:"x".repeat(10000)}),"oversize"); });
test("Invalid encoded state is rejected",()=>{ assertThrows(()=>decodeShareState("not-json"),"invalid state"); });
export async function runStateTests(){const results=[];for(const {name,fn} of TESTS){try{await fn();results.push({name,passed:true});}catch(error){results.push({name,passed:false,error:error instanceof Error?error.message:String(error)});}}return results;}
