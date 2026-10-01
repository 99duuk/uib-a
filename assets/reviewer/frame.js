// Stringified into a sandboxed frame; no application scripts are executed.
function uibFrame(config) {
  const nodes=new Map([...document.querySelectorAll('[data-uib-id]')].map(e=>[e.dataset.uibId,e]));
  const meta=new Map(config.elements.map(e=>[e.id,e]));
  let removed=new Set(),selected=null,mode='review',pointer=null;
  const style=document.createElement('style');style.textContent='[data-uib-hidden]{display:none!important}.uib-box{position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #187bec;background:#187bec13}.uib-box.pin{border-color:#cb6c0a;background:#cb6c0a08}.uib-tip{position:fixed;pointer-events:none;z-index:2147483647;max-width:85vw;background:#122b41;color:white;font:12px/1.5 system-ui;padding:6px 9px;border-radius:5px}.uib-mask{background:#edf0f4!important;border:1px dashed #9aa8b7!important;color:#66798b;font:11px system-ui;display:flex;align-items:center;justify-content:center;pointer-events:none}.uib-region{position:absolute;background:transparent;pointer-events:none}.uib-before-root{position:relative}.uib-before-root>img{display:block;width:100%;height:100%}';document.head.append(style);
  const hover=document.createElement('div'),pin=document.createElement('div'),tip=document.createElement('div');hover.className='uib-box';pin.className='uib-box pin';tip.className='uib-tip';
  for(const e of [hover,pin,tip]){e.hidden=true;document.documentElement.append(e);}
  function send(type,extra={}){parent.postMessage({uib:true,token:config.token,type,entry:config.entry,side:config.side,...extra},'*');}
  function hidden(id){let item=meta.get(id);const seen=new Set();while(item&&!seen.has(item.id)){if(removed.has(item.id))return true;seen.add(item.id);item=meta.get(item.parent);}return false;}
  function rect(node){if(!node||node.closest('[data-uib-hidden],[hidden]')||getComputedStyle(node).visibility==='hidden')return null;const r=node.getBoundingClientRect();let l=Math.max(0,r.left),t=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom);for(let p=node.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),q=p.getBoundingClientRect();if(/hidden|auto|scroll|clip/.test(s.overflowX)){l=Math.max(l,q.left);right=Math.min(right,q.right)}if(/hidden|auto|scroll|clip/.test(s.overflowY)){t=Math.max(t,q.top);bottom=Math.min(bottom,q.bottom)}}return right>l&&bottom>t?{left:l,top:t,width:right-l,height:bottom-t}:null;}
  function paint(box,node){const r=rect(node);box.hidden=!r;if(r)Object.assign(box.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});return r;}
  function hit(event){
    if(config.side==='before'){
      return [...nodes].filter(([id,n])=>{const r=rect(n);return !hidden(id)&&r&&event.clientX>=r.left&&event.clientX<r.left+r.width&&event.clientY>=r.top&&event.clientY<r.top+r.height;}).sort((a,b)=>{const ar=a[1].getBoundingClientRect(),br=b[1].getBoundingClientRect();return ar.width*ar.height-br.width*br.height;})[0]?.[0]||null;
    }
    const target=event.target instanceof Element?event.target:null;
    const dialog=[...document.querySelectorAll('dialog[open],[aria-modal="true"]')].filter(e=>rect(e)).at(-1);
    if(dialog&&target&&!dialog.contains(target))return null;
    const id=target?.closest('[data-uib-id]')?.dataset.uibId;
    return id&&!hidden(id)?id:null;
  }
  function select(id,scroll=false){if(!meta.has(id)||hidden(id))return;const node=nodes.get(id);if(!node)return;if(scroll)node.scrollIntoView({block:'nearest',inline:'nearest'});selected=id;paint(pin,node);send('select',{id});}
  function apply(){
    for(const [id,n] of nodes){if(config.side==='after')n.toggleAttribute('data-uib-hidden',removed.has(id));else{n.classList.toggle('uib-mask',removed.has(id));n.textContent=removed.has(id)?'삭제됨':'';}}
    selected=null;pin.hidden=true;hover.hidden=true;tip.hidden=true;
  }
  document.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,id:hit(e),moved:false};},true);
  document.addEventListener('pointermove',e=>{if(pointer&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8)pointer.moved=true;if(mode!=='review'||e.pointerType==='touch')return;const id=hit(e);if(!id){hover.hidden=true;tip.hidden=true;return;}paint(hover,nodes.get(id));tip.textContent=meta.get(id).label+' · '+id;tip.hidden=false;tip.style.left=Math.max(4,Math.min(e.clientX+12,innerWidth-tip.offsetWidth-4))+'px';tip.style.top=Math.max(4,Math.min(e.clientY+15,innerHeight-tip.offsetHeight-4))+'px';},true);
  document.addEventListener('pointerup',e=>{if(mode==='review'&&pointer&&!pointer.moved){const id=hit(e);if(id)select(id);}pointer=null;},true);
  document.addEventListener('pointercancel',()=>{pointer=null;});
  document.addEventListener('click',e=>{
    if(mode==='review'){e.preventDefault();e.stopImmediatePropagation();return;}
    const state=e.target.closest('[data-review-entry]')?.getAttribute('data-review-entry');
    if(state){e.preventDefault();send('transition',{target:state});return;}
    // In experience mode only native details and form field values can change locally.
    if(e.target.closest('a,button,input[type="submit"]'))e.preventDefault();
  },true);
  document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
  for(const type of ['input','change','dblclick'])document.addEventListener(type,e=>{if(mode==='review'){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',e=>{if(mode==='review'&&e.key!=='Tab'){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Enter'||e.key===' ')select(e.target.closest('[data-uib-id]')?.dataset.uibId);}},true);
  document.addEventListener('scroll',()=>{hover.hidden=true;tip.hidden=true;if(selected)paint(pin,nodes.get(selected));},true);
  window.addEventListener('resize',()=>{hover.hidden=true;tip.hidden=true;if(selected)paint(pin,nodes.get(selected));});
  document.addEventListener('pointerleave',()=>{hover.hidden=true;tip.hidden=true;});
  window.addEventListener('message',e=>{
    const m=e.data;if(e.source!==parent||!m?.uib||m.token!==config.token)return;
    if(m.type==='state'){removed=new Set(Array.isArray(m.deleted)?m.deleted:[]);mode=m.mode==='experience'?'experience':'review';apply();document.querySelectorAll('details').forEach(d=>d.open=!!m.expand);}
    if(m.type==='select'&&typeof m.id==='string')select(m.id,true);
  });
  send('ready');
}
