import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDesignContract} from '../scripts/design-contract.mjs';

test('required facts are checked per state and hidden content or a broken action cannot pass',()=>{
 const contract={requiredContent:[{key:'price',value:'1000',appliesTo:{states:['normal','confirm']}},{key:'submit',action:{targetEntry:'confirm'}}],variants:[{id:'a'},{id:'b'}],critiques:[{priority:'P1',resolution:'open'}]};
 const bundle={entries:[{id:'normal',state:'normal',viewport:'mobile',variant:'a',after:{html:'<body><p data-review-key="price">1000</p><button data-review-key="submit" data-review-entry="confirm">Next</button></body>'}},{id:'confirm',state:'confirm',viewport:'mobile',variant:'a',after:{html:'<body><p data-review-key="price" hidden>1000</p><button data-review-key="submit">Next</button></body>'}}]};
 const audit=auditDesignContract(contract,bundle);assert.equal(audit.missing.length,2);assert.equal(audit.unverified.length,2);assert.equal(audit.unresolved.length,1);assert.equal(audit.variantCount,2);
 contract.requiredContent[0].checks=[{entry:'normal',status:'present',evidence:'inspected normal mobile screenshot'}];assert.equal(auditDesignContract(contract,bundle).checks.find(c=>c.entry==='normal'&&c.key==='price').status,'present');
});

test('requested but absent viewport or state cannot disappear from coverage',()=>{
 const audit=auditDesignContract({requiredContent:[{key:'price',appliesTo:{viewports:['desktop','mobile'],states:['normal','error']}}]},{entries:[]});assert.equal(audit.missing.length,4);
});
