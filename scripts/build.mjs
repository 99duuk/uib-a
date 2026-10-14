import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseHTML} from 'linkedom';
import Ajv from 'ajv';
import {sourceRevision} from './release-files.mjs';
import {ROOT,readJSON,writeJSON,hash,jsonScript,eid,check,unique,newOutput,validateBundle,safeReadPath,MAX_ASSET_BYTES,assertSafeSVG,upgradeBundle,createState,validateSchema} from './lib.mjs';

const MIME={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
function cleanDOM(document) {
  document.querySelectorAll('script,iframe,object,embed,base,meta[http-equiv],link:not([rel="stylesheet"])').forEach(e=>e.remove());
  for(const e of document.querySelectorAll('*')) for(const attr of [...e.attributes]) {
    const n=attr.name.toLowerCase();
    if(n.startsWith('on')||['srcdoc','formaction','action','target','ping','srcset'].includes(n)||(/^\s*(javascript|vbscript):/i.test(attr.value)))e.removeAttribute(attr.name);
  }
  document.querySelectorAll('a').forEach(e=>e.removeAttribute('href'));
}
export async function build(manifestFile,outDir,{assetRoots=[]}={}) {
  const input=await readJSON(manifestFile),base=path.dirname(path.resolve(manifestFile));
  const validate=new Ajv({allErrors:true,strict:false}).compile(await readJSON(path.join(ROOT,'references/manifest.schema.json')));
  check(validate(input),JSON.stringify(validate.errors));
  unique(input.viewports.map(v=>v.id),'viewports');unique(input.entries.map(e=>e.id),'entries');
  unique(input.entries.map(e=>JSON.stringify([e.group||'Screens',e.screen,e.state,e.viewport,e.variant||'default'])),'screen/state/viewport/variant combinations');
  await newOutput(outDir);
  const assets=Object.create(null),elements=[],entries=[],assetReadRoots=[base,...assetRoots.map(r=>path.resolve(r))];
  async function asset(ref,from) {
    if(ref.startsWith('data:')) {
      check(/^data:(image\/(png|jpeg|webp|gif)|font\/(woff2?|ttf));base64,[a-z\d+/=\s]+$/i.test(ref),'Unsupported inline asset');
      const bytes=Buffer.from(ref.split(',')[1],'base64'),id=hash(bytes);check(bytes.length<=MAX_ASSET_BYTES,'Asset exceeds size limit');assets[id]={mime:ref.slice(5,ref.indexOf(';')),data:ref,bytes:bytes.length};return id;
    }
    check(!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref),'Remote or absolute-URL asset must be downloaded and reviewed first: '+ref);
    const p=await safeReadPath(assetReadRoots,from,ref);
    const mime=MIME[path.extname(p).toLowerCase()];check(mime,'Unsupported asset type: '+path.basename(p));
    let bytes=await fs.readFile(p);check(bytes.length<=MAX_ASSET_BYTES,'Asset exceeds size limit');
    if(mime==='image/svg+xml') {
      assertSafeSVG(bytes.toString());
    }
    const id=hash(bytes);assets[id]={mime,data:`data:${mime};base64,${bytes.toString('base64')}`,bytes:bytes.length};return id;
  }
  async function css(text,from,seen=new Set()) {
    check(!/@import/i.test(text),'Inline CSS imports before building; @import is not portable');
    let result='',last=0;
    for(const m of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)){
      result+=text.slice(last,m.index);last=m.index+m[0].length;
      result+=m[2].startsWith('#')?m[0]:`url("uib-asset:${await asset(m[2],from)}")`;
    }
    return result+text.slice(last);
  }
  for(const original of input.entries) {
    const viewport=input.viewports.find(v=>v.id===original.viewport);check(viewport,'Unknown viewport '+original.viewport);
    const entry={id:original.id,screen:original.screen,state:original.state,viewport:original.viewport,title:original.title,group:original.group||'Screens',route:original.route||'',variant:original.variant||'default',notes:original.notes||'',fixture:original.fixture||'unspecified'};
    if(!original.after.kind||original.after.kind==='authored'){
    const htmlFile=await safeReadPath(base,base,original.after.file),{document}=parseHTML(await fs.readFile(htmlFile,'utf8'));
    cleanDOM(document);
    for(const el of document.querySelectorAll('link[rel="stylesheet"]')) {
      const href=el.getAttribute('href');check(href&&!/^(https?:|\/\/)/.test(href),'External stylesheet');
      const file=await safeReadPath(assetReadRoots,path.dirname(htmlFile),href),style=document.createElement('style');
      style.textContent=await css(await fs.readFile(file,'utf8'),path.dirname(file));el.replaceWith(style);
    }
    for(const el of document.querySelectorAll('style'))if(!el.textContent.includes('uib-asset:'))el.textContent=await css(el.textContent,path.dirname(htmlFile));
    for(const el of document.querySelectorAll('[style]'))el.setAttribute('style',await css(el.getAttribute('style'),path.dirname(htmlFile)));
    for(const el of document.querySelectorAll('[src]')) {
      check(el.tagName==='IMG','Only static images are supported as src assets');
      el.setAttribute('src','uib-asset:'+await asset(el.getAttribute('src'),path.dirname(htmlFile)));
    }
    document.body.setAttribute('data-review-key','root');
    const nodes=[...document.querySelectorAll('[data-review-key]')];
    unique(nodes.map(n=>n.getAttribute('data-review-key')),`semantic keys in ${entry.id}`);
    const ids=new Map(nodes.map(n=>[n,eid(input.project.key,entry.id,'after',original.after.revision,n.getAttribute('data-review-key'))]));
    for(const n of nodes) {
      const key=n.getAttribute('data-review-key');check(key.trim(),'Empty semantic key');
      const parent=n.parentElement?.closest('[data-review-key]');
      const own=[...n.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join(' ').trim();
      const label=(n.getAttribute('data-review-label')||n.getAttribute('aria-label')||n.getAttribute('alt')||own||n.textContent||n.tagName).replace(/\s+/g,' ').slice(0,140);
      n.setAttribute('data-uib-id',ids.get(n));
      elements.push({id:ids.get(n),key,parent:ids.get(parent)||null,entry:entry.id,side:'after',revision:original.after.revision,tag:n.tagName.toLowerCase(),label,mapping:'dom',locator:`[data-review-key=${JSON.stringify(key)}]`,textEditable:!n.querySelector('[data-review-key]')&&![...n.children].length,textNodeCount:[...n.childNodes].filter(x=>x.nodeType===3).length,sourceHint:n.getAttribute('data-source-file')?{file:n.getAttribute('data-source-file'),line:Number(n.getAttribute('data-source-line'))||null,component:n.getAttribute('data-source-component')||null,provenance:'authored-metadata'}:null});
    }
    const ignored=[...document.querySelectorAll('h1,h2,h3,p,button,input,select,textarea,img,svg,summary')].filter(n=>!n.hasAttribute('data-review-key')&&!n.hasAttribute('data-review-ignore'));
    check(!ignored.length,`Missing data-review-key or data-review-ignore in ${entry.id}: ${ignored.slice(0,5).map(n=>n.tagName).join(', ')}`);
    entry.after={revision:original.after.revision,html:'<!doctype html>\n'+document.documentElement.outerHTML};
    entry.after.hash=hash(entry.after.html);entry.after.kind='authored';
    } else entry.after={kind:original.after.kind,revision:original.after.revision,tiles:[]};
    for(const sideName of ['before','after']) {if(sideName==='after'&&entry.after.kind==='authored')continue;
    const before=original[sideName]||{kind:'missing',revision:'unavailable'};
    entry[sideName]={kind:before.kind,revision:before.revision,tiles:[]};
    if(before.kind!=='missing') {
      entry[sideName].provenance={};
      let captures,from=base;
      if(before.capture) {const file=await safeReadPath(base,base,before.capture);const cap=await readJSON(file);captures=cap.tiles;from=path.dirname(file);entry[sideName].provenance=cap.provenance||{};}
      else captures=[{id:'top',image:before.image,width:before.width||viewport.width,height:before.height||viewport.height,elements:before.elements||[]}];
      check(captures?.length,'Before has no tiles');unique(captures.map(t=>t.id),'capture tiles');
      const mapped=new Map();
      for(const tile of captures) {
        check(tile.width>0&&tile.height>0,'Invalid capture dimensions');
        const image=await asset(tile.image,from),rects=[];
        const candidates=tile.elements?.length?tile.elements:[{key:'root',parent:null,tag:'img',label:'화면 전체',rect:[0,0,tile.width,tile.height]}];
        unique(candidates.map(e=>e.key),'capture element keys');
        for(const n of candidates) {
          check(Array.isArray(n.rect)&&n.rect.length===4&&n.rect.every(Number.isFinite)&&n.rect[2]>=0&&n.rect[3]>=0,'Invalid capture rect');
          const id=eid(input.project.key,entry.id,sideName,before.revision,n.key);
          const item={id,key:n.key,parent:n.parent?eid(input.project.key,entry.id,sideName,before.revision,n.parent):null,entry:entry.id,side:sideName,revision:before.revision,tag:n.tag||'region',label:n.label||n.key,mapping:before.kind,locator:n.locator||null,sourceHint:n.sourceHint||null,computed:n.computed||null};
          if(!mapped.has(id))mapped.set(id,item);
          rects.push({id,rect:n.rect});
        }
        entry[sideName].tiles.push({id:tile.id,label:tile.label||tile.id,width:tile.width,height:tile.height,image,rects,scroll:tile.scroll||null,dpr:tile.dpr||1,renderProfile:tile.renderProfile||null,stateProfile:tile.stateProfile||null});
      }
      // Invisible parents may be absent from a clipped capture: climb only known nodes.
      for(const item of mapped.values())if(item.parent&&!mapped.has(item.parent))item.parent=null;
      elements.push(...mapped.values());
    }
    entry[sideName].hash=hash(JSON.stringify(entry[sideName]));}entries.push(entry);
  }
  let bundle={schemaVersion:1,generator:'uib-a',generatorVersion:'2.0.1',reviewId:input.reviewId||input.project.key,project:input.project,viewports:input.viewports,brand:input.brand||{},research:input.research||[],coverage:input.coverage||{},entries,elements,assets,indexHash:hash(JSON.stringify(elements))};
  bundle.sourceBuild=sourceRevision(ROOT);
  if(!bundle.sourceBuild.sha){try{bundle.sourceBuild=(await readJSON(path.join(ROOT,'installation.json'))).sourceBuild;}catch{}}
  bundle.designContract=input.designContract?await readJSON(await safeReadPath(base,base,input.designContract)):{};
  if(input.designContract){validateSchema('design-contract',bundle.designContract);const {auditDesignContract}=await import('./design-contract.mjs');bundle.designAudit=auditDesignContract(bundle.designContract,bundle);}
  const {enrichComparisons}=await import('./compare.mjs');await enrichComparisons(bundle,input,base);
  bundle=upgradeBundle(bundle);validateBundle(bundle);
  let previous,previousOriginal;
  if(input.previousBundle){const raw=validateBundle(await readJSON(await safeReadPath(base,base,input.previousBundle)));previousOriginal=raw;previous=raw.schemaVersion===1?upgradeBundle(raw):raw;check(previous.project.key===bundle.project.key&&previous.reviewId===bundle.reviewId,'Previous bundle is a different project/review');for(const entry of bundle.entries){const old=previous.entries.find(e=>e.id===entry.id);if(old)for(const side of ['before','after'])check(old[side].revision!==entry[side].revision||old[side].semanticHash===entry[side].semanticHash,`${entry.id} ${side} changed without a revision bump`);}}
  const saved=input.reviewState?await readJSON(await safeReadPath(base,base,input.reviewState)):null;
  const state=createState(bundle,saved,{previousBundle:saved?.schemaVersion===1?previousOriginal:previous});
  const html=await renderReview(bundle,state);
  await fs.writeFile(path.join(outDir,'before-after.html'),html);
  await writeJSON(path.join(outDir,'review-manifest.json'),bundle);
  await writeJSON(path.join(outDir,'element-index.json'),elements);
  await writeJSON(path.join(outDir,'brand-profile.json'),bundle.brand);
  await writeJSON(path.join(outDir,'research.json'),bundle.research);
  await writeJSON(path.join(outDir,'coverage.json'),bundle.coverage);
  await writeJSON(path.join(outDir,'design-contract.json'),bundle.designContract);
  if(bundle.designAudit)await writeJSON(path.join(outDir,'design-audit.json'),bundle.designAudit);
  await fs.writeFile(path.join(outDir,'README.md'),'# UI review\n\nOpen `before-after.html` directly in a browser. No server is needed. Use the review toolbar to select, copy, remove, restore, and save elements. Unsaved changes reset on refresh. Before removal masks pixels; After removal reflows the layout. Research and coverage limitations appear inside the HTML.\n');
  return bundle;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(process.argv.length<4){console.error('Usage: node scripts/build.mjs <manifest.json> <new-output-directory>');process.exit(1);}
  const flags=process.argv.slice(4),assetRoots=[];for(let i=0;i<flags.length;i++){if(flags[i]!=='--asset-root'||!flags[i+1]){console.error('Use --asset-root <approved directory>');process.exit(1);}assetRoots.push(flags[++i]);}
  build(path.resolve(process.argv[2]),path.resolve(process.argv[3]),{assetRoots}).then(b=>console.log(`Built ${b.entries.length} entries, ${b.elements.length} elements`)).catch(e=>{console.error(e.message);process.exit(1)});
}

