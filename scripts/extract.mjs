import path from 'node:path';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {pathToFileURL} from 'node:url';
import {loadReview,writeJSON,newOutput,hash} from './lib.mjs';
export async function extract(file,out,{applyPreviewEdits=false}={}) {
  const {bundle,state}=await loadReview(file);await newOutput(out,'review-manifest.json');
  await writeJSON(path.join(out,'review-manifest.json'),bundle);await writeJSON(path.join(out,'review-state.json'),state);await writeJSON(path.join(out,'element-index.json'),bundle.elements);
  const extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg','font/woff2':'woff2','font/woff':'woff','font/ttf':'ttf'};
  await fs.mkdir(path.join(out,'assets'),{recursive:true});await fs.mkdir(path.join(out,'source'),{recursive:true});
  const files={};
  for(const [id,asset] of Object.entries(bundle.assets)){
    const ext=extensions[asset.mime];if(!ext)throw Error('Unsupported asset MIME: '+asset.mime);
    files[id]=`../assets/${id}.${ext}`;
    await fs.writeFile(path.join(out,'assets',`${id}.${ext}`),Buffer.from(asset.data.split(',')[1],'base64'));
  }
  const entries=[];
  for(const entry of bundle.entries){
    const name=hash(entry.id).slice(0,24),afterFile=`source/${name}-after.html`;
    const sides={};
    for(const sideName of ['before','after']) {
      const side=entry[sideName];
      if(side.html){let authored=side.html,revision=side.revision;
        const patches=applyPreviewEdits?state.previewEdits.filter(p=>(p.entry||p.target?.entry)===entry.id&&p.selected!==false):[];
        if(patches.length){const {document}=parseHTML(authored);let changed=false;for(const patch of patches){const elementId=patch.elementId||patch.target?.elementId,el=[...document.querySelectorAll('[data-uib-id]')].find(n=>n.getAttribute('data-uib-id')===elementId);if(!el)throw Error('Patch target missing');if(patch.kind==='structure')continue;if(patch.kind==='text'){if(Number.isInteger(patch.textNodeIndex)){const nodes=[...el.childNodes].filter(n=>n.nodeType===3);if(!nodes[patch.textNodeIndex])throw Error('Text node missing');nodes[patch.textNodeIndex].textContent=patch.value;}else el.textContent=patch.value;}else if(patch.kind==='asset')el.setAttribute('src','uib-asset:'+patch.value);else if(patch.kind==='style')el.style[patch.property]=patch.value;else if(patch.kind==='token'){el.style.setProperty(patch.property,patch.value);}changed=true;}if(changed){authored='<!doctype html>\n'+document.documentElement.outerHTML;revision=side.revision+'-preview-'+hash(authored).slice(0,8);}}
        await fs.writeFile(path.join(out,afterFile),authored.replace(/uib-asset:([a-f0-9]{64})/g,(_,id)=>{if(!files[id])throw Error('Unknown asset '+id);return files[id];}));sides[sideName]={kind:'authored',file:afterFile,revision};continue;}
      const result={kind:side.kind,revision:side.revision};
      if(side.kind!=='missing'){
        const map=new Map(bundle.elements.filter(e=>e.entry===entry.id&&e.side===sideName).map(e=>[e.id,e]));
        const capture={provenance:side.provenance||{},tiles:side.tiles.map(t=>({...t,image:files[t.image],elements:t.rects.map(r=>{const e=map.get(r.id);return {key:e.key,parent:map.get(e.parent)?.key||null,tag:e.tag,label:e.label,locator:e.locator,rect:r.rect,sourceHint:e.sourceHint||null,computed:e.computed||null};})}))};
        capture.tiles.forEach(t=>{delete t.rects;});
        result.capture=`source/${name}-${sideName}.json`;await writeJSON(path.join(out,result.capture),capture);
      }sides[sideName]=result;
    }
    const {after:oldAfter,before:oldBefore,...meta}=entry;
    entries.push({...meta,...sides});
  }
  await writeJSON(path.join(out,'manifest.json'),{schemaVersion:2,reviewId:bundle.reviewId,project:bundle.project,viewports:bundle.viewports,brand:bundle.brand,research:bundle.research,coverage:bundle.coverage,designContract:'design-contract.json',previousBundle:'review-manifest.json',reviewState:'review-state.json',entries});
  await writeJSON(path.join(out,'design-contract.json'),bundle.designContract||{});
  return {entries:bundle.entries.length,deleted:state.deleted?.length||0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(!process.argv[2]||!process.argv[3]){console.error('Usage: node extract.mjs <review.html> <new-directory>');process.exit(1);}
  extract(path.resolve(process.argv[2]),path.resolve(process.argv[3]),{applyPreviewEdits:process.argv.includes('--apply-preview-edits')}).then(console.log).catch(e=>{console.error(e.message);process.exit(1)});
}
