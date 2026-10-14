// Shared offline/browser state contract. Hashes describe integrity, never authorship.
const fail = message => { throw new Error(message); };
const clone = value => JSON.parse(JSON.stringify(value));
export function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') { if (!Number.isFinite(value)) fail('Non-finite JSON number'); return JSON.stringify(value); }
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+canonical(value[k])).join(',') + '}';
  fail('Not a JSON value');
}
export function sha256(text) {
  const bytes = new TextEncoder().encode(text), words = [], length = bytes.length;
  for (let i=0;i<length;i++) words[i>>2]=(words[i>>2]||0)|(bytes[i]<<(24-(i%4)*8));
  words[length>>2]=(words[length>>2]||0)|(0x80<<(24-(length%4)*8));
  const size=((length+9+63)>>6)*16; words[size-2]=Math.floor(length/0x20000000); words[size-1]=length*8;
  const primes=[], initial=[], constants=[];
  for(let n=2;primes.length<64;n++){if(primes.every(p=>n%p)){primes.push(n);if(initial.length<8)initial.push((Math.sqrt(n)%1)*0x100000000|0);constants.push((Math.cbrt(n)%1)*0x100000000|0);}}
  const rotr=(x,n)=>(x>>>n)|(x<<(32-n)), h=initial.slice();
  for(let offset=0;offset<size;offset+=16){const w=[];for(let i=0;i<64;i++){if(i<16)w[i]=words[offset+i]||0;else{const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(rotr(a,7)^rotr(a,18)^(a>>>3))+w[i-7]+(rotr(b,17)^rotr(b,19)^(b>>>10)))|0;}}let [a,b,c,d,e,f,g,j]=h;for(let i=0;i<64;i++){const t=(j+(rotr(e,6)^rotr(e,11)^rotr(e,25))+((e&f)^(~e&g))+constants[i]+w[i])|0;const u=((rotr(a,2)^rotr(a,13)^rotr(a,22))+((a&b)^(a&c)^(b&c)))|0;j=g;g=f;f=e;e=(d+t)|0;d=c;c=b;b=a;a=(t+u)|0;}[a,b,c,d,e,f,g,j].forEach((v,i)=>h[i]=(h[i]+v)|0);}
  return h.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
}
export const hashValue = value => sha256(canonical(value));
const lists=['annotations','drafts','decisions','previewEdits','deleted','unresolved'];
const ordered=items=>items.slice().sort((a,b)=>canonical(a)<canonical(b)?-1:canonical(a)>canonical(b)?1:0);
export function visibleStateHash(bundle,state,entryId) {
  const entry=bundle.entries.find(e=>e.id===entryId);if(!entry)fail('Unknown decision entry');
  const ids=new Set(bundle.elements.filter(e=>e.entry===entryId).map(e=>e.id));
  return hashValue({entry:entryId,before:entry.before.semanticHash||entry.before.hash,after:entry.after.semanticHash||entry.after.hash,deleted:ordered(state.deleted.filter(id=>ids.has(id))),previewEdits:ordered([...state.previewEdits.filter(p=>(p.entry||p.target?.entry)===entryId).reduce((map,p)=>{const value={elementId:p.elementId||p.target?.elementId,kind:p.kind,property:p.property||null,textNodeIndex:p.textNodeIndex??null,value:p.value};map.set(canonical([value.elementId,value.kind,value.property,value.textNodeIndex]),value);return map;},new Map()).values()])});
}
export function criticalIssuesHash(state,entryId) {
  return hashValue(ordered(state.annotations.filter(a=>a.target.entry===entryId&&['P0','P1'].includes(a.priority)).map(a=>({id:a.id,revision:a.revision||1,status:a.status,priority:a.priority,text:a.text,deferredReason:a.deferredReason||null}))));
}
export function decisionStatus(bundle,state,entryId) {
  const decision=state.decisions.find(d=>d.entry===entryId);if(!decision)return 'unreviewed';
  if(decision.visibleStateHash!==visibleStateHash(bundle,state,entryId)||decision.criticalIssuesHash!==criticalIssuesHash(state,entryId))return 'needs-review';
  if(decision.status==='approved'&&state.annotations.some(a=>a.target.entry===entryId&&['P0','P1'].includes(a.priority)&&a.status==='open'&&!decision.deferredIssues?.some(d=>d.id===a.id&&d.revision===(a.revision||1)&&d.reason?.trim())))return 'needs-review';
  return decision.status;
}
function targetCheck(bundle,target) {
  if(!target||!['element','elements','text','region','screen'].includes(target.kind))fail('Invalid annotation target');
  const entry=bundle.entries.find(e=>e.id===target.entry);if(!entry||!['before','after'].includes(target.side)||target.revision!==entry[target.side].revision)fail('Target revision mismatch');
  const ids=target.ids||[target.elementId||target.id].filter(Boolean);
  if(['element','elements','text'].includes(target.kind)&&!ids.length)fail('Missing target elements');
  if(ids.length>500||new Set(ids).size!==ids.length)fail('Invalid selection size');
  for(const id of ids){const e=bundle.elements.find(e=>e.id===id);if(!e||e.entry!==target.entry||e.side!==target.side||e.revision!==target.revision)fail('Invalid target element');}
  if(target.kind==='text'){if(target.side!=='after'||entry[target.side].kind!=='authored')fail('Text requires authored DOM');if(!Number.isInteger(target.start)||!Number.isInteger(target.end)||target.start<0||target.end<target.start||typeof target.quote!=='string')fail('Invalid text anchor');}
  if(target.kind==='region'){if(!['tile-local','viewport-local'].includes(target.coordinateSpace)||!Array.isArray(target.rect)||target.rect.length!==4||!target.rect.every(Number.isFinite)||target.rect.some(v=>v<0)||target.rect[2]<=0||target.rect[3]<=0||!(Number.isFinite(target.width)&&Number.isFinite(target.height)&&target.width>0&&target.height>0))fail('Invalid region anchor');if(target.rect[0]+target.rect[2]>target.width||target.rect[1]+target.rect[3]>target.height)fail('Region outside bounds');if(!target.tileHash&&!target.visibleStateHashAtCreation)fail('Missing region state anchor');if(target.tileHash&&!entry[target.side].tiles?.some(t=>t.image===target.tileHash||hashValue(t)===target.tileHash))fail('Unknown region tile');if(entry[target.side].kind==='authored'&&(!target.scroll||!Number.isFinite(target.scroll.x)||!Number.isFinite(target.scroll.y)||!Array.isArray(target.scroll.containers)))fail('Missing actual region scroll');}
}
export function validateState(bundle,state) {
  if(state?.schemaVersion!==2||state.reviewId!==bundle.reviewId||state.bundleHash!==bundle.bundleHash||state.indexHash!==bundle.indexHash)fail('Review state belongs to another bundle/index');
  if(canonical(state).length>8*1024*1024)fail('Review state too large');
  for(const name of lists)if(!Array.isArray(state[name]))fail('Missing state '+name);
  if(state.annotations.length>5000||state.drafts.length>5000)fail('Too many opinions');
  const ids=new Set();for(const collection of ['annotations','drafts','previewEdits'])for(const item of state[collection]){if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id))fail('Duplicate or invalid state id');ids.add(item.id);}
  const elementIds=new Set(bundle.elements.map(e=>e.id));if(new Set(state.deleted).size!==state.deleted.length||state.deleted.some(id=>!elementIds.has(id)))fail('Unknown/duplicate deleted element');
  for(const item of [...state.annotations,...state.drafts]){targetCheck(bundle,item.target);if(typeof item.text!=='string'||item.text.length>10000)fail('Invalid opinion text');if(item.createdAt!==undefined&&typeof item.createdAt!=='string')fail('Invalid createdAt');if(item.updatedAt!==undefined&&typeof item.updatedAt!=='string')fail('Invalid updatedAt');}
  const replyIds=new Set();for(const a of state.annotations){if(!['P0','P1','P2','P3'].includes(a.priority)||!['open','resolved'].includes(a.status)||!Array.isArray(a.replies))fail('Invalid annotation');for(const r of a.replies){if(!r.id||replyIds.has(r.id)||typeof r.text!=='string'||r.text.length>10000)fail('Invalid/duplicate reply');replyIds.add(r.id);}}
  const decisions=new Set();for(const d of state.decisions){if(!bundle.entries.some(e=>e.id===d.entry)||decisions.has(d.entry)||!['unreviewed','approved','changes-requested','deferred'].includes(d.status)||!/^([a-f0-9]{64})$/.test(d.visibleStateHash)||!/^([a-f0-9]{64})$/.test(d.criticalIssuesHash))fail('Invalid decision');decisions.add(d.entry);}
  for(const p of state.previewEdits){const e=bundle.elements.find(e=>e.id===(p.elementId||p.target?.elementId));if(!e||e.side!=='after'||bundle.entries.find(n=>n.id===e.entry).after.kind!=='authored')fail('Patch requires authored After');if((p.entry||p.target?.entry)!==e.entry||p.target&&(p.target.side&&p.target.side!=='after'||p.target.revision&&p.target.revision!==e.revision))fail('Patch entry/revision mismatch');if(!['text','token','style','asset','structure'].includes(p.kind))fail('Invalid patch kind');if(!p.baseHash||p.baseHash!==bundle.entries.find(n=>n.id===e.entry).after.semanticHash)fail('Patch base mismatch');if(p.kind==='text'&&!e.textEditable&&!(Number.isInteger(p.textNodeIndex)&&p.textNodeIndex>=0&&p.textNodeIndex<e.textNodeCount))fail('Parent text patch would destroy children');if(p.kind==='style'&&!['color','fontSize','fontFamily','fontWeight','margin','padding','gap','textAlign','justifyContent','alignItems'].includes(p.property))fail('Unsupported patch style');if(p.kind==='text'&&(typeof p.value!=='string'||p.value.length>10000))fail('Invalid patch text');if(p.kind==='token'){const tokens=bundle.designContract?.tokens||{};const known=Array.isArray(tokens)?tokens.some(t=>(t.key||t.name)===p.property):Object.prototype.hasOwnProperty.call(tokens,p.property);if(!known||!/^--[a-zA-Z0-9-]+$/.test(p.property)||typeof p.value!=='string'||!p.value||/[;{}<>]|url\s*\(|expression\s*\(|javascript:/i.test(p.value))fail('Invalid design token');}if(p.kind==='style'&&(typeof p.value!=='string'||/[;{}<>]|url\s*\(|expression\s*\(|javascript:/i.test(p.value)))fail('Invalid style value');if(p.kind==='asset'&&!bundle.assets[p.value])fail('Unknown patch asset');if(typeof p.value==='string'&&/(?:url\s*\(|expression\s*\(|javascript:|[<>])/i.test(p.value)&&p.kind!=='text')fail('Unsafe patch value');}
  return state;
}
export function createState(bundle,saved=null,{previousBundle}={}) {
  const state={schemaVersion:2,reviewId:bundle.reviewId,bundleHash:bundle.bundleHash,indexHash:bundle.indexHash,annotations:[],drafts:[],decisions:[],previewEdits:[],deleted:[],unresolved:[]};
  if(!saved)return state;
  if(saved.schemaVersion===1){if(saved.reviewId!==bundle.reviewId)fail('Different review');if(saved.indexHash!==bundle.indexHash&&(!previousBundle||saved.indexHash!==previousBundle.indexHash))fail('Legacy index mismatch');if(saved.deleted?.some(id=>typeof id!=='string')||saved.unresolved?.some(id=>typeof id!=='string'))fail('Invalid legacy state');state.deleted=(saved.deleted||[]).filter(id=>bundle.elements.some(e=>e.id===id));state.unresolved=[...(saved.unresolved||[]),...(saved.deleted||[]).filter(id=>!bundle.elements.some(e=>e.id===id))];return validateState(bundle,state);}
  if(saved.bundleHash===bundle.bundleHash)return clone(validateState(bundle,saved));
  if(!previousBundle||previousBundle.reviewId!==bundle.reviewId||previousBundle.project.key!==bundle.project.key)fail('Explicit previousBundle required for rebase');validateState(previousBundle,saved);
  const unchanged=(entry,side)=>{const old=previousBundle.entries.find(e=>e.id===entry),next=bundle.entries.find(e=>e.id===entry);return old&&next&&old[side].revision===next[side].revision&&old[side].semanticHash===next[side].semanticHash;};
  for(const name of ['annotations','drafts','previewEdits'])for(const item of saved[name]){const target=item.target||{entry:item.entry,side:'after'};if(unchanged(target.entry,target.side))state[name].push(clone(item));else state.unresolved.push({kind:name,item:clone(item),reason:'revision-changed'});}
  for(const id of saved.deleted){const e=previousBundle.elements.find(e=>e.id===id);if(e&&unchanged(e.entry,e.side)&&bundle.elements.some(n=>n.id===id))state.deleted.push(id);else state.unresolved.push({kind:'deleted',item:id,reason:'revision-changed'});}
  state.decisions=clone(saved.decisions.filter(d=>bundle.entries.some(e=>e.id===d.entry)));state.unresolved.push(...clone(saved.unresolved));return validateState(bundle,state);
}
export function mergeState(bundle,current,incoming,resolutions={}) {
  validateState(bundle,current);validateState(bundle,incoming);const state=clone(current),conflicts=[];
  for(const name of lists){const key=item=>typeof item==='string'?item:(name==='decisions'?item.entry:item.id||hashValue(item));const map=new Map(state[name].map(item=>[key(item),item]));const incomingKeys=new Set(incoming[name].map(key));for(const [id,item] of map)if(!incomingKeys.has(id)){const choice=resolutions[name+':'+id];if(choice==='incoming')map.delete(id);else if(choice!=='current')conflicts.push({collection:name,id,current:clone(item),incoming:null});}for(const item of incoming[name]){const id=key(item),old=map.get(id);if(old&&canonical(old)!==canonical(item)){const choice=resolutions[name+':'+id];if(choice==='incoming')map.set(id,clone(item));else if(choice!=='current')conflicts.push({collection:name,id,current:clone(old),incoming:clone(item)});}else if(!old)map.set(id,clone(item));}state[name]=[...map.values()];}return {state:validateState(bundle,state),conflicts};
}
export function createHistory(initial) {
  let state=clone(initial),past=[],future=[];return {get state(){return clone(state)},get canUndo(){return !!past.length},get canRedo(){return !!future.length},push(next){if(canonical(next)===canonical(state))return;past.push(state);state=clone(next);future=[];},undo(){if(past.length){future.push(state);state=past.pop();}return clone(state);},redo(){if(future.length){past.push(state);state=future.pop();}return clone(state);}};
}
