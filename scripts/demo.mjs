import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,writeJSON,newOutput} from './lib.mjs';
import {capture} from './capture.mjs';
import {build} from './build.mjs';
export async function demo(out=path.join(ROOT,'output/demo')) {
  await newOutput(out);const work=path.join(out,'source');await fs.mkdir(work,{recursive:true});
  const targets=[],entries=[];
  const defs=[['library-default-mobile','mobile',390,844,'서재','기본',false],['library-confirm-mobile','mobile',390,844,'서재','읽기 확인',true],['operations-default-desktop','desktop',1440,1000,'프로젝트 개요','기본',false],['operations-default-mobile','desktop',390,844,'프로젝트 개요','기본',false]];
  for(const [id,type,width,height,title,state,confirmed] of defs){
    for(const side of ['before','after']){let html=await fs.readFile(path.join(ROOT,'examples',type,side+'.html'),'utf8');if(confirmed)html=html.replace('<body','<body class="confirmed"');await fs.writeFile(path.join(work,id+'-'+side+'.html'),html);}
    const viewport=width===390?'mobile':'desktop';
    targets.push({id,url:pathToFileURL(path.join(work,id+'-before.html')).href,width,height,dpr:id.includes('confirm')?2:1,ready:confirmed?'.dialog':'h1',sourceRevision:'fictional-demo-v1',tiles:confirmed?[{id:'top'}]:[{id:'top'},{id:'bottom',scroll:{end:true}}]});
    entries.push({id,screen:type==='mobile'?'library':'operations',state,viewport,title,group:type==='mobile'?'고객 · 모바일':'업무 · PC/모바일',route:type==='mobile'?'/library':'/overview',notes:'가상 브랜드·샘플 데이터 · 실제 Dribbble 조사 결과가 아닌 기능 예시',fixture:'fictional-demo-v1',before:{kind:'dom',revision:'r1',capture:`captures/${id}/capture.json`},after:{revision:'r1',file:`${id}-after.html`}});
  }
  await writeJSON(path.join(work,'capture-config.json'),{targets});
  await capture(path.join(work,'capture-config.json'),path.join(work,'captures'));
  const manifest={schemaVersion:1,reviewId:'uib-a-demo',project:{key:'demo',title:'UIB-A · Mobile & Desktop'},viewports:[{id:'mobile',label:'모바일',width:390,height:844},{id:'desktop',label:'PC',width:1440,height:1000}],brand:{note:'Two fictional brands for portability verification',mobile:{name:'Morrow',tone:'차분한 독서 경험',accent:'#294b3e'},desktop:{name:'Fieldwork',tone:'정돈된 업무 화면',accent:'#3e6450'}},research:[],coverage:{requested:['모바일 서재','읽기 확인','PC 프로젝트 개요','모바일 프로젝트 개요'],completed:entries.map(e=>e.id),missing:[],limitations:['가상 브랜드 기능 예시; Dribbble 조사/전환 성과를 주장하지 않음']},entries};
  await writeJSON(path.join(work,'manifest.json'),manifest);return build(path.join(work,'manifest.json'),out);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)demo(process.argv[2]?path.resolve(process.argv[2]):undefined).then(b=>console.log(`Demo built: ${b.entries.length} entries`)).catch(e=>{console.error(e.stack);process.exit(1)});
