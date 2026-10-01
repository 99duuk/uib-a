(() => {
  const $=id=>document.getElementById(id),B=JSON.parse($('uib-payload').textContent);
  const originalShell=document.documentElement.outerHTML;
  const index=new Map(B.elements.map(e=>[e.id,e])),tokens={before:'',after:''};
  const saved=JSON.parse($('uib-state').textContent);
  let deleted=[],unresolved=[],history=[],selection=null,active=B.entries[0],copySerial=0,pendingSelection=null;
  if(saved.schemaVersion!==1||saved.reviewId!==B.reviewId){unresolved=['[저장 상태의 문서 식별자 불일치]'];}
  else{for(const id of [...(saved.deleted||[]),...(saved.unresolved||[])]){if(index.has(id))deleted.push(id);else unresolved.push(id);}}
  deleted=[...new Set(deleted)];unresolved=[...new Set(unresolved)];
  document.title=B.project.title+' · Before / After';$('project-title').textContent=B.project.title+' · Before / After';
  function optionList(el,items,value){el.replaceChildren();for(const [v,label] of items)el.add(new Option(label,v));el.value=items.some(i=>i[0]===value)?value:items[0]?.[0]||'';}
  function uniquePairs(items,key,label=key){return [...new Map(items.map(e=>[e[key],[e[key],e[label]||e[key]]])).values()];}
  function syncPickers(){
    optionList($('group'),uniquePairs(B.entries,'group'),active.group);
    optionList($('screen'),uniquePairs(B.entries.filter(e=>e.group===active.group),'screen','title'),active.screen);
    optionList($('state'),uniquePairs(B.entries.filter(e=>e.screen===active.screen&&e.group===active.group),'state'),active.state);
    const candidates=B.entries.filter(e=>e.screen===active.screen&&e.state===active.state&&e.group===active.group);
    optionList($('viewport'),[...new Set(candidates.map(e=>e.viewport))].map(id=>{const v=B.viewports.find(v=>v.id===id);return [id,`${v.label||v.id} · ${v.width}×${v.height}`];}),active.viewport);
    optionList($('variant'),uniquePairs(candidates.filter(e=>e.viewport===active.viewport),'variant'),active.variant);
  }
  for(const name of ['group','screen','state','viewport','variant'])$(name).onchange=()=>{
    const order=['group','screen','state','viewport','variant'],pos=order.indexOf(name);
    let choices=B.entries.filter(e=>order.slice(0,pos+1).every(k=>e[k]===$(k).value));
    active=choices.find(e=>order.slice(pos+1).every(k=>e[k]===active[k]))||choices[0];render();
  };
  function assetHTML(html){return html.replace(/uib-asset:([a-f0-9]{64})/g,(_,id)=>{if(!B.assets[id])throw Error('Missing embedded asset');return B.assets[id].data;});}
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const js=v=>JSON.stringify(v).replaceAll('<','\\u003c');
  function makeFrame(side){
    const token=crypto.randomUUID(),nonce=crypto.randomUUID().replaceAll('-','');tokens[side]=token;
    let html,items=B.elements.filter(e=>e.entry===active.id&&e.side===side);
    if(side==='after')html=assetHTML(active.after.html);
    else if(active.before.kind==='missing')html='<html><head></head><body><p>Before 미확보 · 비교 미완료</p></body></html>';
    else{
      const tile=active.before.tiles.find(t=>t.id===$('tile').value)||active.before.tiles[0],ids=new Set(tile.rects.map(r=>r.id));items=items.filter(e=>ids.has(e.id));
      html=`<html><head><style>html,body{margin:0;padding:0}body{background:#fff}</style></head><body><div class="uib-before-root" style="width:${tile.width}px;height:${tile.height}px"><img alt="Before 실제 캡처" src="${B.assets[tile.image].data}">${tile.rects.map(r=>`<div class="uib-region" data-uib-id="${esc(r.id)}" style="left:${r.rect[0]}px;top:${r.rect[1]}px;width:${r.rect[2]}px;height:${r.rect[3]}px"></div>`).join('')}</div></body></html>`;
    }
    const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src 'none'; form-action 'none'; base-uri 'none'">`;
    const config={entry:active.id,side,token,elements:items};
    html=html.replace(/<head[^>]*>/i,m=>m+csp);
    html=html.replace(/<\/body>/i,`<script nonce="${nonce}">(${uibFrame.toString()})(${js(config)})<\/script></body>`);
    $(side+'-frame').srcdoc=html;
  }
  function send(side,type,extra={}){$(side+'-frame').contentWindow?.postMessage({uib:true,token:tokens[side],type,...extra},'*');}
  function notifyState(){for(const side of ['before','after'])send(side,'state',{deleted,mode:$('interaction').value,expand:$('expand').checked});}
  function currentElements(){return B.elements.filter(e=>e.entry===active.id);}
  function resetSelection(){selection=null;copySerial++;$('selection-text').value='';$('selected-title').textContent='화면 안의 요소를 선택해 주세요';$('remove').disabled=true;$('copy').disabled=true;$('ancestors').replaceChildren();$('element-picker').value='';}
  function fit(){
    const v=B.viewports.find(v=>v.id===active.viewport);
    for(const side of ['before','after']){const frame=$(side+'-frame'),wrap=frame.parentElement,stage=wrap.parentElement;const scale=$('zoom').value==='actual'?1:Math.min(1,Math.max(.05,(stage.clientWidth-16)/v.width));wrap.style.width=v.width*scale+'px';wrap.style.height=v.height*scale+'px';frame.style.width=v.width+'px';frame.style.height=v.height+'px';frame.style.transform=`scale(${scale})`;}
  }
  function render(){
    pendingSelection=null;syncPickers();resetSelection();$('expand').checked=false;
    optionList($('tile'),active.before.tiles.map(t=>[t.id,t.label]),'top');$('tile').disabled=!active.before.tiles.length;
    $('before-kind').textContent=({dom:'실제 캡처 · DOM 영역',manual:'제공 이미지 · 수동 영역',image:'제공 이미지 · 전체 선택',missing:'원본 미확보'})[active.before.kind];
    $('after-revision').textContent='개선 시안 · '+active.after.revision;
    $('entry-context').textContent=`${active.title} / ${active.state} · ${active.route||'경로 미지정'} · ${active.notes||'화면 안 버튼은 검토용입니다.'}`;
    optionList($('element-picker'),[['','요소 선택'],...currentElements().map(e=>[e.id,`${e.side==='after'?'After':'Before'} · ${e.tag} · ${e.label}`])],'');
    makeFrame('before');makeFrame('after');fit();renderDeletions();
  }
  $('tile').onchange=()=>{resetSelection();makeFrame('before');};
  $('comparison').onchange=()=>{const mode=$('comparison').value;$('before-panel').hidden=mode==='after';$('after-panel').hidden=mode==='before';$('panels').classList.toggle('single',mode!=='both');fit();};
  $('zoom').onchange=fit;$('expand').onchange=notifyState;$('interaction').onchange=()=>{resetSelection();notifyState();$('status').textContent=$('interaction').value==='review'?'요소 검토 모드':'로컬 체험 · 실제 서비스 작업은 실행되지 않습니다.';};
  new ResizeObserver(fit).observe($('panels'));
  function textFor(item){const entry=B.entries.find(e=>e.id===item.entry),v=B.viewports.find(v=>v.id===entry.viewport);return `[UI Before / After 검토]\n프로젝트: ${B.project.title}\n화면: ${entry.title} / ${entry.state}\n경로: ${entry.route||'미지정'}\n보기: ${v.id} ${v.width}×${v.height} / ${item.side} / ${item.revision}\n요소: ${item.id}\n선택: ${item.tag} · ${item.label}\n상위: ${item.parent||'화면 전체'}\n위치: ${item.locator||'이미지 영역'}\n수집 수준: ${item.mapping}`;}
  async function copy(text){const serial=++copySerial;$('selection-text').value=text;let ok=false;try{await navigator.clipboard.writeText(text);ok=true;}catch{const focus=document.activeElement;$('selection-text').focus({preventScroll:true});$('selection-text').select();try{ok=document.execCommand('copy');}catch{}if(ok)focus?.focus({preventScroll:true});}if(serial!==copySerial)return;$('status').textContent=ok?'복사됐어요 · 채팅에 붙여넣어 주세요.':'자동 복사 제한 · 아래 내용을 ⌘C / Ctrl+C로 복사하세요.';}
  function select(id){const item=index.get(id);if(!item||item.entry!==active.id)return;selection=item;$('selected-title').textContent=`${item.side==='after'?'After':'Before'} · ${item.label}`;$('copy').disabled=false;$('remove').disabled=false;$('element-picker').value=id;
    const chain=$('ancestors');chain.replaceChildren();let next=item;const seen=new Set();while(next&&!seen.has(next.id)){seen.add(next.id);const node=next,button=document.createElement('button');button.textContent=(next===item?'선택 · ':'↑ ')+node.tag+' · '+node.label;button.title=node.id;button.onclick=()=>send(node.side,'select',{id:node.id});chain.append(button);next=index.get(next.parent);}copy(textFor(item));
  }
  window.addEventListener('message',event=>{const m=event.data;if(!m?.uib||m.entry!==active.id||!['before','after'].includes(m.side)||event.source!==$(m.side+'-frame').contentWindow||m.token!==tokens[m.side])return;
    if(m.type==='ready'){send(m.side,'state',{deleted,mode:$('interaction').value,expand:$('expand').checked});if(pendingSelection?.side===m.side){send(m.side,'select',{id:pendingSelection.id});pendingSelection=null;}}
    if(m.type==='select'&&index.get(m.id)?.side===m.side)select(m.id);
    if(m.type==='transition'&&$('interaction').value==='experience'){const target=B.entries.find(e=>e.id===m.target&&e.viewport===active.viewport);if(target){active=target;render();}}
  });
  $('element-picker').onchange=()=>{const item=index.get($('element-picker').value);if(item){if(item.side==='before'){const tile=active.before.tiles.find(t=>t.rects.some(r=>r.id===item.id));if(tile&&tile.id!==$('tile').value){$('tile').value=tile.id;pendingSelection=item;makeFrame('before');return;}}send(item.side,'select',{id:item.id});}};
  function step(delta){const items=currentElements(),i=items.findIndex(e=>e.id===selection?.id),next=items[(i+delta+items.length)%items.length];$('element-picker').value=next.id;$('element-picker').dispatchEvent(new Event('change'));}
  $('previous-element').onclick=()=>step(-1);$('next-element').onclick=()=>step(1);$('copy').onclick=()=>{if(selection)copy(textFor(selection));};
  function renderDeletions(){
    $('deletion-summary').textContent=`삭제 목록 · ${deleted.length}개${unresolved.length?' · 미해결 '+unresolved.length+'개':''}`;
    $('undo').disabled=!history.length;$('restore').disabled=!deleted.length&&!unresolved.length;$('copy-deletions').disabled=!deleted.length&&!unresolved.length;
    const list=$('deleted-list');list.replaceChildren();for(const id of [...deleted,...unresolved]){const item=index.get(id),li=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');label.textContent=item?`${item.side} · ${item.label} · ${id}`:`미해결 · ${id}`;button.textContent=item?'복원':'목록에서 제외';button.onclick=()=>change(deleted.filter(x=>x!==id),unresolved.filter(x=>x!==id));li.append(label,button);list.append(li);}
  }
  function change(next,unknown=unresolved){history.push({deleted:[...deleted],unresolved:[...unresolved]});deleted=[...new Set(next)];unresolved=[...unknown];resetSelection();renderDeletions();notifyState();}
  $('remove').onclick=()=>{if(selection&&!deleted.includes(selection.id))change([...deleted,selection.id]);};
  $('undo').onclick=()=>{const state=history.pop();if(state){deleted=state.deleted;unresolved=state.unresolved;resetSelection();renderDeletions();notifyState();}};
  $('restore').onclick=()=>change([],[]);
  $('copy-deletions').onclick=()=>copy('[UI 삭제 요청]\n\n'+deleted.map(id=>textFor(index.get(id))).join('\n\n')+(unresolved.length?'\n\n미해결 ID\n'+unresolved.join('\n'):''));
  function download(content,mime,name){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  $('download-index').onclick=()=>download(JSON.stringify(B.elements,null,2),'application/json','uib-a-elements.json');
  $('save').onclick=()=>{const state={schemaVersion:1,reviewId:B.reviewId,indexHash:B.indexHash,deleted,unresolved,savedAt:new Date().toISOString()};const doc=new DOMParser().parseFromString(originalShell,'text/html');doc.getElementById('uib-state').textContent=js(state);download('<!doctype html>\n'+doc.documentElement.outerHTML,'text/html;charset=utf-8','before-after-reviewed-'+Date.now()+'.html');$('status').textContent='새 HTML 다운로드를 요청했어요. 다운로드 목록에서 파일을 확인하세요.';};
  function notes(){const root=$('notes');const add=(title,value)=>{const h=document.createElement('h3'),p=document.createElement('pre');h.textContent=title;p.textContent=typeof value==='string'?value:JSON.stringify(value,null,2);root.append(h,p);};add('브랜드',B.brand);add('검토 범위',B.coverage);if(!B.research.length)add('디자인 근거','참고 조사 없음 · 기능 예시 또는 조사 미완료');for(const r of B.research){add(r.title||'참고 디자인',r);if(/^https?:\/\//.test(r.url)){const a=document.createElement('a');a.textContent='출처 열기';a.href=r.url;a.target='_blank';a.rel='noreferrer';root.append(a);}}}
  notes();render();
  // Read-only snapshot for verification tools; interaction tests use the visible controls.
  window.uibSnapshot=()=>({entry:active.id,deleted:[...deleted],unresolved:[...unresolved],selection:selection?.id||null,indexHash:B.indexHash});
})();
