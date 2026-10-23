const a = await import(process.argv[2]+'/substrate/ameliaNumogramSubstrateRuntime.ts');
const b = await import(process.argv[3]+'/substrate/ameliaNumogramSubstrateRuntime.ts');
const r1=new a.AmeliaNumogramSubstrateRuntime(), r2=new b.AmeliaNumogramSubstrateRuntime(); let same=true;
for(let i=1;i<=3000;i++){const x=r1.step('eq|'+i).lastTransition.to, y=r2.step('eq|'+i).lastTransition.to; if(x!==y){same=false;console.log('diverge',i);break}}
console.log('identical trajectories over 3000 steps:', same);
