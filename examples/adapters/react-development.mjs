// Optional trusted development adapter; React internals are absent in production builds.
export async function sourceHints({page}){
  return page.evaluate(()=>{const result={};for(const el of document.querySelectorAll('[data-review-key]')){
    if(el.dataset.sourceFile){result[el.dataset.reviewKey]={file:el.dataset.sourceFile,line:Number(el.dataset.sourceLine)||null,component:el.dataset.sourceComponent||null};continue;}
    const fiberKey=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));let fiber=fiberKey?el[fiberKey]:null;const seen=new Set();
    while(fiber&&!seen.has(fiber)){seen.add(fiber);const source=fiber._debugSource;if(source?.fileName){result[el.dataset.reviewKey]={file:source.fileName,line:source.lineNumber||null,component:typeof fiber.type==='function'?fiber.type.displayName||fiber.type.name||null:null};break;}fiber=fiber.return;}
  }return result;});
}
