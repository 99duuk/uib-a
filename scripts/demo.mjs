import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,writeJSON,newOutput,readJSON} from './lib.mjs';
import {capture} from './capture.mjs';
import {build} from './build.mjs';
import {extract} from './extract.mjs';
export async function demo(out=path.join(ROOT,'output/demo')) {
  await newOutput(out);const work=path.join(out,'source');await fs.mkdir(work,{recursive:true});
  // Reuse the published Before images and maps when present. A style revision
  // should not quietly replace the evidence being compared against it.
  const baselineFile=path.join(ROOT,'docs/demo/before-after.html');let baseline;
  try{await fs.access(baselineFile);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(await fs.stat(baselineFile).catch(()=>null)){
    await extract(baselineFile,path.join(work,'baseline'));
    baseline=await readJSON(path.join(work,'baseline/manifest.json'));
  }
  const targets=[],entries=[];
  const defs=[['library-default-mobile','mobile',390,844,'서재','기본',false],['library-confirm-mobile','mobile',390,844,'서재','읽기 확인',true],['operations-default-desktop','desktop',1440,1000,'프로젝트 개요','기본',false],['operations-default-mobile','desktop',390,844,'프로젝트 개요','기본',false]];
  for(const [id,type,width,height,title,state,confirmed] of defs){
    for(const side of ['before','after']){let html=await fs.readFile(path.join(ROOT,'examples',type,side+'.html'),'utf8');if(confirmed)html=html.replace('<body','<body class="confirmed"');await fs.writeFile(path.join(work,id+'-'+side+'.html'),html);}
    const viewport=width===390?'mobile':'desktop';
    targets.push({id,url:pathToFileURL(path.join(work,id+'-before.html')).href,width,height,dpr:id.includes('confirm')?2:1,ready:confirmed?'.dialog':'h1',sourceRevision:'fictional-demo-v1',tiles:confirmed?[{id:'top'}]:[{id:'top'},{id:'bottom',scroll:{end:true}}]});
    const old=baseline?.entries.find(e=>e.id===id);
    const before=old?{...old.before,capture:'baseline/'+old.before.capture}:{kind:'dom',revision:'r1',capture:`captures/${id}/capture.json`};
    entries.push({id,screen:type==='mobile'?'library':'operations',state,viewport,title,group:type==='mobile'?'고객 · 모바일':'업무 · PC/모바일',route:type==='mobile'?'/library':'/overview',notes:'가상 서비스 · 동일 데이터로 구성한 시안',fixture:'fictional-demo-v1',before,after:{revision:'r2',file:`${id}-after.html`}});
  }
  await writeJSON(path.join(work,'capture-config.json'),{targets});
  if(!baseline)await capture(path.join(work,'capture-config.json'),path.join(work,'captures'));
  const manifest={schemaVersion:1,reviewId:'uib-a-demo',project:{key:'demo',title:'UIB-A · Mobile & Desktop'},viewports:[{id:'mobile',label:'모바일',width:390,height:844},{id:'desktop',label:'PC',width:1440,height:1000}],brand:{mode:'recompose-layout',mobile:{name:'Morrow',task:'읽던 책과 위치를 확인하고 이어 읽기',accent:'#387159',changes:['표지 옆에 제목·읽은 위치 배치','전체 카드 대신 구분선','원본 녹색 유지']},desktop:{name:'Fieldwork',task:'검토할 프로젝트를 찾고 담당자·상태·기한 비교',accent:'#345563',changes:['통계 카드 대신 요약 행','프로젝트 목록 위에 검토 동작','표의 열 정렬 유지']}},research:await readJSON(path.join(ROOT,'examples/research.json')),coverage:{requested:['모바일 서재','읽기 확인','PC 프로젝트 개요','모바일 프로젝트 개요'],completed:entries.map(e=>e.id),missing:[],limitations:['가상 서비스·샘플 데이터','원본 참고의 반응 순위·전환 성과 미검증']},entries,...(baseline?{previousBundle:'baseline/review-manifest.json'}:{})};
  await writeJSON(path.join(work,'manifest.json'),manifest);return build(path.join(work,'manifest.json'),out);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)demo(process.argv[2]?path.resolve(process.argv[2]):undefined).then(b=>console.log(`Demo built: ${b.entries.length} entries`)).catch(e=>{console.error(e.stack);process.exit(1)});
