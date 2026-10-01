import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {ROOT,readJSON,hash,writeJSON} from './lib.mjs';

const dest=path.resolve(process.argv[2]||path.join(ROOT,'dist'));
await fs.mkdir(dest,{recursive:true});const pkg=await readJSON(path.join(ROOT,'package.json'));
const filename=`${pkg.name}-${pkg.version}.tgz`;
try{await fs.access(path.join(dest,filename));throw Error('Package exists; choose another directory: '+dest);}
catch(e){if(e.code!=='ENOENT')throw e;}
// npm pack omits package-lock.json. A small USTAR writer preserves the locked
// dependency graph without a system tar dependency or a duplicate lockfile.
const files=[];
async function collect(relative){const stat=await fs.lstat(path.join(ROOT,relative));if(stat.isSymbolicLink())throw Error('Package symlinks are not supported: '+relative);if(stat.isDirectory()){for(const child of (await fs.readdir(path.join(ROOT,relative))).sort())await collect(relative+'/'+child);}else if(stat.isFile())files.push(relative);}
for(const name of [...pkg.files,'package.json','.gitignore'])await collect(name);
const chunks=[];
for(const name of [...new Set(files)].sort()){
  const full='uib-a/'+name;if(Buffer.byteLength(full)>100)throw Error('Archive path is too long: '+full);
  const bytes=await fs.readFile(path.join(ROOT,name)),header=Buffer.alloc(512);
  const octal=(value,width)=>value.toString(8).padStart(width-1,'0')+'\0';
  header.write(full,0,100);header.write(octal(0o644,8),100,8);header.write(octal(0,8),108,8);header.write(octal(0,8),116,8);header.write(octal(bytes.length,12),124,12);header.write(octal(0,12),136,12);header.fill(32,148,156);header.write('0',156);header.write('ustar\0',257,6);header.write('00',263,2);
  const sum=header.reduce((a,b)=>a+b,0);header.write(sum.toString(8).padStart(6,'0')+'\0 ',148,8);
  chunks.push(header,bytes,Buffer.alloc((512-bytes.length%512)%512));
}
chunks.push(Buffer.alloc(1024));const archive=gzipSync(Buffer.concat(chunks));
await fs.writeFile(path.join(dest,filename),archive,{flag:'wx'});
await writeJSON(path.join(dest,'package-report.json'),{name:pkg.name,version:pkg.version,filename,sha256:hash(archive),files:[...new Set(files)].sort(),note:'Local archive only; nothing published. License selection pending owner decision.'});
console.log(path.join(dest,filename));
