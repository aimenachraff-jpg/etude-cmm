export const quizScript = `(function(){
let userAns = {};
const quizData=[
 {cat:'Audio',q:"Fe minimale pour un signal de 3400 Hz max?",o:["3400 Hz","6800 Hz","8000 Hz","44100 Hz"],a:1,exp:"Nyquist: Fe≥2×fmax=6800 Hz."},
 {cat:'Audio',q:"Débit CD stéréo 44.1kHz 16bits en kbit/s?",o:["705.6","1411.2","2822.4","320"],a:1,exp:"44100×16×2=1 411 200 bit/s."},
 {cat:'Audio',q:"SNR pour 16 bits ≈?",o:["49.41 dB","97.57 dB","145.73 dB","6.02 dB"],a:1,exp:"6.02×16+1.25=97.57 dB."},
 {cat:'Audio',q:"Taille 1 min CD audio en Mo?",o:["5.29","10.58","0.95","1.41"],a:1,exp:"1 411 200×60/8=10 584 000 octets."},
 {cat:'Audio',q:"Nyquist: Fe_min = ?",o:["fmax","2×fmax","fmax/2","4×fmax"],a:1,exp:"Shannon-Nyquist."},
 {cat:'Audio',q:"FLAC réduction typique?",o:["~91%","~50%","~10%","~99%"],a:1,exp:"~50% sans perte."},
 {cat:'Audio',q:"VBR vs CBR?",o:["VBR débit constant","CBR débit variable","VBR économise bande passante","CBR sans perte"],a:2,exp:"VBR variable."},
 {cat:'Audio',q:"MP3 utilise combien de sous-bandes?",o:["8","16","32","64"],a:2,exp:"32 sous-bandes."},
 {cat:'Audio',q:"Opus latence?",o:["5 ms","50 ms","150 ms","500 ms"],a:0,exp:"Opus: latence 5 ms."},
 {cat:'Audio',q:"G.711 débit?",o:["32 kbit/s","64 kbit/s","128 kbit/s","256 kbit/s"],a:1,exp:"8 kHz × 8 bits = 64 kbit/s."},
 {cat:'Image',q:"Image I dans MPEG signifie?",o:["Predicted","Bidirectionnelle","Intra (complète)","Interpolée"],a:2,exp:"I = image complète de référence."},
 {cat:'Image',q:"GOP IBBPBBIBBP a taille?",o:["8","10","12","6"],a:1,exp:"10 caractères."},
 {cat:'Image',q:"JPEG chaîne: première étape?",o:["DCT","Quantification","RGB→YCbCr","Huffman"],a:2,exp:"RGB→YCbCr d'abord."},
 {cat:'Image',q:"Sous-échantillonnage 4:2:0 réduction?",o:["-25%","-50%","-75%","-90%"],a:1,exp:"−50% (Y plein, Cb/Cr ÷4)."},
 {cat:'Image',q:"DCT produit?",o:["pixels","1 DC + 63 AC","vecteurs","coefficients RGB"],a:1,exp:"1 DC (moyenne) + 63 AC (détails)."},
 {cat:'Image',q:"Huffman code?",o:["Longueur fixe","Longueur variable, fréquents→courts","Sans perte uniquement","Avec perte"],a:1,exp:"Code à longueur variable."},
 {cat:'Vidéo',q:"Débit Full HD 1080p 30fps 24bits en Mbit/s?",o:["149.3","1492.99","298.6","746.5"],a:1,exp:"1920×1080×24×30=1.49 Gbit/s."},
 {cat:'Vidéo',q:"H.264 compression typique?",o:["10:1","50:1","100:1","1000:1"],a:2,exp:"≈100:1."},
 {cat:'Vidéo',q:"SAD sert à?",o:["Compresser","Estimer le mouvement","Quantifier","Encoder l'audio"],a:1,exp:"Somme des différences absolues pour le meilleur match."},
 {cat:'Vidéo',q:"B-frame nécessite?",o:["Rien","Un buffer (latence)","Plus de bande passante","Moins de qualité"],a:1,exp:"Buffer car dépend du futur."},
 {cat:'Réseau',q:"Protocole VOD?",o:["UDP","TCP","ICMP","RTP"],a:1,exp:"TCP pour VOD."},
 {cat:'Réseau',q:"Protocole temps réel interactif?",o:["TCP","HTTP","UDP","FTP"],a:2,exp:"UDP (RTP)."},
 {cat:'Réseau',q:"PTS sert à?",o:["Décodage","Affichage","Compression","Transport"],a:1,exp:"Presentation Time Stamp."},
 {cat:'Réseau',q:"DTS pour image B est?",o:["< PTS","= PTS","> PTS","0"],a:2,exp:"DTS>PTS pour les B."},
 {cat:'Réseau',q:"Topologie IPTV?",o:["Broadcast","Multicast","Unicast","Anycast"],a:1,exp:"Multicast."},
 {cat:'Réseau',q:"Latence Meet typique?",o:["20 ms","170 ms","20 s","5 s"],a:1,exp:"20+30+40+60+20=170 ms."},
 {cat:'Réseau',q:"DASH sert à?",o:["Chiffrer","Adapter le débit","Compresser","Multiplexer"],a:1,exp:"ABR."},
 {cat:'Réseau',q:"Gigue (jitter) = ?",o:["Perte de paquets","Variation de délai","Débit","Latence fixe"],a:1,exp:"Variation de délai."},
 {cat:'Réseau',q:"1 Mo binaire = ?",o:["1000 octets","1024 octets","1024² octets","1000² octets"],a:2,exp:"1024² octets."},
 {cat:'Haptique',q:"Fréquence boucle haptique?",o:["24 Hz","60 Hz","1000 Hz","44100 Hz"],a:2,exp:"1000 Hz minimum."},
];

function renderQuiz(){
  const c=document.getElementById('quizContainer');
  c.innerHTML=quizData.map((q,i)=>\`
    <div class="quiz-q" id="qq\${i}">
      <span class="badge \${q.cat==='Audio'?'audio':q.cat==='Image'?'video':q.cat==='Vidéo'?'video':q.cat==='Réseau'?'net':'math'}">\${q.cat}</span>
      <b>\${i+1}. \${q.q}</b>
      \${q.o.map((o,j)=>\`<label class="opt" data-i="\${i}" data-j="\${j}">\${o}</label>\`).join('')}
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="qverify" data-i="\${i}" style="background:linear-gradient(135deg,var(--accent),#0284c7);color:#0a0f1e;border:none;padding:7px 14px;border-radius:7px;cursor:pointer;font-weight:600;font-size:.85rem">Vérifier</button>
        <button class="qreset" data-i="\${i}" style="background:var(--card2);color:var(--text);border:1px solid var(--border);padding:7px 14px;border-radius:7px;cursor:pointer;font-size:.85rem">Réinitialiser</button>
      </div>
      <div class="exp" id="exp\${i}" style="display:none;margin-top:8px;color:var(--muted);font-size:.88rem"></div>
      <div class="qstatus" id="qst\${i}" style="margin-top:6px;font-size:.85rem;font-weight:600"></div>
    </div>\`).join('');
  document.querySelectorAll('.quiz-q .opt').forEach(el=>{
    el.addEventListener('click',()=>{
      const i=+el.dataset.i,j=+el.dataset.j;
      userAns[i]=j;
      document.querySelectorAll(\`.quiz-q .opt[data-i="\${i}"]\`).forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      // reset visual state on re-select
      document.querySelectorAll(\`.quiz-q .opt[data-i="\${i}"]\`).forEach(x=>x.classList.remove('correct','wrong'));
      document.getElementById('exp'+i).style.display='none';
      document.getElementById('qst'+i).textContent='';
    });
  });
  document.querySelectorAll('.qverify').forEach(btn=>{
    btn.addEventListener('click',()=>verifyQuestion(+btn.dataset.i));
  });
  document.querySelectorAll('.qreset').forEach(btn=>{
    btn.addEventListener('click',()=>resetQuestion(+btn.dataset.i));
  });
}

function verifyQuestion(i){
  const q=quizData[i];
  const chosen=userAns[i];
  const opts=document.querySelectorAll(\`.quiz-q .opt[data-i="\${i}"]\`);
  opts.forEach(el=>{
    const v=+el.dataset.j;
    if(v===q.a) el.classList.add('correct');
    else el.classList.remove('correct');
    if(v===chosen && v!==q.a) el.classList.add('wrong');
    else el.classList.remove('wrong');
  });
  // Keep selected on the chosen answer even after verification
  if(chosen !== undefined) {
    const selectedOpt = document.querySelector(\`.quiz-q .opt[data-i="\${i}"][data-j="\${chosen}"]\`)
    if(selectedOpt) selectedOpt.classList.add('selected');
  }
  const exp=document.getElementById('exp'+i);
  exp.style.display='block';
  exp.innerHTML=\`<b>Explication:</b> \${q.exp}\`;
  const st=document.getElementById('qst'+i);
  if(chosen===undefined){st.textContent='⚠ Aucune réponse sélectionnée';st.style.color='var(--warn)';}
  else if(chosen===q.a){st.textContent='✓ Correct (+1)';st.style.color='var(--ok)';}
  else{st.textContent='✗ Incorrect (−0.5)';st.style.color='var(--err)';}
  // update global score
  updateGlobalScore();
}

function resetQuestion(i){
  delete userAns[i];
  document.querySelectorAll(\`.quiz-q .opt[data-i="\${i}"]\`).forEach(el=>el.classList.remove('correct','wrong','selected'));
  document.getElementById('exp'+i).style.display='none';
  document.getElementById('qst'+i).textContent='';
  updateGlobalScore();
}

function updateGlobalScore(){
  let score=0,answered=0;
  quizData.forEach((q,i)=>{
    const chosen=userAns[i];
    // only count if verified (status shown)
    const st=document.getElementById('qst'+i);
    if(st && st.textContent){answered++; if(chosen===q.a) score+=1; else score-=0.5;}
  });
  if(answered===0){document.getElementById('quizScore').innerHTML='';return;}
  const pct=Math.round(Math.max(0,score)/quizData.length*100);
  document.getElementById('quizScore').innerHTML=\`Score: <b>\${score.toFixed(1)}/\${quizData.length}</b> (\${pct}%) · Vérifié: \${answered}/\${quizData.length}\`;
  const p=Math.min(100,(Math.max(0,score)/quizData.length)*100);
  const progEl=document.getElementById('prog');
  const progTxtEl=document.getElementById('progTxt');
  if(progEl) progEl.style.width=p+'%';
  if(progTxtEl) progTxtEl.textContent=Math.round(p)+'%';
}

function gradeQuiz(){quizData.forEach((q,i)=>{if(userAns[i]!==undefined) verifyQuestion(i);});}

function resetQuiz(){
  for(const k in userAns) delete userAns[k];
  document.querySelectorAll('.quiz-q .opt').forEach(el=>el.classList.remove('correct','wrong','selected'));
  document.querySelectorAll('.exp').forEach(e=>{e.style.display='none';});
  document.querySelectorAll('.qstatus').forEach(e=>{e.textContent='';});
  document.getElementById('quizScore').innerHTML='';
  const progEl=document.getElementById('prog');
  const progTxtEl=document.getElementById('progTxt');
  if(progEl) progEl.style.width='0%';
  if(progTxtEl) progTxtEl.textContent='0%';
}


// Init quiz
renderQuiz();
window.gradeQuiz=gradeQuiz;
window.resetQuiz=resetQuiz;
window.renderQuiz=renderQuiz;
window.__tdScriptInit=function(){
  const c=document.getElementById('quizContainer');
  if(c && !c.querySelector('.quiz-q')) renderQuiz();
};
})();
`