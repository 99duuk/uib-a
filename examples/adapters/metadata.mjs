// Project-provided metadata is evidence; missing metadata keeps DOM/region fallback.
export async function sourceHints({page}){
  return page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('[data-review-key][data-source-file]')].map(e=>[e.dataset.reviewKey,{file:e.dataset.sourceFile,line:Number(e.dataset.sourceLine)||null,component:e.dataset.sourceComponent||null}])));
}