export async function renderReview(bundle,state) {
  validateBundle(bundle);const {validateState}=await import('./review-state.mjs');validateState(bundle,state);
  const shell=await fs.readFile(path.join(ROOT,'assets/reviewer/shell.html'),'utf8'),style=await fs.readFile(path.join(ROOT,'assets/reviewer/viewer.css'),'utf8');
  const stateCode=await fs.readFile(path.join(ROOT,'scripts/review-state.mjs'),'utf8');
  const expose='globalThis.UIBReviewState={hashValue,createState,validateState,visibleStateHash,criticalIssuesHash,decisionStatus,mergeState,createHistory};';
  let handoff='';try{handoff=await fs.readFile(path.join(ROOT,'scripts/handoff.mjs'),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
  const code=stateCode+'\n'+expose+'\n'+handoff+'\n'+await fs.readFile(path.join(ROOT,'assets/reviewer/frame.js'),'utf8')+'\n'+await fs.readFile(path.join(ROOT,'assets/reviewer/viewer.js'),'utf8');
  return shell.replace('__CSS__',()=>style).replace('__PAYLOAD__',()=>jsonScript(bundle)).replace('__STATE__',()=>jsonScript(state)).replace('__JS__',()=>code).replace('<script>'+code,'<script type="module">'+code);
}
