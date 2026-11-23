export const calcScript = `function calcAudio(){const Fe=+aFe.value,B=+aB.value,ch=+aCh.value,t=+aT.value;if(!Fe||!B||!ch||!t){rAudio.innerHTML='';return;}const D=Fe*B*ch;const S=D*t/8;rAudio.innerHTML=\`Débit = \${D.toLocaleString()} bit/s = \${(D/1000).toFixed(2)} kbit/s<br>Taille = \${S.toLocaleString()} octets = \${(S/1e6).toFixed(3)} Mo = \${(S/1048576).toFixed(3)} Mio\`;}

function calcSNR(){const B=+sB.value;if(!B){rSNR.innerHTML='';return;}rSNR.innerHTML=\`SNR = 6.02×\${B}+1.25 = <b>\${(6.02*B+1.25).toFixed(2)} dB</b> · Niveaux = 2^\${B} = \${Math.pow(2,B).toLocaleString()}\`;}

function calcNyq(){const f=+nyF.value;if(!f){rNyq.innerHTML='';return;}rNyq.innerHTML=\`Fe_min (Nyquist) = 2 × \${f} = <b>\${(2*f).toLocaleString()} Hz</b>\`;}

function calcQuant(){const B=+qB.value,Vmax=+qMax.value,Vmin=+qMin.value;if(!B){rQuant.innerHTML='';return;}const N=Math.pow(2,B);const Q=(Vmax-Vmin)/N;rQuant.innerHTML=\`Niveaux = 2^\${B} = \${N.toLocaleString()}<br>Pas Q = (\${Vmax}−\${Vmin})/\${N} = <b>\${Q.toFixed(6)}</b><br>SNR ≈ \${(6.02*B+1.25).toFixed(2)} dB\`;}

function calcVideo(){const W=+vW.value,H=+vH.value,bpp=+vBpp.value,fps=+vFps.value;if(!W||!H||!bpp||!fps){rVideo.innerHTML='';return;}const D=W*H*bpp*fps;rVideo.innerHTML=\`Débit = \${D.toLocaleString()} bit/s = \${(D/1e6).toFixed(2)} Mbit/s = \${(D/1e9).toFixed(3)} Gbit/s\`;}

function calcImg(){const W=+iW.value,H=+iH.value,bpp=+iMode.value,comp=+iComp.value;if(!W||!H){rImg.innerHTML='';return;}const S=W*H*bpp/8;const compSize=S*(comp/100);rImg.innerHTML=\`Taille brute = \${S.toLocaleString()} octets = \${(S/1e6).toFixed(3)} Mo<br>Avec JPEG \${comp}%: ≈ \${(compSize/1e6).toFixed(3)} Mo\`;}

function calcMPEG(){const S=+mS.value,I=+mI.value,P=+mP.value,B=+mB.value,_nI=+nI.value,_nP=+nP.value,_nB=+nB.value;if(!S){rMPEG.innerHTML='';return;}const total=_nI+_nP+_nB;const poids=_nI*I/100+_nP*P/100+_nB*B/100;const avg=poids/total;rMPEG.innerHTML=\`GOP = \${total} images<br>Poids GOP = \${poids.toFixed(2)} (unités image)<br>Moyenne = \${avg.toFixed(4)}<br>Taille compressée = <b>\${(S*avg).toFixed(2)} Mo</b> (ratio \${(1/avg).toFixed(1)}:1)\`;}

function calcLat(){const s=+l1.value+ +l2.value+ +l3.value+ +l4.value+ +l5.value;rLat.innerHTML=\`Latence totale = <b>\${s} ms</b>\` + (s>150?' <span style="color:var(--err)">⚠ dépasse 150 ms (temps réel)</span>':' <span style="color:var(--ok)">✓ OK temps réel</span>');}

function calcVoIP(){const n=+voN.value,d=+voD.value;if(!n||!d){rVoIP.innerHTML='';return;}const total=n*d;rVoIP.innerHTML=\`Bande totale = \${n} × \${d} = <b>\${total.toFixed(1)} kbit/s = \${(total/1000).toFixed(3)} Mbit/s</b>\`;}

function calcHuff(){const hSym=document.getElementById('hSym'),hFreq=document.getElementById('hFreq'),rHuff=document.getElementById('rHuff');if(!hSym||!hFreq||!rHuff)return;const syms=hSym.value.split(',').map(s=>s.trim()).filter(Boolean);const freqs=hFreq.value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));if(syms.length!==freqs.length||!syms.length){rHuff.innerHTML='Erreur: nombre de symboles ≠ fréquences';return;}let forest=syms.map((s,i)=>({sym:s,freq:freqs[i],left:null,right:null,code:''}));while(forest.length>1){forest.sort((a,b)=>a.freq-b.freq);const a=forest.shift(),b=forest.shift();forest.push({sym:a.sym+','+b.sym,freq:a.freq+b.freq,left:a,right:b});}const codes={};function walk(n,prefix){if(!n.left&&!n.right){codes[n.sym]=prefix||'0';return;}if(n.left)walk(n.left,prefix+'0');if(n.right)walk(n.right,prefix+'1');}walk(forest[0],'');const totalFreq=freqs.reduce((a,b)=>a+b,0);let entropy=0,avgLen=0,out='Symbole → Code (longueur)<br>';syms.forEach((s,i)=>{const p=freqs[i]/totalFreq;const L=codes[s].length;entropy-=p*Math.log2(p);avgLen+=p*L;out+=\`\${s} (freq \${freqs[i]}) → <b>\${codes[s]}</b> (\${L} bits)<br>\`;});out+=\`<br>Entropie = \${entropy.toFixed(3)} bit/symbole<br>Longueur moyenne = \${avgLen.toFixed(3)} bit/symbole<br>Efficacité = \${(entropy/avgLen*100).toFixed(1)}%\`;rHuff.innerHTML=out;}


// Init calculators
calcAudio();calcSNR();calcNyq();calcQuant();calcVideo();calcImg();calcMPEG();calcLat();calcVoIP();calcHuff();
window.__tdScriptInit=function(){calcAudio();calcSNR();calcNyq();calcQuant();calcVideo();calcImg();calcMPEG();calcLat();calcVoIP();calcHuff();};
`