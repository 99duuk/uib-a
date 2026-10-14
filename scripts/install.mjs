import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {releaseFiles,packageRoot,sourceRevision} from './release-files.mjs';

const args=process.argv.slice(2),replace=args.includes('--replace'),destination=path.resolve(args.find(a=>a!=='--replace')||path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'skills','uib-a'));
if(destination===packageRoot||destination.startsWith(packageRoot+path.sep)||packageRoot.startsWith(destination+path.sep))throw Error('Install destination must not overlap the source package');
let exists=false;try{await fs.access(destination);exists=true;}catch(e){if(e.code!=='ENOENT')throw e;}
if(exists&&!replace)throw Error('Destination exists; choose a new destination or --replace to preserve a backup: '+destination);
const stageRoot=path.dirname(destination)+'-staging';await fs.mkdir(stageRoot,{recursive:true});const stage=path.join(stageRoot,path.basename(destination)+'-'+Date.now()),files=await releaseFiles();await fs.mkdir(stage,{recursive:false});
const fileHashes={};
try {
  for(const name of files){const output=path.join(stage,name);await fs.mkdir(path.dirname(output),{recursive:true});await fs.copyFile(path.join(packageRoot,name),output);fileHashes[name]=createHash('sha256').update(await fs.readFile(output)).digest('hex');}
  const npm=process.platform==='win32'?'npm.cmd':'npm',result=spawnSync(npm,['ci','--ignore-scripts','--no-audit','--no-fund'],{cwd:stage,stdio:'inherit',shell:process.platform==='win32'});
  if(result.error||result.status!==0)throw Error('Dependency install failed: '+(result.error?.message||result.status));
  await fs.writeFile(path.join(stage,'installation.json'),JSON.stringify({version:JSON.parse(await fs.readFile(path.join(stage,'package.json'),'utf8')).version,sourceBuild:sourceRevision(),fileHashes,installedAt:new Date().toISOString()},null,2)+'\n');
  let backup;
  if(exists){const backupRoot=path.dirname(destination)+'-backups';await fs.mkdir(backupRoot,{recursive:true});backup=path.join(backupRoot,path.basename(destination)+'-'+Date.now());await fs.rename(destination,backup);}
  try{await fs.rename(stage,destination);}catch(e){if(backup)await fs.rename(backup,destination);throw e;}
  console.log(JSON.stringify({destination,backup:backup||null,files:files.length,sourceBuild:sourceRevision()},null,2));
} catch(e){console.error('Installation failed; staged files retained: '+stage);throw e;}
