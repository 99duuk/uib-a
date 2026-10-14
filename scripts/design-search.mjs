import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const dataFile=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../data/design-guidance/ux.json');
export async function searchGuidance(query,{domain,limit=5}={}) {
  if(typeof query!=='string'||!query.trim()||query.length>1000)throw Error('Query must contain 1–1000 characters');
  if(!Number.isInteger(limit)||limit<1||limit>20)throw Error('Limit must be 1–20');
  const terms=[...new Set(query.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[])];
  const records=JSON.parse(await fs.readFile(dataFile,'utf8'));
  if(domain&&!records.some(r=>r.domain===domain))throw Error('Unknown guidance domain: '+domain);
  const scored=records.filter(r=>!domain||r.domain===domain).map(record=>{
    const labels=[record.title,record.domain,...record.tags].join(' ').toLowerCase();
    const body=[record.description,record.recommendation,record.avoid].join(' ').toLowerCase();
    const matched=terms.filter(t=>labels.includes(t)||(t.length>=3&&body.includes(t)));
    return {...record,score:matched.reduce((n,t)=>n+(labels.includes(t)?3:1),0),matched};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
  return {query,domain:domain||null,status:scored.length?'match':'no-result',records:scored,limitations:['Curated guidance, not a layout generator.','Source recommendations need product-specific review; no-result never invents a default.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2),options={};let query;
  try{for(let i=0;i<args.length;i++){const key=args[i];if(!['--query','--domain','--limit'].includes(key)||!args[i+1])throw Error('Usage: design-search.mjs --query <text> [--domain <domain>] [--limit <1–20>]');const value=args[++i];if(key==='--query')query=value;else options[key.slice(2)]=key==='--limit'?Number(value):value;}console.log(JSON.stringify(await searchGuidance(query,options),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
