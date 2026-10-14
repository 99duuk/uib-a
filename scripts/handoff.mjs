export function handoffFor(bundle,state,{statusFor}={}){
  if((state.decisions||[]).length&&typeof statusFor!=='function')throw Error('Handoff requires derived decision status');
  const elements=new Map(bundle.elements.map(e=>[e.id,e]));
  const targetContext=target=>{const ids=target?.ids||target?.elementIds||(target?.elementId?[target.elementId]:target?.id?[target.id]:[]);return ids.map(id=>{const e=elements.get(id);return e?{id,key:e.key,entry:e.entry,side:e.side,revision:e.revision,label:e.label,sourceHint:e.sourceHint||null}:{id,unresolved:true};});};
  return {schemaVersion:2,reviewId:bundle.reviewId,bundleHash:bundle.bundleHash||null,project:bundle.project,designContract:bundle.designContract||null,entries:bundle.entries.map(e=>({id:e.id,title:e.title,state:e.state,viewport:e.viewport,variant:e.variant,revisions:{before:e.before.revision,after:e.after.revision},evidence:{before:e.before.hash,after:e.after.hash},notes:e.notes,fixture:e.fixture})),annotations:(state.annotations||[]).map(a=>({...a,context:targetContext(a.target)})),decisions:(state.decisions||[]).map(d=>({...d,effectiveStatus:statusFor(bundle,state,d.entry)})),deleted:(state.deleted||[]).map(id=>({id,...elements.get(id)})),previewEdits:state.previewEdits||[],unresolved:state.unresolved||[],constraints:bundle.designContract?.requiredContent||[],research:bundle.research||[],coverage:bundle.coverage||{}};
}
export function handoffMarkdown(payload){
  const lines=['# UI 검토 인계','',`- 검토: ${payload.reviewId}`,`- Bundle: ${payload.bundleHash||'미수집'}`,'','## 화면'];
  for(const e of payload.entries)lines.push(`- ${e.id}: ${e.title||e.id} · ${e.state} · ${e.viewport} · ${e.variant} · Before ${e.revisions.before} / After ${e.revisions.after}`);
  for(const [label,value]of [['의견',payload.annotations],['판정',payload.decisions],['삭제 의도',payload.deleted],['시안 수정',payload.previewEdits],['유지 제약',payload.constraints],['미해결',payload.unresolved],['디자인 계약',payload.designContract],['근거',payload.research],['동선 확인',payload.coverage]])lines.push('',`## ${label}`,'','```json',JSON.stringify(value,null,2),'```');
  return lines.join('\n')+'\n';
}
