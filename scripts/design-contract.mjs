import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseHTML} from 'linkedom';

export function auditDesignContract(contract,bundle){
  if(!contract||typeof contract!=='object'||Array.isArray(contract))throw Error('Missing design contract');
  const checks=[];
  for(const required of contract.requiredContent||[]){
    if(typeof required.key!=='string'||!required.key)throw Error('Required content must have a key');
    const scope=required.appliesTo||{};
    for(const [key,field]of [['entries','id'],['states','state'],['viewports','viewport'],['variants','variant']]){if(scope[key]&&!Array.isArray(scope[key]))throw Error('Required content scope must be an array: '+key);for(const value of scope[key]||[])if(!bundle.entries.some(e=>e[field]===value))checks.push({key:required.key,entry:null,status:'missing',reason:'Requested '+key+' unavailable: '+value});}
    for(const entry of bundle.entries){
      const applies=[['entries',entry.id],['states',entry.state],['viewports',entry.viewport],['variants',entry.variant]].every(([key,value])=>!scope[key]?.length||scope[key].includes(value));
      if(!applies)continue;
      if(!entry.after.html){checks.push({key:required.key,entry:entry.id,status:'unverified',reason:'Captured/image After needs visual inspection'});continue;}
      const {document}=parseHTML(entry.after.html),elements=[...document.querySelectorAll('[data-review-key]')];
      const nodes=(required.elementKeys||[required.key]).map(key=>elements.find(el=>el.getAttribute('data-review-key')===key));
      if(nodes.some(n=>!n)){checks.push({key:required.key,entry:entry.id,status:'missing',reason:'Required semantic key missing'});continue;}
      if(nodes.some(n=>n.closest('[hidden],[aria-hidden="true"]')||/(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(n.getAttribute('style')||''))){checks.push({key:required.key,entry:entry.id,status:'missing',reason:'Required content explicitly hidden'});continue;}
      if(required.value!==undefined&&!nodes.some(n=>n.textContent.includes(String(required.value)))){checks.push({key:required.key,entry:entry.id,status:'missing',reason:'Required value missing'});continue;}
      if(required.action){
        const target=required.action.targetEntry||required.action.transition;
        if(target&&(!bundle.entries.some(e=>e.id===target)||!nodes.some(n=>n.getAttribute('data-review-entry')===target||[...n.querySelectorAll('[data-review-entry]')].some(el=>el.getAttribute('data-review-entry')===target)))){checks.push({key:required.key,entry:entry.id,status:'missing',reason:'Required declared transition missing'});continue;}
      }
      const observed=required.checks?.find(c=>c.entry===entry.id&&c.status==='present'&&c.evidence);
      checks.push({key:required.key,entry:entry.id,status:observed?'present':'unverified',reason:observed?'Semantic checks and recorded visual observation':'Structure present; CSS visibility and live flow require recorded observation'});
    }
  }
  const variants=contract.variants||[],critique=contract.critiques||[];
  const unresolved=critique.filter(c=>['P0','P1'].includes(c.priority)&&c.resolution!=='resolved');
  return {checks,missing:checks.filter(c=>c.status==='missing'),unverified:checks.filter(c=>c.status==='unverified'),unresolved,variantCount:variants.length,limitations:['Static presence never proves visual visibility or task completion.','Variants and critique quality need direct screen inspection.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{if(process.argv.length!==4)throw Error('Usage: design-contract.mjs <contract.json> <bundle.json>');console.log(JSON.stringify(auditDesignContract(JSON.parse(await fs.readFile(process.argv[2],'utf8')),JSON.parse(await fs.readFile(process.argv[3],'utf8'))),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
