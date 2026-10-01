import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {readJSON,writeJSON,check,unique,newOutput} from './lib.mjs';

async function snapshot(page) {
  return page.evaluate(()=>{
    const root=document.body,all=[root,...root.querySelectorAll('*')].filter(e=>!e.ownerSVGElement&&!e.closest('script,style,defs,symbol,link,meta'));
    const ids=new Map(all.map((e,i)=>[e,e.getAttribute('data-review-key')||'capture-'+i]));
    const dialog=[...document.querySelectorAll('dialog[open],[aria-modal="true"]')].filter(e=>e.getBoundingClientRect().width>0).at(-1);
    const elements=[];
    function locator(e){if(e===root)return 'body';return locator(e.parentElement)+' > '+e.tagName.toLowerCase()+':nth-child('+([...e.parentElement.children].indexOf(e)+1)+')';}
    for(const e of all){
      if(dialog&&!dialog.contains(e)&&!e.contains(dialog))continue;
      const s=getComputedStyle(e),r=e.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0'||e.closest('[hidden]'))continue;
      let l=Math.max(0,r.left),t=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
      for(let a=e.parentElement;a;a=a.parentElement){const z=getComputedStyle(a),q=a.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(z.overflowX)){l=Math.max(l,q.left);right=Math.min(right,q.right)}if(/auto|scroll|hidden|clip/.test(z.overflowY)){t=Math.max(t,q.top);bottom=Math.min(bottom,q.bottom)}}
      if(right-l<1||bottom-t<1)continue;
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();
      let parent=e.parentElement;while(parent&&!ids.has(parent))parent=parent.parentElement;
      elements.push({key:ids.get(e),parent:ids.get(parent)||null,tag:e.tagName.toLowerCase(),label:(e.getAttribute('aria-label')||e.getAttribute('alt')||own||e.innerText||e.value||e.tagName).replace(/\s+/g,' ').slice(0,140),locator:locator(e),rect:[l,t,right-l,bottom-t].map(n=>Math.round(n*100)/100)});
    }
    return {width:innerWidth,height:innerHeight,dpr:devicePixelRatio,elements,scroll:{x:scrollX,y:scrollY}};
  });
}
export async function capture(configFile,outDir,adapterFile) {
  const config=await readJSON(configFile);check(Array.isArray(config.targets)&&config.targets.length,'No capture targets');unique(config.targets.map(t=>t.id),'capture target ids');
  const adapter=adapterFile?await import(pathToFileURL(path.resolve(adapterFile)).href):{};
  const browser=await chromium.launch();const completed=[];
  try {for(const target of config.targets){
    check(/^[\w.-]+$/.test(target.id),'Capture id must be a safe filename');
    const dest=path.join(outDir,target.id);await newOutput(dest,'capture.json');
    const context=await browser.newContext({viewport:{width:target.width,height:target.height},deviceScaleFactor:target.dpr||1,serviceWorkers:'block',...(target.storageState?{storageState:path.resolve(path.dirname(configFile),target.storageState)}:{})});
    const blocked=[];await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked.push(r.request().method());return r.abort();}return r.continue();});
    if(context.routeWebSocket)await context.routeWebSocket('**/*',ws=>ws.close());
    const page=await context.newPage();page.setDefaultTimeout(15000);
    try {
      await adapter.beforeNavigate?.({page,context,target});
      await page.goto(target.url,{waitUntil:'domcontentloaded'});
      await adapter.prepare?.({page,context,target});
      if(target.ready)await page.locator(target.ready).waitFor({state:'visible'});
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
      await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
      const tiles=[];
      for(const tile of target.tiles||[{id:'top'},{id:'bottom',scroll:{end:true}}]){
        check(/^[\w.-]+$/.test(tile.id),'Tile id must be a safe filename');
        if(tile.scroll)await page.evaluate(s=>{const el=s.selector?document.querySelector(s.selector):document.scrollingElement;if(!el)throw Error('Scroll container missing');el.scrollTo({left:s.x||0,top:s.end?el.scrollHeight:s.y||0,behavior:'instant'});},tile.scroll);
        else await page.evaluate(()=>window.scrollTo(0,0));
        await adapter.beforeTile?.({page,context,target,tile});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const data=await snapshot(page);unique(data.elements.map(e=>e.key),'captured keys');
        const image=tile.id+'.png';await page.screenshot({path:path.join(dest,image),animations:'disabled'});
        tiles.push({id:tile.id,label:tile.label||tile.id,image,...data,scroll:{...data.scroll,container:tile.scroll?.selector||'document',requested:tile.scroll||null}});
      }
      const u=new URL(target.url);const record={provenance:{capturedAt:new Date().toISOString(),sourceRevision:target.sourceRevision||null,url:u.protocol==='file:'?'local fixture':u.origin+u.pathname,blockedWriteRequests:blocked.length},tiles};
      await writeJSON(path.join(dest,'capture.json'),record);completed.push(target.id);
    } finally {await context.close();}
  }}finally{await browser.close();}
  return completed;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(!process.argv[2]||!process.argv[3]){console.error('Usage: node capture.mjs <capture-config.json> <new-output-directory> [trusted-local-adapter.mjs]');process.exit(1);}
  capture(path.resolve(process.argv[2]),path.resolve(process.argv[3]),process.argv[4]).then(ids=>console.log('Captured '+ids.join(', '))).catch(e=>{console.error(e.message);process.exit(1)});
}
