export const huffScript = `function calcHuff(){const syms=hSym.value.split(',').map(s=>s.trim()).filter(Boolean);const freqs=hFreq.value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));if(syms.length!==freqs.length||!syms.length){rHuff.innerHTML='Erreur: nombre de symboles ≠ fréquences';return;}let forest=syms.map((s,i)=>({sym:s,freq:freqs[i],left:null,right:null,code:''}));while(forest.length>1){forest.sort((a,b)=>a.freq-b.freq);const a=forest.shift(),b=forest.shift();forest.push({sym:a.sym+','+b.sym,freq:a.freq+b.freq,left:a,right:b});}const codes={};function walk(n,prefix){if(!n.left&&!n.right){codes[n.sym]=prefix||'0';return;}if(n.left)walk(n.left,prefix+'0');if(n.right)walk(n.right,prefix+'1');}walk(forest[0],'');const totalFreq=freqs.reduce((a,b)=>a+b,0);let entropy=0,avgLen=0,out='Symbole → Code (longueur)<br>';syms.forEach((s,i)=>{const p=freqs[i]/totalFreq;const L=codes[s].length;entropy-=p*Math.log2(p);avgLen+=p*L;out+=\`\${s} (freq \${freqs[i]}) → <b>\${codes[s]}</b> (\${L} bits)<br>\`;});out+=\`<br>Entropie = \${entropy.toFixed(3)} bit/symbole<br>Longueur moyenne = \${avgLen.toFixed(3)} bit/symbole<br>Efficacité = \${(entropy/avgLen*100).toFixed(1)}%\`;rHuff.innerHTML=out;}

function walk(n,prefix){if(!n.left&&!n.right){codes[n.sym]=prefix||'0';return;}if(n.left)walk(n.left,prefix+'0');if(n.right)walk(n.right,prefix+'1');}


// Init
calcHuff();
`