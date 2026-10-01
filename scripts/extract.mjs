import path from 'node:path';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {loadReview,writeJSON,newOutput,hash} from './lib.mjs';
export async function extract(file,out) {
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
    await fs.writeFile(path.join(out,afterFile),entry.after.html.replace(/uib-asset:([a-f0-9]{64})/g,(_,id)=>{if(!files[id])throw Error('Unknown asset '+id);return files[id];}));
    const before={kind:entry.before.kind,revision:entry.before.revision};
    if(before.kind!=='missing'){
      const map=new Map(bundle.elements.filter(e=>e.entry===entry.id&&e.side==='before').map(e=>[e.id,e]));
      const capture={provenance:entry.before.provenance||{},tiles:entry.before.tiles.map(t=>({...t,image:files[t.image],elements:t.rects.map(r=>{const e=map.get(r.id);return {key:e.key,parent:map.get(e.parent)?.key||null,tag:e.tag,label:e.label,locator:e.locator,rect:r.rect};})}))};
      capture.tiles.forEach(t=>{delete t.rects;});
      before.capture=`source/${name}-before.json`;await writeJSON(path.join(out,before.capture),capture);
    }
    const {after:oldAfter,before:oldBefore,...meta}=entry;
    entries.push({...meta,before,after:{file:afterFile,revision:entry.after.revision}});
  }
  await writeJSON(path.join(out,'manifest.json'),{schemaVersion:1,reviewId:bundle.reviewId,project:bundle.project,viewports:bundle.viewports,brand:bundle.brand,research:bundle.research,coverage:bundle.coverage,previousBundle:'review-manifest.json',reviewState:'review-state.json',entries});
  return {entries:bundle.entries.length,deleted:state.deleted?.length||0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(!process.argv[2]||!process.argv[3]){console.error('Usage: node extract.mjs <review.html> <new-directory>');process.exit(1);}
  extract(path.resolve(process.argv[2]),path.resolve(process.argv[3])).then(console.log).catch(e=>{console.error(e.message);process.exit(1)});
}
