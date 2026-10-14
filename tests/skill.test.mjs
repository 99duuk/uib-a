import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

test('skill references and CLI entry points are included in the package',async()=>{
 const skill=await fs.readFile('SKILL.md','utf8');
 for(const [,relative] of skill.matchAll(/\[[^\]]+\]\((references\/[^)]+)\)/g))assert.ok((await fs.stat(path.resolve(relative))).isFile(),relative);
 const pkg=JSON.parse(await fs.readFile('package.json','utf8'));assert.ok(pkg.files.includes('data'));assert.ok(pkg.files.includes('licenses'));
});
