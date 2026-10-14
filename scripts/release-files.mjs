import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

export const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function releaseFiles(root=packageRoot){
  const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')),files=[];
  async function visit(relative){
    if(relative.split('/').some(s=>s.startsWith('.')&&s!=='.gitignore')||relative.startsWith('docs/evolution/'))return;
    const p=path.join(root,relative),stat=await fs.lstat(p);if(stat.isSymbolicLink())throw Error('Package symlinks are not supported: '+relative);
    if(stat.isDirectory()){for(const name of (await fs.readdir(p)).sort())await visit(relative+'/'+name);}else if(stat.isFile())files.push(relative);
  }
  for(const relative of [...pkg.files,'package.json','.gitignore'])await visit(relative);
  return [...new Set(files)].sort();
}
export function sourceRevision(root=packageRoot){
  try{if(execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()!==root)throw Error('Not package Git root');return {sha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()};}
  catch{return {sha:null,dirty:null};}
}
