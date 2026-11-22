const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const code=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
function el(){const e={classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},contains(c){return this._s.has(c)},replace(){}},style:{},dataset:{},innerHTML:'',innerText:'',value:'',options:[],selectedIndex:0,appendChild(){},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},getContext:()=>null};return e;}
const els={};
const store={};
let reqs=[];
function mkCtx(href,respostas){
 reqs=[];
 const ctx={console:{log(){},warn(){},error(){}},Date,Math,JSON,Promise,Set,Map,Array,Object,String,Number,parseFloat,parseInt,isNaN,RegExp,Uint32Array,URL,
  crypto:require('crypto').webcrypto, setTimeout:()=>0, clearTimeout(){}, setInterval:()=>0, clearInterval(){}, requestAnimationFrame:()=>0, cancelAnimationFrame(){},
  alert(m){ctx._alerts.push(m)}, _alerts:[], confirm:()=>true, confetti(){},
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
  location:{href, pathname:new URL(href).pathname, reload(){}},
  history:{replaceState(a,b,u){ctx._url=u}},
  document:{getElementById:id=>els[id]||(els[id]=el()),createElement:()=>el(),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:el()},
  fetch:async(u,o)=>{reqs.push({u,o});const r=respostas(u,o);return{ok:r.ok!==false,status:r.status||200,json:async()=>r.json,text:async()=>r.text}},
  addEventListener(){}, AudioContext:function(){return{createOscillator:()=>({connect(){},start(){},stop(){},frequency:{}}),createGain:()=>({connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}}),destination:{},currentTime:0}}};
 ctx.tailwind={}; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(code,ctx); return ctx;
}
const API='script.google.com';
const freq=[['Turma','Freq','Turno','Troféus'],['6º Ano A','96,5%','Manhã','2'],['7º Ano B','88,1%','Tarde','0']];
(async()=>{
 // 1) Chave na URL é guardada e removida do endereço
 let ctx=mkCtx('https://anchietafrequencia.vercel.app/?chave=ABC123def456ghi789jkl012',u=>
   u.includes('aba=frequenciometro_alunos')?{json:{status:'success',alunos:[['id','nome','turma','cod'],['1','JOÃO','6º Ano A','6A'],['2','ANA','6º Ano A','6A']],sorteados:['ANA']}}
   : u.includes('aba=frequenciometro')?{json:{status:'success',frequencia:freq,historico:[['S','M'],['S1','91,2']],medias:{escola:86.09,manha:85.5,tarde:87.1,metodo:'ponderada'},trimestres:[{nome:'1º Trimestre',fechado:91.9},{nome:'2º Trimestre',fechado:null},{nome:'3º Trimestre',fechado:null}]}}
   : {json:{status:'success'}});
 assert.strictEqual(store.freq_chave_tv,'ABC123def456ghi789jkl012'); assert.strictEqual(ctx._url,'/');
 await vm.runInContext('carregarDados()',ctx);
 assert.strictEqual(vm.runInContext('todasTurmas.length',ctx),2);
 assert.strictEqual(vm.runInContext('todosAlunos.length',ctx),2);
 assert(vm.runInContext('alunosJaSorteados.has("ANA")',ctx),'sorteados vêm do SIGA');
 assert(!reqs.some(r=>r.u.includes('docs.google.com')),'não usa planilha publicada quando o SIGA responde');
 assert(reqs.some(r=>r.u.includes('chave=ABC123')),'manda a chave');
 // trimestres: 1º fechado, 2º parcial
 assert.strictEqual(vm.runInContext('trimestresPlanilha.length',ctx),3);
 assert.strictEqual(vm.runInContext('mediaGeralEscolaGlobal',ctx),86.09,'usa a média ponderada do SIGA');
 // registrar sorteio manual
 vm.runInContext('toggleAlunoSorteado("JOÃO", true)',ctx); await new Promise(r=>setImmediate(r));
 const post=reqs.find(r=>r.o&&r.o.method==='POST'); const b=JSON.parse(post.o.body);
 assert.deepStrictEqual([b.operacao,b.nome,b.turma,b.origem,b.chave],['SORTEIO_REGISTRAR','JOÃO','6A','manual','ABC123def456ghi789jkl012']);
 // aleatório: distribuição razoável
 const cont=[0,0,0]; for(let i=0;i<3000;i++) cont[vm.runInContext('aleatorioAte(3)',ctx)]++;
 assert(cont.every(c=>c>850&&c<1150),'distribuição '+cont);
 // 2) Backend antigo (sem rota) -> plano B planilha publicada; sem chave -> sem alunos
 for (const k in store) delete store[k];
 ctx=mkCtx('https://anchietafrequencia.vercel.app/',u=>
   u.includes('docs.google.com')&&u.includes('1746538498')?{text:'Turma,Freq,Turno,Troféus\n6º Ano A,"96,5%",Manhã,2\n'}
   : u.includes('docs.google.com')?{text:'Semana,Média\nS1,"91,2"\n'}
   : {json:[{idLinha:2,aluno:'X'}]});  // o doGet antigo devolve Registros
 await vm.runInContext('carregarDados()',ctx);
 assert.strictEqual(vm.runInContext('todasTurmas.length',ctx),1,'plano B funcionou');
 assert.strictEqual(vm.runInContext('todosAlunos.length',ctx),0);
 assert(/chave/.test(vm.runInContext('motivoSemAlunos',ctx)));
 assert(!reqs.some(r=>r.u.includes('1866544411')),'NUNCA baixa a lista pública de alunos');
 // 3) Dados reais da escola: "92.77", linha Esta zerada e Ensino Médio
 assert.strictEqual(vm.runInContext('lerNumero("92.77")',ctx),92.77);
 assert.strictEqual(vm.runInContext('lerNumero("91,26")',ctx),91.26);
 assert.strictEqual(vm.runInContext('extrairCodigoTurma("1º A - NEM")',ctx),vm.runInContext('extrairCodigoTurma("1NEM")',ctx));
 assert.strictEqual(vm.runInContext('extrairCodigoTurma("3º B - NEM")',ctx),'3BNEM');
 assert.strictEqual(vm.runInContext('extrairCodigoTurma("6º A - EF")',ctx),vm.runInContext('extrairCodigoTurma("6A")',ctx));
 vm.runInContext('processarHistorico([["Semana","Media"],["1","92.77"],["22","89,8"],["Esta","0"]])',ctx);
 assert.deepStrictEqual(JSON.parse(vm.runInContext('JSON.stringify(historicoEscola)',ctx)),[{semana:'1',media:92.77},{semana:'22',media:89.8}]);
 console.log('FREQUENCIÔMETRO (front-end): TODOS OS TESTES PASSARAM');
})().catch(e=>{console.error('FALHOU:',e.message);process.exit(1)});
