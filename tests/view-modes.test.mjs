import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {build} from '../scripts/build.mjs';
import {capture} from '../scripts/capture.mjs';

async function mode(page,value){
 if(await page.locator('#inspector').isVisible())await page.click('#close-inspector');
 await page.click('#mode-'+value);
 assert.equal(await page.locator('body').getAttribute('data-ui-mode'),value);
 assert.equal(await page.locator('#mode-'+value).getAttribute('aria-pressed'),'true');
}
async function select(page,id){
 await page.locator('#find-element').evaluate(el=>el.open=true);
 await page.selectOption('#element-picker',id);
 await page.waitForFunction(id=>window.uibSnapshot().selection===id,id);
 assert.ok(await page.locator('#inspector').isVisible());
}

test('three review modes keep comparison read-only, preserve drafts and edits, and retain entry/mobile access',async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'uib-modes-'));let browser;
 try{
  const html='<html><head><style>body{margin:0}main{padding:20px}h1{color:rgb(10,20,30);font-size:24px}button{height:44px}</style></head><body><main data-review-key="content"><h1 data-review-key="title">Hello</h1><button data-review-key="action">Continue</button><input data-review-key="native-input" aria-label="Native input" value="Original"><select data-review-key="native-select" aria-label="Native select"><option value="one">One</option><option value="two">Two</option></select><div data-review-key="scroll" style="height:40px;overflow:auto"><div data-review-key="long" style="height:200px">Nested scroll content</div></div></main></body></html>';
  await fs.writeFile(path.join(tmp,'after.html'),html);
  await fs.writeFile(path.join(tmp,'capture.json'),JSON.stringify({targets:[{id:'raster',url:pathToFileURL(path.join(tmp,'after.html')).href,width:390,height:844}]}));
  await capture(path.join(tmp,'capture.json'),path.join(tmp,'captures'));
  const entries=[{id:'home',screen:'home',state:'normal',viewport:'phone',variant:'a',title:'Home',after:{kind:'authored',revision:'r1',file:'after.html'}},{id:'desktop',screen:'home',state:'empty',viewport:'desktop',variant:'b',title:'Desktop empty',after:{kind:'authored',revision:'r1',file:'after.html'}},{id:'image',screen:'image',state:'normal',viewport:'phone',title:'Captured',after:{kind:'dom',revision:'r1',capture:'captures/raster/capture.json'}}];
  await fs.writeFile(path.join(tmp,'manifest.json'),JSON.stringify({schemaVersion:2,project:{key:'modes',title:'Mode review'},viewports:[{id:'phone',width:390,height:844},{id:'desktop',width:1024,height:768}],entries}));
  const bundle=await build(path.join(tmp,'manifest.json'),path.join(tmp,'output'));
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1600,height:1000},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(pathToFileURL(path.join(tmp,'output/before-after.html')).href);await page.waitForFunction(()=>window.uibSnapshot);
  assert.equal(await page.locator('body').getAttribute('data-ui-mode'),'compare');
  assert.equal(await page.locator('#inspector').isVisible(),false);assert.equal(await page.locator('#navigator').isVisible(),false);assert.equal(await page.locator('#interaction').isVisible(),false);assert.equal(await page.locator('#find-element').isVisible(),false);
  assert.ok(await page.locator('#before-panel').isVisible());assert.ok(await page.locator('#after-panel').isVisible());
  const baseline=await page.evaluate(()=>window.uibSnapshot().state);
  const readonlyBox=await page.locator('#after-frame').contentFrame().locator('[data-review-key="title"]').boundingBox();await page.mouse.click(readonlyBox.x+readonlyBox.width/2,readonlyBox.y+readonlyBox.height/2);await page.keyboard.press('Delete');await page.keyboard.press('Control+z');
  assert.equal(await page.evaluate(()=>window.uibSnapshot().selection),null);assert.deepEqual(await page.evaluate(()=>window.uibSnapshot().state),baseline);
  const after=await page.locator('#after-frame').elementHandle().then(el=>el.contentFrame());assert.equal(await after.getByRole('textbox',{name:'Native input'}).count(),1);const nativeBox=await after.locator('[data-review-key=native-input]').boundingBox();await page.mouse.click(nativeBox.x+10,nativeBox.y+10);await after.getByRole('textbox',{name:'Native input'}).focus();await page.keyboard.type('Changed');assert.equal(await after.locator('[data-review-key=native-input]').inputValue(),'Original');const selectBox=await after.locator('[data-review-key=native-select]').boundingBox();await page.mouse.click(selectBox.x+10,selectBox.y+10);await page.mouse.click(selectBox.x+10,selectBox.y+selectBox.height+10);await page.keyboard.press('Escape');assert.equal(await after.locator('[data-review-key=native-select]').inputValue(),'one');await after.getByRole('combobox',{name:'Native select'}).focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await after.locator('[data-review-key=native-select]').inputValue(),'one');await after.locator('[data-review-key=scroll]').hover();await page.mouse.wheel(0,100);await after.waitForFunction(()=>document.querySelector('[data-review-key=scroll]').scrollTop>0);assert.deepEqual(await page.evaluate(()=>window.uibSnapshot().state),baseline);
  for(const value of ['compare','simple','advanced']){
   await mode(page,value);for(const entry of entries){await page.selectOption('#entry-picker',entry.id);await page.waitForFunction(id=>window.uibSnapshot().entry===id,entry.id);}
  }
  await page.selectOption('#entry-picker','home');await mode(page,'simple');
  assert.equal(await page.locator('#inspector').isVisible(),false);assert.equal(await page.locator('#interaction').isVisible(),false);
  const title=bundle.elements.find(e=>e.entry==='home'&&e.side==='after'&&e.key==='title').id;
  await page.locator('#after-frame').contentFrame().locator('html').evaluate(()=>window.addEventListener('message',event=>{if(event.data?.type==='state')window.uibTestState=event.data;}));
  await page.locator('#after-frame').contentFrame().locator('html[data-uib-mode=review]').waitFor();await page.locator('#after-frame').contentFrame().locator('[data-review-key=title]').click();await page.waitForFunction(id=>window.uibSnapshot().selection===id,title);assert.ok(await page.locator('#inspector').isVisible());
  await select(page,title);await page.locator('#after-frame').contentFrame().locator('html').evaluate((_,id)=>{const state=window.uibTestState;if(!state?.token||!Number.isInteger(state.epoch))throw Error('Missing fresh frame state');window.uibStaleMessage={uib:true,entry:'home',side:'after',token:state.token,epoch:state.epoch,type:'select',id};},title);await page.selectOption('#simple-property','text');await page.fill('#simple-value','Unapplied text');await page.fill('#simple-comment','Unsubmitted request');
  await mode(page,'compare');assert.equal(await page.locator('#save').isVisible(),true);const drafted=await page.evaluate(()=>window.uibSnapshot().state);
  await page.locator('#after-frame').contentFrame().locator('html').evaluate(()=>parent.postMessage(window.uibStaleMessage,'*'));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.evaluate(()=>window.uibSnapshot().selection),null);await page.keyboard.press('Control+z');assert.deepEqual(await page.evaluate(()=>window.uibSnapshot().state),drafted);assert.equal(drafted.previewEdits.length,0);
  await mode(page,'advanced');await page.locator('#after-frame').contentFrame().locator('html').evaluate(()=>parent.postMessage(window.uibStaleMessage,'*'));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.evaluate(()=>window.uibSnapshot().selection),null);for(const id of ['comparison-settings','element-details','opinion-tools','decision-tools','file-tools'])assert.equal(await page.locator('#'+id).getAttribute('open'),null);await mode(page,'simple');await select(page,title);
  assert.equal(await page.inputValue('#simple-value'),'Unapplied text');assert.equal(await page.inputValue('#simple-comment'),'Unsubmitted request');
  await page.fill('#simple-value','Updated title');await page.click('#apply-simple-patch');await page.waitForFunction(()=>window.uibSnapshot().state.previewEdits.length===1);
  await page.locator('#after-frame').contentFrame().locator('[data-review-key="title"]').filter({hasText:'Updated title'}).waitFor();
  const activeAfter=await page.locator('#after-frame').elementHandle().then(el=>el.contentFrame());await page.selectOption('#simple-property','color');await page.fill('#simple-value','#1f6feb');await page.click('#apply-simple-patch');await activeAfter.waitForFunction(()=>getComputedStyle(document.querySelector('[data-review-key=title]')).color==='rgb(31, 111, 235)');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.previewEdits.length),2);await page.click('#undo');await activeAfter.waitForFunction(()=>getComputedStyle(document.querySelector('[data-review-key=title]')).color==='rgb(10, 20, 30)');
  await page.selectOption('#simple-property','fontSize');await page.fill('#simple-value','30');await page.click('#apply-simple-patch');await activeAfter.waitForFunction(()=>getComputedStyle(document.querySelector('[data-review-key=title]')).fontSize==='30px');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.previewEdits.length),2);await page.click('#undo');await activeAfter.waitForFunction(()=>getComputedStyle(document.querySelector('[data-review-key=title]')).fontSize==='24px');
  await page.selectOption('#simple-property','color');await page.fill('#simple-value','not-a-color');await page.click('#apply-simple-patch');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.previewEdits.length),1);
  await page.click('#add-simple-comment');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.annotations[0].priority),'P2');
  await page.click('#remove');assert.ok((await page.evaluate(()=>window.uibSnapshot().deleted)).includes(title));await page.click('#undo');assert.equal((await page.evaluate(()=>window.uibSnapshot().deleted)).includes(title),false);
  const edited=await page.evaluate(()=>window.uibSnapshot().state);await mode(page,'compare');await mode(page,'advanced');assert.deepEqual(await page.evaluate(()=>window.uibSnapshot().state),edited);await page.click('#toggle-inspector');
  await page.click('#redo');await page.waitForFunction(id=>window.uibSnapshot().deleted.includes(id),title);await page.click('#undo');await page.waitForFunction(id=>!window.uibSnapshot().deleted.includes(id),title);
  if(!await page.locator('#inspector').isVisible())await page.click('#toggle-inspector');await page.locator('#element-details').evaluate(el=>el.open=true);await select(page,title);await page.fill('#patch-value','Advanced unapplied');await mode(page,'compare');await mode(page,'advanced');await select(page,title);await page.locator('#element-details').evaluate(el=>el.open=true);assert.equal(await page.inputValue('#patch-value'),'Advanced unapplied');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.previewEdits.length),1);
  await mode(page,'simple');await page.selectOption('#entry-picker','image');const raster=bundle.elements.find(e=>e.entry==='image'&&e.side==='after'&&e.key==='title').id;await select(page,raster);assert.equal(await page.locator('#simple-property').isVisible(),false);assert.ok(await page.locator('#remove').isVisible());assert.ok(await page.locator('#simple-comment').isVisible());
  await page.fill('#simple-comment','Saved raster draft');const waiting=page.waitForEvent('download');await page.click('#save');await (await waiting).saveAs(path.join(tmp,'saved.html'));await page.goto(pathToFileURL(path.join(tmp,'saved.html')).href);await page.waitForFunction(()=>window.uibSnapshot);assert.equal(await page.locator('body').getAttribute('data-ui-mode'),'compare');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.previewEdits.length),1);assert.ok((await page.evaluate(()=>window.uibSnapshot().state.drafts)).some(d=>d.text==='Saved raster draft'));
  for(const width of [320,390,768,1440,1600]){
   await page.setViewportSize({width,height:1000});await mode(page,'compare');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   if(width<768){assert.ok(await page.locator('#before-tab').isVisible());assert.ok(await page.locator('#after-tab').isVisible());assert.ok(await page.locator('#after-panel').isVisible());await page.click('#before-tab');assert.ok(await page.locator('#before-panel').isVisible());await page.click('#after-tab');}
   if(process.env.UIB_REVIEW_EVIDENCE_DIR){await fs.mkdir(process.env.UIB_REVIEW_EVIDENCE_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.UIB_REVIEW_EVIDENCE_DIR,`compare-${width}.png`)});}
   await mode(page,'simple');await page.selectOption('#entry-picker','home');await select(page,title);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   if(width<1200){assert.equal(await page.locator('#inspector').getAttribute('aria-modal'),'true');await page.locator('#simple-comment').focus();await page.keyboard.press('Escape');assert.equal(await page.locator('#inspector').isVisible(),false);assert.notEqual(await page.locator('#inspector').getAttribute('aria-modal'),'true');assert.ok(await page.evaluate(()=>!!document.activeElement?.getClientRects().length&&!document.querySelector('#inspector').contains(document.activeElement)));}
   if(process.env.UIB_REVIEW_EVIDENCE_DIR)await page.screenshot({path:path.join(process.env.UIB_REVIEW_EVIDENCE_DIR,`simple-${width}.png`)});
   await mode(page,'advanced');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);if(process.env.UIB_REVIEW_EVIDENCE_DIR)await page.screenshot({path:path.join(process.env.UIB_REVIEW_EVIDENCE_DIR,`advanced-${width}.png`)});
  }
  await mode(page,'compare');await page.locator('#mode-simple').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('body').getAttribute('data-ui-mode'),'simple');assert.deepEqual(errors,[]);
 }finally{await browser?.close();await fs.rm(tmp,{recursive:true,force:true});}
});
