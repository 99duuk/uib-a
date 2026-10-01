import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const readJSON = async p => JSON.parse(await fs.readFile(p,'utf8'));
export const writeJSON = async (p,v) => fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export const jsonScript = v => JSON.stringify(v).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
export const eid = (project,entry,side,revision,key) => ['UIR',project,entry,side,revision,key].map(encodeURIComponent).join('/');
export function check(condition,message) { if(!condition) throw new Error(message); }
export function unique(list,label) { check(new Set(list).size===list.length,`Duplicate ${label}`); }
export async function newOutput(dir,file='before-after.html') {
  await fs.mkdir(dir,{recursive:true});
  try { await fs.access(path.join(dir,file)); throw new Error(`Output exists: ${path.join(dir,file)}. Choose a new run directory.`); }
  catch(e) { if(e.code!=='ENOENT')throw e; }
}
export function validateBundle(b) {
  check(b?.schemaVersion===1&&b?.generator==='uib-a','Unsupported bundle');
  check(Array.isArray(b.entries)&&b.entries.length&&Array.isArray(b.elements),'Missing bundle entries/index');
  unique(b.entries.map(e=>e.id),'entry ids');unique(b.elements.map(e=>e.id),'element ids');
  const ids=new Map(b.elements.map(e=>[e.id,e]));
  for(const entry of b.entries){check(hash(entry.after.html)===entry.after.hash,'After content hash mismatch');const {hash:beforeHash,...before}=entry.before;check(hash(JSON.stringify(before))===beforeHash,'Before content hash mismatch');}
  for(const e of b.elements){const entry=b.entries.find(n=>n.id===e.entry);check(entry&&['before','after'].includes(e.side),'Unknown element entry/side');check(e.revision===entry[e.side].revision&&e.id===eid(b.project.key,e.entry,e.side,e.revision,e.key),'Element identity mismatch');if(e.parent){const p=ids.get(e.parent);check(p&&p.entry===e.entry&&p.side===e.side&&p.revision===e.revision,'Cross-entry element parent');}}
  for(const e of b.elements){let node=e;const visited=new Set();while(node?.parent){check(!visited.has(node.id),'Cyclic element parents');visited.add(node.id);check(ids.has(node.parent),'Unknown parent');node=ids.get(node.parent);}}
  check(hash(JSON.stringify(b.elements))===b.indexHash,'Element index hash mismatch');
  for(const [id,a] of Object.entries(b.assets)){check(/^data:[\w/+.-]+;base64,/.test(a.data),'Invalid asset');check(hash(Buffer.from(a.data.split(',')[1],'base64'))===id,'Asset hash mismatch');}
  return b;
}
export async function loadReview(file) {
  const html=await fs.readFile(file,'utf8');
  const get=id=>{const m=html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)<\\/script>`));check(m,`Missing ${id}`);return JSON.parse(m[1]);};
  const bundle=validateBundle(get('uib-payload')),state=get('uib-state');
  check(state.schemaVersion===1&&state.reviewId===bundle.reviewId,'Review state belongs to another document');
  return {bundle,state};
}
