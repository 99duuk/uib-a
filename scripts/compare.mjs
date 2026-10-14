import {chromium} from 'playwright';
import pixelmatch from 'pixelmatch';
import {hash} from './lib.mjs';
import {canonical} from './review-state.mjs';
import {stabilize,snapshot} from './capture.mjs';

export function compatibility(before,after){
  const reasons=[];
  for(const key of ['width','height','dpr'])if(before[key]!==after[key])reasons.push(key+' mismatch');
  for(const key of ['renderProfile','stateProfile'])if(!before[key]||!after[key])reasons.push(key+' unavailable');else if(canonical(before[key])!==canonical(after[key]))reasons.push(key+' mismatch');
  const actual=s=>({x:s?.x||0,y:s?.y||0,containers:s?.containers||[]});
  if(canonical(actual(before.scroll))!==canonical(actual(after.scroll)))reasons.push('actual scroll mismatch');
  for(const [side,tile]of [['Before',before],['After',after]])if(tile.readiness&&(tile.readiness.fonts!=='loaded'||tile.readiness.images?.some(i=>!i.complete||!i.decoded)))reasons.push(side+' assets not ready');
  return reasons;
}
export function diffPixels(before,after,width,height,options={}){
  if(before.length!==width*height*4||after.length!==before.length)throw Error('Raster dimensions mismatch');
  const mask=new Uint8ClampedArray(before.length);const changedPixels=pixelmatch(before,after,mask,width,height,{threshold:0.1,...options,diffMask:true});
  let left=width,top=height,right=-1,bottom=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(mask[(y*width+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  return {mask,changedPixels,ratio:changedPixels/(width*height),bbox:right<0?null:[left,top,right-left+1,bottom-top+1]};
}
export function candidateRegions(bbox,rects){if(!bbox)return [];const seen=new Set();return rects.map(({id,rect:r})=>{const w=Math.max(0,Math.min(bbox[0]+bbox[2],r[0]+r[2])-Math.max(bbox[0],r[0])),h=Math.max(0,Math.min(bbox[1]+bbox[3],r[1]+r[3])-Math.max(bbox[1],r[1]));return {id,overlap:w*h,area:r[2]*r[3],confidence:r[2]*r[3]?w*h/(r[2]*r[3]):0,approximate:true};}).filter(x=>{if(!x.overlap||seen.has(x.id))return false;seen.add(x.id);return true;}).sort((a,b)=>b.confidence-a.confidence||a.area-b.area);}

const replaceAssets=(html,assets)=>html.replace(/uib-asset:([a-f\d]{64})/g,(_,id)=>assets[id]?.data||'');
async function decode(page,data){return page.evaluate(async data=>{const i=new Image();i.src=data;await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return {width:c.width,height:c.height,rgba:Array.from(ctx.getImageData(0,0,c.width,c.height).data)};},data);}
async function encode(page,rgba,width,height){return page.evaluate(({rgba,width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba),width,height),0,0);return c.toDataURL('image/png');},{rgba:Array.from(rgba),width,height});}
function addAsset(bundle,data){const bytes=Buffer.from(data.split(',')[1],'base64'),id=hash(bytes);bundle.assets[id]={mime:'image/png',data,bytes:bytes.length};return id;}
export async function enrichComparisons(bundle,input,base){
  bundle.comparisons=[];const browser=await chromium.launch();
  try{for(const entry of bundle.entries){
    const viewport=bundle.viewports.find(v=>v.id===entry.viewport),beforeTiles=entry.before.tiles?.length?entry.before.tiles:[{id:'top',width:viewport.width,height:viewport.height,dpr:viewport.dpr||1,image:null,rects:[],scroll:null}];
    const original=input.entries.find(e=>e.id===entry.id);
    const missing=entry.after.kind==='missing';const captured=!entry.after.html&&!missing;
    if(missing){for(const tile of beforeTiles)bundle.comparisons.push({entry:entry.id,tile:tile.id,beforeAsset:tile.image,afterAsset:null,diffAsset:null,compatible:false,reasons:['After missing'],reason:'After missing',stats:null,candidates:[]});continue;}
    if(!captured)entry.after.tiles=[];
    for(const before of beforeTiles){
      const profile=before.renderProfile||entry.before.provenance?.renderProfile||{};
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:before.dpr||1,locale:profile.locale||'en-US',timezoneId:profile.timezoneId||'UTC',colorScheme:profile.colorScheme||'light',reducedMotion:'reduce',offline:true,serviceWorkers:'block'});
      try{
        const page=await context.newPage();page.setDefaultTimeout(15000);
        let after=entry.after.tiles.find(t=>t.id===before.id);
        if(!captured){
          await page.setContent(replaceAssets(entry.after.html,bundle.assets));
          const scroll=before.scroll;
          if(scroll)await page.evaluate(scroll=>{window.scrollTo(scroll.x||0,scroll.y||0);for(const s of scroll.containers||[]){let el=s.key?document.querySelector('[data-review-key='+JSON.stringify(s.key)+']'):null;if(!el&&s.locator)el=document.querySelector(s.locator);el?.scrollTo(s.x,s.y);}},scroll);
          const readiness=await stabilize(page);const snap=await snapshot(page);const data='data:image/png;base64,'+(await page.screenshot({animations:'disabled',mask:(before.stateProfile?.mask||[]).map(s=>page.locator(s))})).toString('base64');
          after={id:before.id,image:addAsset(bundle,data),...snap,rects:snap.elements.map(e=>({id:bundle.elements.find(n=>n.entry===entry.id&&n.side==='after'&&n.key===e.key)?.id,rect:e.rect})).filter(r=>r.id),renderProfile:{locale:profile.locale||'en-US',timezoneId:profile.timezoneId||'UTC',colorScheme:profile.colorScheme||'light',reducedMotion:'reduce',browser:'chromium',version:browser.version(),platform:process.platform},stateProfile:original.after.stateProfile||before.stateProfile||null,readiness};entry.after.tiles.push(after);
        }
        const reasons=!before.image?['Before missing']:after?compatibility(before,after):['After tile missing'];const comparison={entry:entry.id,tile:before.id,beforeAsset:before.image,afterAsset:after?.image||null,diffAsset:null,compatible:reasons.length===0,reasons,reason:reasons.join('; '),stats:null,candidates:[]};
        if(comparison.compatible){
          const a=await decode(page,bundle.assets[before.image].data),b=await decode(page,bundle.assets[after.image].data);
          if(a.width!==b.width||a.height!==b.height){comparison.compatible=false;comparison.reasons.push('Raster dimensions mismatch');comparison.reason=comparison.reasons.join('; ');}
          else{const diff=diffPixels(new Uint8ClampedArray(a.rgba),new Uint8ClampedArray(b.rgba),a.width,a.height);comparison.diffAsset=addAsset(bundle,await encode(page,diff.mask,a.width,a.height));comparison.stats={changedPixels:diff.changedPixels,ratio:diff.ratio,bbox:diff.bbox?.map(n=>n/(before.dpr||1))||null};comparison.candidates=candidateRegions(comparison.stats.bbox,[...(before.rects||[]),...(after.rects||[])]);}
        }
        bundle.comparisons.push(comparison);
      }finally{await context.close();}
    }
  }}finally{await browser.close();}return bundle;
}
