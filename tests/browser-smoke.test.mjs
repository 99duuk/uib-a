import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import * as browsers from 'playwright';
import {build} from '../scripts/build.mjs';

for(const engine of (process.env.UIB_BROWSER_ENGINES||'chromium').split(','))test(engine+' offline selection, opinion, saved draft and keyboard UI',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'uib-engine-'));let browser;
 try{
  await fs.writeFile(path.join(root,'after.html'),'<html><body><h1 data-review-key="title">Review target 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 긴 요소 설명 </h1><p data-review-key="price">2000</p></body></html>');
  await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify({schemaVersion:2,project:{key:'engine',title:'Engine review'},viewports:[{id:'phone',width:390,height:844}],entries:[{id:'home',screen:'home',state:'normal',viewport:'phone',title:'Home',after:{kind:'authored',revision:'r1',file:'after.html'}}]}));
  await build(path.join(root,'manifest.json'),path.join(root,'output'));
  browser=await browsers[engine].launch();const context=await browser.newContext({offline:engine!=='webkit',acceptDownloads:true,viewport:{width:1600,height:1000}}),page=await context.newPage(),errors=[],requests=[];await context.route(/^https?:/,r=>r.abort());page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});page.on('dialog',d=>d.accept());
  await page.goto(pathToFileURL(path.join(root,'output/before-after.html')).href);await page.waitForFunction(()=>window.uibSnapshot);
  const id=await page.locator('#element-picker option').evaluateAll(options=>options.find(o=>o.textContent.includes('h1'))?.value);assert.ok((await page.locator('#element-picker option').allTextContents()).every(text=>text.length<60));
  for(const width of [1600,390,320]){await page.setViewportSize({width,height:1000});if(width<1200)await page.click('#toggle-inspector');assert.ok(await page.locator('#element-picker').evaluate(el=>el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right+1));if(width<1200)await page.keyboard.press('Escape');}await page.setViewportSize({width:1600,height:1000});
  await page.selectOption('#element-picker',id);await page.waitForFunction(()=>window.uibSnapshot().selection);await page.fill('#comment','Engine opinion');await page.click('#add-comment');assert.equal(await page.evaluate(()=>window.uibSnapshot().state.annotations.length),1);
  await page.fill('#comment','Saved draft');const waiting=page.waitForEvent('download');await page.click('#save');await (await waiting).saveAs(path.join(root,'saved.html'));await page.goto(pathToFileURL(path.join(root,'saved.html')).href);await page.waitForFunction(()=>window.uibSnapshot);assert.equal(await page.evaluate(()=>window.uibSnapshot().state.drafts[0].text),'Saved draft');
  await page.setViewportSize({width:390,height:844});await page.click('#toggle-navigator');assert.ok(await page.locator('#navigator').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('#navigator').isVisible(),false);assert.ok(await page.locator('#toggle-navigator').evaluate(el=>el===document.activeElement));
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 }finally{await browser?.close();await fs.rm(root,{recursive:true});}
});
