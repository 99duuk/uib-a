import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {loadReview,writeJSON,hash,check} from './lib.mjs';

export async function verify(file,out=path.join(path.dirname(file),'verification')) {
  const {bundle}=await loadReview(file);await fs.mkdir(out,{recursive:true});
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'uib-a-offline-'));
  const isolated=path.join(temp,'review.html');await fs.copyFile(file,isolated);
  const browser=await chromium.launch(),errors=[],requests=[],checks=[];
  const context=await browser.newContext({viewport:{width:1440,height:1200},acceptDownloads:true,offline:true});
  const page=await context.newPage();page.setDefaultTimeout(8000);
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  const record=(name,result=true)=>{check(result,name);checks.push({name,pass:true});};
  async function frame(side){return page.frames().find(f=>f.name()===side+'-frame')||await page.locator('#'+side+'-frame').elementHandle().then(e=>e.contentFrame());}
  async function choose(entry){
    for(const [key,value] of [['group',entry.group],['screen',entry.screen],['state',entry.state],['viewport',entry.viewport],['variant',entry.variant]])await page.locator('#'+key).selectOption(value);
    await page.waitForFunction(id=>window.uibSnapshot?.().entry===id,entry.id);
    await (await frame('after')).locator('[data-review-key="root"]').waitFor();
  }
  async function select(id){await page.locator('#element-picker').selectOption(id);await page.waitForFunction(id=>window.uibSnapshot().selection===id,id);}
  async function waitDeleted(id,value){await page.waitForFunction(({id,value})=>window.uibSnapshot().deleted.includes(id)===value,{id,value});}
  try {
    await page.goto(pathToFileURL(isolated).href);await page.waitForFunction(()=>!!window.uibSnapshot);
    for(const entry of bundle.entries){
      await choose(entry);const f=await frame('after');
      const result=await f.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),width:innerWidth}));
      record('entry '+entry.id+' actual viewport',result.width===bundle.viewports.find(v=>v.id===entry.viewport).width);
      record('entry '+entry.id+' no horizontal overflow',!result.overflow);record('entry '+entry.id+' images',result.images);
      for(const tile of entry.before.tiles){await page.locator('#tile').selectOption(tile.id);await (await frame('before')).locator('img').waitFor();record('Before '+entry.id+'/'+tile.id,await (await frame('before')).locator('img').evaluate(i=>i.complete&&i.naturalWidth>0));}
      await page.screenshot({path:path.join(out,(/^[\w.-]+$/.test(entry.id)?entry.id:hash(entry.id))+'.png')});
    }
    await choose(bundle.entries[0]);await page.locator('#comparison').selectOption('after');
    const items=bundle.elements.filter(e=>e.entry===bundle.entries[0].id&&e.side==='after');
    const root=items.find(e=>e.key==='root'),child=items.find(e=>e.parent&&e.parent!==root.id)||items.find(e=>e.parent);
    record('selectable non-root element',!!child);
    const parent=items.find(e=>e.id===child.parent);
    await select(child.id);record('copy payload identifies element',(await page.locator('#selection-text').inputValue()).includes(child.id));
    await page.locator('#remove').click();await waitDeleted(child.id,true);
    await (await frame('after')).locator(`[data-uib-id=${JSON.stringify(child.id)}]`).waitFor({state:'hidden'});
    record('After deletion reflows');
    await select(parent.id);await page.locator('#remove').click();await waitDeleted(parent.id,true);
    await page.locator('.deletion-log').evaluate(e=>e.open=true);
    const row=page.locator('#deleted-list li').filter({hasText:parent.id});await row.getByRole('button',{name:'복원',exact:true}).click();await waitDeleted(parent.id,false);
    record('child deletion survives parent restore',(await page.evaluate(()=>window.uibSnapshot().deleted)).includes(child.id));
    await page.locator('#undo').click();await waitDeleted(parent.id,true);record('undo restores previous intent');
    await page.locator('#restore').click();await waitDeleted(child.id,false);await waitDeleted(parent.id,false);
    record('restore all');
    // Stable ID survives rebuilding a frame and navigating between entries.
    await select(child.id);await page.locator('#remove').click();await waitDeleted(child.id,true);
    if(bundle.entries.length>1){await choose(bundle.entries[1]);await choose(bundle.entries[0]);}
    record('navigation retains deletion',(await page.evaluate(()=>window.uibSnapshot().deleted)).includes(child.id));
    const downloading=page.waitForEvent('download');await page.locator('#save').click();const download=await downloading;
    const exported=path.join(out,'saved-review.html');await download.saveAs(exported);
    const parsed=await loadReview(exported);record('export includes complete index',parsed.bundle.indexHash===bundle.indexHash);record('export retains deleted ID',parsed.state.deleted.includes(child.id));
    const exportedPage=await context.newPage();await exportedPage.goto(pathToFileURL(exported).href);await exportedPage.waitForFunction(()=>!!window.uibSnapshot);
    record('reopen retains deletions',(await exportedPage.evaluate(()=>window.uibSnapshot().deleted)).includes(child.id));
    await exportedPage.reload();await exportedPage.waitForFunction(()=>!!window.uibSnapshot);record('refresh retains saved deletions',(await exportedPage.evaluate(()=>window.uibSnapshot().deleted)).includes(child.id));
    await exportedPage.locator('#restore').click();await exportedPage.waitForFunction(()=>window.uibSnapshot().deleted.length===0);record('saved file can restore originals');await exportedPage.close();
    await page.reload();await page.waitForFunction(()=>!!window.uibSnapshot);record('refresh resets temporary deletions',!(await page.evaluate(()=>window.uibSnapshot().deleted)).includes(child.id));
    await choose(bundle.entries[0]);await select(root.id);await page.locator('#remove').click();await waitDeleted(root.id,true);record('whole screen deletion leaves controls',await page.locator('#restore').isEnabled());await page.locator('#restore').click();await waitDeleted(root.id,false);
    if(bundle.entries[0].before.tiles.length){
      await page.locator('#comparison').selectOption('before');const tile=bundle.entries[0].before.tiles[0];await page.locator('#tile').selectOption(tile.id);
      const candidates=bundle.elements.filter(e=>e.entry===bundle.entries[0].id&&e.side==='before');const target=candidates.find(e=>e.tag==='h1'&&tile.rects.some(r=>r.id===e.id))||candidates[0];
      await select(target.id);await page.locator('#remove').click();await waitDeleted(target.id,true);await (await frame('before')).locator('.uib-mask').first().waitFor();record('Before masking');await page.locator('#restore').click();await waitDeleted(target.id,false);
    }
    for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.locator('#comparison').selectOption('both');record('review width '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
    await page.setViewportSize({width:1440,height:1200});await page.locator('#comparison').selectOption('after');await page.locator('#zoom').selectOption('actual');
    record('100% width',Math.abs((await page.locator('#after-frame').boundingBox()).width-bundle.viewports.find(v=>v.id===bundle.entries[0].viewport).width)<1);
    await page.locator('#zoom').selectOption('fit');
    record('no page errors',!errors.length);record('zero external HTTP requests',!requests.length);
    const report={artifactHash:hash(await fs.readFile(file)),browser:'Chromium',platform:process.platform,node:process.version,offlineCopy:true,checks,errors,externalRequests:requests,limitations:['Visual quality requires manual screenshot review.','Other browser engines and operating systems are not implied by this run.']};
    await writeJSON(path.join(out,'verification.json'),report);return report;
  }catch(error){await writeJSON(path.join(out,'failure.json'),{message:error.message,checks,errors,requests});await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
  finally {await browser.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(!process.argv[2]){console.error('Usage: node verify.mjs <before-after.html> [evidence-directory]');process.exit(1);}
  verify(path.resolve(process.argv[2]),process.argv[3]?path.resolve(process.argv[3]):undefined).then(r=>console.log(`${r.checks.length} checks passed; no external requests`)).catch(e=>{console.error(e.stack);process.exit(1)});
}
