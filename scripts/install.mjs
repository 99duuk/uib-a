import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {ROOT,readJSON} from './lib.mjs';

// Never replace an installed skill silently. Supply a new destination for review.
const destination=path.resolve(process.argv[2]||path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'skills','uib-a'));
try{await fs.access(destination);throw Error('Destination exists; preserve it and choose a new destination: '+destination);}
catch(e){if(e.code!=='ENOENT')throw e;}
const pkg=await readJSON(path.join(ROOT,'package.json'));
await fs.mkdir(destination,{recursive:true});
for(const name of [...pkg.files,'package.json','.gitignore'])await fs.cp(path.join(ROOT,name),path.join(destination,name),{recursive:true,errorOnExist:true,force:false});
const npm=process.platform==='win32'?'npm.cmd':'npm';
const result=spawnSync(npm,['ci','--ignore-scripts','--no-audit','--no-fund'],{cwd:destination,stdio:'inherit',shell:process.platform==='win32'});
if(result.error||result.status!==0)throw Error('Skill copied, dependency install incomplete: '+(result.error?.message||result.status));
console.log('Installed skill: '+destination+'\nOpen a new Codex session and invoke $uib-a.');
