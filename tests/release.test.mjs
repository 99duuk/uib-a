import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {releaseFiles} from '../scripts/release-files.mjs';

test('release includes maintained files and excludes developer plans and metadata',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'uib-release-'));
 try{await fs.mkdir(path.join(root,'docs/evolution'),{recursive:true});await fs.writeFile(path.join(root,'package.json'),JSON.stringify({files:['docs']}));await fs.writeFile(path.join(root,'.gitignore'),'x');await fs.writeFile(path.join(root,'docs/.DS_Store'),'x');await fs.writeFile(path.join(root,'docs/demo.html'),'x');await fs.writeFile(path.join(root,'docs/evolution/SPEC.md'),'private developer plan');assert.deepEqual(await releaseFiles(root),['.gitignore','docs/demo.html','package.json']);await fs.symlink('/tmp',path.join(root,'docs/escape'));await assert.rejects(releaseFiles(root),/symlink/);}finally{await fs.rm(root,{recursive:true,force:true});}
});
