import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import Ajv from 'ajv';
import crypto from 'node:crypto';
import {readJSON,writeJSON,check,unique,newOutput,hash,ROOT} from './lib.mjs';

export function safeSourceHint(hint){
  if(!hint||typeof hint.file!=='string'||!hint.file||hint.file.length>1000||/^(?:[a-z][a-z\d+.-]*:|[/\\])|[\x00-\x1f]/i.test(hint.file)||hint.file.split(/[/\\]/).includes('..'))return null;
  return {file:hint.file,line:Number.isInteger(hint.line)&&hint.line>0?hint.line:null,component:typeof hint.component==='string'?hint.component.slice(0,200):null,provenance:hint.provenance||'provided-metadata'};
}

export async function snapshot(page) {
  return page.evaluate(()=>{
    const root=document.body,all=[root,...root.querySelectorAll('*')].filter(e=>!e.ownerSVGElement&&!e.closest('script,style,defs,symbol,link,meta'));
    const ids=new Map(all.map((e,i)=>[e,e.getAttribute('data-review-key')||'capture-'+i]));
    const dialog=[...document.querySelectorAll('dialog[open],[aria-modal="true"]')].filter(e=>e.getBoundingClientRect().width>0).at(-1);
    const elements=[];
    function locator(e){if(!e)return '';if(e===root)return 'body';if(e===document.documentElement)return 'html';return locator(e.parentElement)+' > '+e.tagName.toLowerCase()+':nth-child('+([...e.parentElement.children].indexOf(e)+1)+')';}
    for(const e of all){
      if(dialog&&!dialog.contains(e)&&!e.contains(dialog))continue;
      const s=getComputedStyle(e),r=e.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0'||e.closest('[hidden]'))continue;
      let l=Math.max(0,r.left),t=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
      for(let a=e.parentElement;a;a=a.parentElement){const z=getComputedStyle(a),q=a.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(z.overflowX)){l=Math.max(l,q.left);right=Math.min(right,q.right)}if(/auto|scroll|hidden|clip/.test(z.overflowY)){t=Math.max(t,q.top);bottom=Math.min(bottom,q.bottom)}}
      if(right-l<1||bottom-t<1)continue;
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();
      let parent=e.parentElement;while(parent&&!ids.has(parent))parent=parent.parentElement;
      elements.push({key:ids.get(e),parent:ids.get(parent)||null,tag:e.tagName.toLowerCase(),label:(e.getAttribute('aria-label')||e.getAttribute('alt')||own||e.innerText||e.value||e.tagName).replace(/\s+/g,' ').slice(0,140),sourceHint:e.dataset.sourceFile?{file:e.dataset.sourceFile,line:Number(e.dataset.sourceLine)||null,component:e.dataset.sourceComponent||null,provenance:'provided-metadata'}:null,locator:locator(e),rect:[l,t,right-l,bottom-t].map(n=>Math.round(n*100)/100)});
    }
    return {width:innerWidth,height:innerHeight,dpr:devicePixelRatio,elements,scroll:{x:scrollX,y:scrollY,containers:[...document.querySelectorAll('*')].filter(e=>e.scrollLeft||e.scrollTop).map(e=>({key:ids.get(e)||null,locator:locator(e),x:e.scrollLeft,y:e.scrollTop}))}};
  });
}
const safe=id=>check(typeof id==='string'&&/^[\w.-]+$/.test(id)&&id!=='.'&&id!=='..','Capture id must be a safe filename');
const atomic=async(file,value)=>{const temp=file+'.tmp-'+crypto.randomUUID();await writeJSON(temp,value);await fs.rename(temp,file);};
const deadline=(promise,ms,label)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(label+' deadline exceeded')),ms);promise.then(resolve,reject).finally(()=>clearTimeout(timer));});
export async function stabilize(page,ms=15000) {
  await deadline(page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));}),ms,'fonts/images');
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  return page.evaluate(()=>({fonts:document.fonts.status,images:[...document.images].map(i=>({complete:i.complete,decoded:i.naturalWidth>0})),motionLimit:'Canvas, video and GIF require a trusted adapter'}));
}
export async function capture(configFile,outDir,adapterFile,options={}) {
  const config=await readJSON(configFile);const validate=new Ajv({strict:false,allErrors:true}).compile(await readJSON(path.join(ROOT,'references/capture.schema.json')));check(validate(config),JSON.stringify(validate.errors));check(Array.isArray(config.targets)&&config.targets.length,'No capture targets');unique(config.targets.map(t=>t.id),'capture target ids');
  const configBase=path.dirname(path.resolve(configFile));const {resume:resumePath,...captureConfig}=config;const configHash=hash(JSON.stringify(captureConfig));
  for(const t of config.targets){safe(t.id);check(t.id!=='run.json','Reserved capture id');check(['http:','https:','file:'].includes(new URL(t.url).protocol),'Unsupported capture URL protocol');check(Number.isInteger(t.width)&&t.width>0&&t.width<=8192&&Number.isInteger(t.height)&&t.height>0&&t.height<=8192,'Invalid viewport');unique((t.tiles||[]).map(t=>t.id),'tile ids');(t.tiles||[]).forEach(t=>safe(t.id));}
  check(!await fs.stat(outDir).then(()=>true,()=>false),'Output directory already exists; choose a new run');await fs.mkdir(outDir,{recursive:true});
  const adapter=adapterFile?await import(pathToFileURL(path.resolve(adapterFile)).href):{};
  const adapterHash=adapterFile?hash(await fs.readFile(adapterFile)):null;
  const browser=await chromium.launch();const records=Object.create(null),completed=[];
  const environment={browser:'chromium',version:browser.version(),platform:process.platform};
  const previous=options.resume||config.resume?path.resolve(configBase,options.resume||config.resume):null;
  const prior=previous?await readJSON(path.join(previous,'run.json')):null;
  const runFile=path.join(outDir,'run.json');let writing=Promise.resolve();
  const save=()=>writing=writing.then(()=>atomic(runFile,{schemaVersion:2,environment,targets:records}));
  async function one(target){
    const profile={locale:target.locale||config.locale||'en-US',timezoneId:target.timezone||config.timezone||'UTC',colorScheme:target.colorScheme||config.colorScheme||'light',reducedMotion:'reduce',...environment};
    const fixture=target.fixtureFile?hash(await fs.readFile(path.resolve(configBase,target.fixtureFile))):target.fixtureVersion||null;
    const localSource=target.url.startsWith('file:');const sourceRoot=localSource?path.dirname(fileURLToPath(target.url)):null;let source=target.sourceRevision||null;const htmlHash=localSource?hash(await fs.readFile(new URL(target.url))):null;if(localSource&&!source)source=htmlHash;
    const storageHash=target.storageState?hash(await fs.readFile(path.resolve(configBase,target.storageState))):null;const fingerprint=hash(JSON.stringify({configHash,target,profile,fixture,source,htmlHash,adapterHash,storageHash}));const dest=path.join(outDir,target.id);await fs.mkdir(dest);
    records[target.id]={status:'pending',fingerprint,sourceKnown:!!source};await save();
    const old=prior?.targets?.[target.id];
    if(source&&old?.sourceKnown&&old?.status==='succeeded'&&old.fingerprint===fingerprint){
      try{if(localSource){check(Array.isArray(old.resources),'Missing resource fingerprints');for(const resource of old.resources)check(hash(await fs.readFile(path.resolve(sourceRoot,resource.file)))===resource.hash,'Source resource changed');}check(old.files?.['capture.json'],'Missing resume capture hash');const priorCapture=await readJSON(path.join(previous,target.id,'capture.json'));check(priorCapture.provenance?.sourceRevision===source&&priorCapture.tiles?.length,'Resume capture metadata mismatch');for(const tile of priorCapture.tiles){safe(tile.id);safe(tile.image);check(old.files[tile.image]&&tile.width===target.width&&tile.height===target.height&&tile.dpr===(target.dpr||1),'Resume capture dimensions mismatch');}for(const [name,digest]of Object.entries(old.files)){safe(name);const bytes=await fs.readFile(path.join(previous,target.id,name));check(hash(bytes)===digest,'Resume hash mismatch');await fs.writeFile(path.join(dest,name),bytes);}records[target.id]={...old,reused:true};completed.push(target.id);await save();return;}catch{for(const file of await fs.readdir(dest))await fs.unlink(path.join(dest,file));}
    }
    let context,stage='context';records[target.id].status='running';await save();
    try {
      context=await browser.newContext({viewport:{width:target.width,height:target.height},deviceScaleFactor:target.dpr||1,locale:profile.locale,timezoneId:profile.timezoneId,colorScheme:profile.colorScheme,reducedMotion:'reduce',serviceWorkers:'block',...(target.storageState?{storageState:path.resolve(configBase,target.storageState)}:{})});
      const resources=new Set();let remoteResource=false;context.on('request',request=>{const url=request.url();if(url.startsWith('file:'))resources.add(new URL(url));else if(localSource&&/^https?:/.test(url))remoteResource=true;});const blocked=[];await context.route('**/*',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.request().method())){blocked.push(r.request().method());return r.abort();}return r.continue();});if(context.routeWebSocket)await context.routeWebSocket('**/*',ws=>ws.close());
      const page=await context.newPage(),timeout=target.deadlineMs||config.deadlineMs||15000;page.setDefaultTimeout(timeout);page.setDefaultNavigationTimeout(timeout);
      await deadline((async()=>{
        stage='navigate';await adapter.beforeNavigate?.({page,context,target});await page.goto(target.url,{waitUntil:'domcontentloaded'});stage='prepare';await adapter.prepare?.({page,context,target});if(target.ready)await page.locator(target.ready).waitFor({state:'visible'});await page.waitForLoadState('load');
        const tiles=[];
        for(const tile of target.tiles||[{id:'top'},{id:'bottom',scroll:{end:true}}]){
          stage='tile:'+tile.id;
          if(tile.scroll)await page.evaluate(s=>{const el=s.selector?document.querySelector(s.selector):document.scrollingElement;if(!el)throw Error('Scroll container missing');el.scrollTo({left:s.x||0,top:s.end?el.scrollHeight:s.y||0,behavior:'instant'});},tile.scroll);else await page.evaluate(()=>window.scrollTo(0,0));
          await adapter.beforeTile?.({page,context,target,tile});const readiness=await stabilize(page,timeout);const data=await snapshot(page);unique(data.elements.map(e=>e.key),'captured keys');
          const provided=await adapter.sourceHints?.({page,context,target,tile,elements:data.elements});for(const e of data.elements)e.sourceHint=safeSourceHint(provided?.[e.key]?{...provided[e.key],provenance:'trusted-adapter'}:e.sourceHint);
          const image=tile.id+'.png';await page.screenshot({path:path.join(dest,image),animations:'disabled',mask:(target.mask||[]).map(s=>page.locator(s))});
          tiles.push({id:tile.id,label:tile.label||tile.id,image,...data,renderProfile:profile,stateProfile:{state:target.state||'default',role:target.role||'unspecified',fixtureVersion:fixture,adapterHash,mask:target.mask||[]},readiness,scroll:{...data.scroll,container:tile.scroll?.selector||'document',requested:tile.scroll||null}});
        }
        const u=new URL(target.url);const record={provenance:{capturedAt:new Date().toISOString(),sourceRevision:source,url:u.protocol==='file:'?'local fixture':u.origin+u.pathname,blockedWriteRequests:blocked.length,renderProfile:profile},tiles};await atomic(path.join(dest,'capture.json'),record);
      })(),timeout,'target '+target.id);
      const files={};for(const name of await fs.readdir(dest))files[name]=hash(await fs.readFile(path.join(dest,name)));const resourceHashes=[];for(const file of resources)resourceHashes.push({file:path.relative(sourceRoot||configBase,fileURLToPath(file)),hash:hash(await fs.readFile(file))});records[target.id]={...records[target.id],status:'succeeded',files,resources:resourceHashes,sourceKnown:!!source&&(!localSource||!remoteResource||!!target.sourceRevision)};completed.push(target.id);
    }catch(e){records[target.id]={...records[target.id],status:'failed',stage,error:e.message};}finally{await context?.close();await save();}
  }
  try{let next=0;const count=Math.max(1,Math.min(4,Number(config.concurrency)||2));await Promise.all(Array.from({length:count},async()=>{while(next<config.targets.length){const target=config.targets[next++];try{await one(target);}catch(e){records[target.id]={status:'failed',stage:'fingerprint',error:e.message};await save();}}}));}finally{await writing;await browser.close();}
  completed.failed=Object.entries(records).filter(([,r])=>r.status==='failed').map(([id])=>id);return completed;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(!process.argv[2]||!process.argv[3]){console.error('Usage: node capture.mjs <capture-config.json> <new-output-directory> [trusted-local-adapter.mjs] [--resume prior-run]');process.exit(1);}
  const args=process.argv.slice(4),resumeIndex=args.indexOf('--resume'),adapter=args[0]&&!args[0].startsWith('--')?args[0]:undefined;
  capture(path.resolve(process.argv[2]),path.resolve(process.argv[3]),adapter,{resume:resumeIndex>=0?args[resumeIndex+1]:undefined}).then(ids=>{console.log('Captured '+ids.join(', '));if(ids.failed.length){console.error('Failed: '+ids.failed.join(', '));process.exitCode=1;}}).catch(e=>{console.error(e.message);process.exit(1)});
}
