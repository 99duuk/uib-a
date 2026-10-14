import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {loadReview,hash,writeJSON,check} from './lib.mjs';
import {renderReview} from './build.mjs';
import {decisionStatus} from './review-state.mjs';
import {handoffFor,handoffMarkdown} from './handoff.mjs';
export async function exportReview(inputFile,outDir,{format='json',view='current',deadlineMs=30000}={}){
  check(['json','md','png'].includes(format),'Unsupported export format');check(['current','original'].includes(view),'Unsupported export view');
  const {bundle,state}=await loadReview(inputFile);
  check(!await fs.stat(outDir).then(()=>true,()=>false),'Output directory already exists; choose a new output');await fs.mkdir(outDir,{recursive:true});
  const metadata={inputHash:hash(await fs.readFile(inputFile)),reviewId:bundle.reviewId,bundleHash:bundle.bundleHash||null,view,format};
  if(format==='json')await writeJSON(path.join(outDir,'handoff.json'),handoffFor(bundle,state,{statusFor:decisionStatus}));
  else if(format==='md')await fs.writeFile(path.join(outDir,'handoff.md'),handoffMarkdown(handoffFor(bundle,state,{statusFor:decisionStatus})));
  else{
    const trusted=await renderReview(bundle,state),trustedPath=path.join(outDir,'.trusted-review.html');await fs.writeFile(trustedPath,trusted);const browser=await chromium.launch();let timer;
    try{await Promise.race([(async()=>{
      const context=await browser.newContext({offline:true,serviceWorkers:'block'});await context.route('**/*',r=>r.request().url()===pathToFileURL(trustedPath).href?r.continue():r.abort());const page=await context.newPage();page.setDefaultTimeout(deadlineMs);
      await page.goto(pathToFileURL(trustedPath).href);await page.waitForFunction(()=>typeof window.uibExportEntry==='function');
      if(view==='original'){
        const assets=new Map();for(const entry of bundle.entries)for(const side of ['before','after'])for(const tile of entry[side].tiles||[])assets.set(`${entry.id}-${side}-${tile.id}`,tile.image);
        for(const c of bundle.comparisons||[])if(c.diffAsset)assets.set(`${c.entry}-${c.tile}-diff`,c.diffAsset);check(assets.size,'No original raster assets');for(const [name,id]of assets){check(/^[\w.-]+$/.test(name),'Unsafe output filename');const data=await page.evaluate(async data=>{const img=new Image();img.src=data;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);return canvas.toDataURL('image/png');},bundle.assets[id].data);await fs.writeFile(path.join(outDir,name+'.png'),Buffer.from(data.split(',')[1],'base64'));}
      }else{
        for(const entry of bundle.entries){check(/^[\w.-]+$/.test(entry.id),'Unsafe output filename');
          const vp=bundle.viewports.find(v=>v.id===entry.viewport);await page.setViewportSize({width:Math.max(1280,vp.width+400),height:Math.max(900,vp.height+200)});
          await page.evaluate(id=>{if(typeof window.uibExportEntry==='function')window.uibExportEntry(id);else{const selector=document.querySelector('#entry');if(selector){selector.value=id;selector.dispatchEvent(new Event('change'));}}},entry.id);
          const frame=page.locator('#after-frame');await frame.waitFor();const handle=await frame.elementHandle(),content=await handle.contentFrame();
          await content.waitForFunction(()=>document.readyState==='complete'&&document.documentElement.dataset.uibStateApplied==='true');await content.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
          await frame.evaluate(el=>{el.style.transform='none';el.style.border='0';});await frame.screenshot({path:path.join(outDir,entry.id+'-after-current.png'),animations:'disabled'});
        }
      }
      await context.close();
    })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('PNG export deadline exceeded')),deadlineMs);})]);}finally{clearTimeout(timer);await browser.close();await fs.unlink(trustedPath);}
  }
  await writeJSON(path.join(outDir,'export.json'),metadata);return metadata;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const args=process.argv.slice(2);const flag=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};if(args.length<2){console.error('Usage: export-review.mjs <review.html> <new-output> --format json|md|png --view current|original');process.exit(1);}exportReview(path.resolve(args[0]),path.resolve(args[1]),{format:flag('--format'),view:flag('--view')}).then(()=>console.log('Exported '+path.resolve(args[1]))).catch(e=>{console.error(e.message);process.exit(1);});}
