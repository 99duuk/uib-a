import test from 'node:test';
import assert from 'node:assert/strict';
import {searchGuidance} from '../scripts/design-search.mjs';

test('known Korean tasks find the right curated source and an unrelated query stays empty',async()=>{
  for(const [q,id] of [['키보드 포커스','ux-28'],['로딩 버튼','ux-32'],['오류 피드백','ux-33'],['터치 간격','ux-23'],['움직임 줄이기','ux-9']]){
    const result=await searchGuidance(q);assert.equal(result.status,'match');assert.ok(result.records.some(r=>r.id===id));assert.ok(result.records.every(r=>r.source.sha&&r.source.recordId&&r.limits));
  }
  assert.equal((await searchGuidance('quasar thermodynamics')).status,'no-result');
  await assert.rejects(searchGuidance('   '));await assert.rejects(searchGuidance('focus',{domain:'invented'}));
});
