import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import Ajv from 'ajv';
import fsSync from 'node:fs';
import {parseHTML} from 'linkedom';
import {hashValue,createState,validateState} from './review-state.mjs';
export {hashValue,createState,validateState} from './review-state.mjs';

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
const schemaValidators=new Map();
export function validateSchema(name,value){let validator=schemaValidators.get(name);if(!validator){validator=new Ajv({allErrors:true,strict:false}).compile(JSON.parse(fsSync.readFileSync(path.join(ROOT,'references',name+'.schema.json'),'utf8')));schemaValidators.set(name,validator);}check(validator(value),name+' schema: '+JSON.stringify(validator.errors));return value;}
export const MAX_ASSET_BYTES=32*1024*1024;
export async function safeReadPath(root,from,ref) {
  check(typeof ref==='string'&&!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref),'External path forbidden');
  const resolved=await fs.realpath(path.resolve(from,decodeURIComponent(ref.split(/[?#]/)[0]))),approved=await Promise.all((Array.isArray(root)?root:[root]).map(r=>fs.realpath(r)));
  check(approved.some(r=>resolved===r||resolved.startsWith(r+path.sep)),'Path escapes approved read root');return resolved;
}
export function assertSafeSVG(text) {
  check(!/<!DOCTYPE|<!ENTITY|<(?:script|foreignObject|iframe|object|embed)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|url\s*\(\s*["']?(?!#)|@import/i.test(text),'Unsafe SVG');
}
export function assertSafeAuthored(html,assets) {
  const {document}=parseHTML(html);
  check(!document.querySelector('script,iframe,object,embed,base,link,meta[http-equiv]'),'Executable authored content');
  for(const e of document.querySelectorAll('*'))for(const a of e.attributes){const n=a.name.toLowerCase();check(!n.startsWith('on')&&!['srcdoc','action','formaction','target','ping','srcset','href','xlink:href','background','poster'].includes(n),'Executable authored attribute');if(n==='src')check(/^uib-asset:[a-f0-9]{64}$/.test(a.value),'Unbundled image source');}
  const css=[...document.querySelectorAll('style')].map(e=>e.textContent).concat([...document.querySelectorAll('[style]')].map(e=>e.getAttribute('style'))).join('\n');
  check(!/@import|expression\s*\(|javascript:|behavior\s*:|@namespace/i.test(css),'Unsafe authored CSS');
  for(const m of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g))check(m[2].startsWith('#')||/^uib-asset:[a-f0-9]{64}$/.test(m[2]),'Unbundled CSS resource');
  for(const m of html.matchAll(/uib-asset:([a-f0-9]{64})/g))check(assets[m[1]],'Unknown authored asset');
  return document;
}
export function semanticSide(side) {
  if(side.kind==='authored'||side.html)return hashValue({html:side.html});
  const provenance=side.provenance||{}, conditions={};
  for(const key of ['viewport','dpr','browser','browserVersion','locale','timezone','colorScheme','reducedMotion','fixtureVersion','fixture','adapterHash','sourceRevision','renderProfile','stateProfile','fonts','assets'])if(provenance[key]!==undefined)conditions[key]=provenance[key];
  const tiles=(side.tiles||[]).map(t=>({id:t.id,width:t.width,height:t.height,image:t.image,rects:t.rects||[],scroll:t.scroll||null,dpr:t.dpr||1,renderProfile:t.renderProfile||null,stateProfile:t.stateProfile||null}));
  return hashValue({kind:side.kind,tiles,conditions,index:side.semanticIndex||[]});
}
export function upgradeBundle(bundle) {
  const b=JSON.parse(JSON.stringify(bundle));if(bundle.schemaVersion===1)for(const entry of b.entries){if(!entry.after.html)continue;const {document}=parseHTML(entry.after.html);for(const e of b.elements.filter(e=>e.entry===entry.id&&e.side==='after')){const n=[...document.querySelectorAll('[data-review-key]')].find(n=>n.getAttribute('data-review-key')===e.key);if(n){e.textEditable=!n.querySelector('[data-review-key]')&&!n.children.length;e.textNodeCount=[...n.childNodes].filter(x=>x.nodeType===3).length;}}}b.schemaVersion=2;
  for(const entry of b.entries)for(const name of ['before','after']){const side=entry[name];side.kind=side.kind||(side.html?'authored':'image');if(!side.html)side.semanticIndex=b.elements.filter(e=>e.entry===entry.id&&e.side===name).map(e=>({key:e.key,parent:b.elements.find(n=>n.id===e.parent)?.key||null})).sort((a,c)=>a.key<c.key?-1:a.key>c.key?1:0);side.semanticHash=semanticSide(side);side.provenanceHash=hashValue(side.provenance||{});}
  b.indexHash=hashValue(b.elements);delete b.bundleHash;b.bundleHash=hashValue(b);return b;
}
export function validateBundle(b) {
  if(b?.schemaVersion===2)validateSchema('bundle',b);
  check([1,2].includes(b?.schemaVersion)&&b?.generator==='uib-a','Unsupported bundle');
  check(Array.isArray(b.entries)&&b.entries.length&&b.entries.length<=500&&Array.isArray(b.elements)&&b.elements.length<=50000&&b.assets&&b.project?.key,'Missing/oversized bundle');
  unique(b.entries.map(e=>e.id),'entry ids');unique(b.elements.map(e=>e.id),'element ids');
  const ids=new Map(b.elements.map(e=>[e.id,e]));
  for(const [id,a] of Object.entries(b.assets)){check(/^data:(image\/(png|jpeg|webp|gif|svg\+xml)|font\/(woff2?|ttf));base64,[a-z\d+/=\s]+$/i.test(a.data)&&a.data.startsWith('data:'+a.mime+';base64,'),'Invalid asset');const bytes=Buffer.from(a.data.split(',')[1],'base64');check(bytes.length<=MAX_ASSET_BYTES&&a.bytes===bytes.length&&hash(bytes)===id,'Asset hash/size mismatch');if(a.mime==='image/svg+xml')assertSafeSVG(bytes.toString());}
  for(const entry of b.entries){
    if(entry.after.html){check(hash(entry.after.html)===entry.after.hash,'After content hash mismatch');assertSafeAuthored(entry.after.html,b.assets);}
    if(b.schemaVersion===1){const {hash:beforeHash,...before}=entry.before;check(hash(JSON.stringify(before))===beforeHash,'Before content hash mismatch');}
    else for(const name of ['before','after']){const side=entry[name];check(['authored','dom','manual','image','missing','captured','capture'].includes(side.kind),'Unknown side kind');check(side.semanticHash===semanticSide(side),'Side semantic hash mismatch');check(side.provenanceHash===hashValue(side.provenance||{}),'Provenance hash mismatch');for(const tile of side.tiles||[]){check(tile.width>0&&tile.height>0&&tile.width<=32000&&tile.height<=32000&&b.assets[tile.image],'Invalid tile');for(const r of tile.rects||[])check(ids.has(r.id)&&Array.isArray(r.rect)&&r.rect.length===4&&r.rect.every(Number.isFinite)&&r.rect[2]>=0&&r.rect[3]>=0,'Invalid tile rectangle');}}
  }
  for(const e of b.elements){const entry=b.entries.find(n=>n.id===e.entry);check(entry&&['before','after'].includes(e.side),'Unknown element entry/side');check(e.revision===entry[e.side].revision&&e.id===eid(b.project.key,e.entry,e.side,e.revision,e.key),'Element identity mismatch');if(e.parent){const p=ids.get(e.parent);check(p&&p.entry===e.entry&&p.side===e.side&&p.revision===e.revision,'Cross-entry element parent');}}
  for(const e of b.elements){let node=e;const visited=new Set();while(node?.parent){check(!visited.has(node.id),'Cyclic element parents');visited.add(node.id);check(ids.has(node.parent),'Unknown parent');node=ids.get(node.parent);}}
  check((b.schemaVersion===1?hash(JSON.stringify(b.elements)):hashValue(b.elements))===b.indexHash,'Element index hash mismatch');
  if(b.schemaVersion===2){const {bundleHash,...rest}=b;check(bundleHash===hashValue(rest),'Bundle hash mismatch');}return b;
}
export async function loadReview(file) {
  const stat=await fs.stat(file);check(stat.size<=128*1024*1024,'Review file too large');const html=await fs.readFile(file,'utf8');
  const get=id=>{const matches=[...html.matchAll(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>','g'))];check(matches.length===1,'Missing/duplicate '+id);return JSON.parse(matches[0][1]);};
  const original=validateBundle(get('uib-payload')),saved=get('uib-state');
  if(original.schemaVersion===1){check(saved.schemaVersion===1&&saved.reviewId===original.reviewId&&saved.indexHash===original.indexHash,'Legacy state/index mismatch');const bundle=upgradeBundle(original);return {bundle,state:createState(bundle,saved,{previousBundle:original})};}
  validateSchema('review-state',saved);return {bundle:original,state:validateState(original,saved)};
}
