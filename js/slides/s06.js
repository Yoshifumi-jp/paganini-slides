PG.slides.register({
  id: 's06',
  narration: [
    "パガニーニの演奏は、それまで誰も聴いたことのない技でいっぱいでした。",
    "2つの音を同時に鳴らす「重音」、笛のような音を出す「ハーモニクス」、弓を使いながら左手で弦をはじく「左手ピチカート」。",
    "さらに、4本ある弦のうち1本だけで曲を弾いてみせたこともあります。ボタンを押して、音を確かめてみましょう。"
  ],
  build(root) {
    root.innerHTML = `
      <div id="s06-title" style="position: absolute; top: 80px; left: 80px; font-family: 'Yu Mincho', '游明朝', serif; font-size: 64px; color: var(--gold);">超絶技巧 体験ラボ</div>
      
      <!-- Strings Canvas -->
      <canvas id="s06-canvas" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none;"></canvas>
      
      <!-- String labels -->
      <div style="position: absolute; left: 100px; top: 275px; font-size: 40px; color: var(--gold); font-family: 'Yu Mincho', '游明朝', serif;">E線</div>
      <div style="position: absolute; left: 100px; top: 375px; font-size: 40px; color: var(--gold); font-family: 'Yu Mincho', '游明朝', serif;">A線</div>
      <div style="position: absolute; left: 100px; top: 475px; font-size: 40px; color: var(--gold); font-family: 'Yu Mincho', '游明朝', serif;">D線</div>
      <div style="position: absolute; left: 100px; top: 575px; font-size: 40px; color: var(--gold); font-family: 'Yu Mincho', '游明朝', serif;">G線</div>
      
      <!-- Buttons -->
      <div id="s06-buttons" style="position: absolute; top: 720px; left: 0; right: 0; display: flex; justify-content: center; gap: 40px; z-index: 10;">
        <div class="s06-btn-group" style="text-align: center;">
          <button id="btn-1" style="font-size: 32px; padding: 15px 30px; background: rgba(0,0,0,0.6); border: 2px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; transition: background 0.3s;">① 重音</button>
          <div class="s06-desc" style="margin-top: 20px; font-size: 32px; color: var(--muted); font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; transition: color 0.3s;">2本の弦を同時に弾く</div>
        </div>
        <div class="s06-btn-group" style="text-align: center;">
          <button id="btn-2" style="font-size: 32px; padding: 15px 30px; background: rgba(0,0,0,0.6); border: 2px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; transition: background 0.3s;">② ハーモニクス</button>
          <div class="s06-desc" style="margin-top: 20px; font-size: 32px; color: var(--muted); font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; transition: color 0.3s;">弦に軽く触れて笛のような音</div>
        </div>
        <div class="s06-btn-group" style="text-align: center;">
          <button id="btn-3" style="font-size: 32px; padding: 15px 30px; background: rgba(0,0,0,0.6); border: 2px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; transition: background 0.3s;">③ 左手ピチカート</button>
          <div class="s06-desc" style="margin-top: 20px; font-size: 32px; color: var(--muted); font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; transition: color 0.3s;">弓を使いながら左手で弦をはじく</div>
        </div>
        <div class="s06-btn-group" style="text-align: center;">
          <button id="btn-4" style="font-size: 32px; padding: 15px 30px; background: rgba(0,0,0,0.6); border: 2px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; transition: background 0.3s;">④ G線1本</button>
          <div class="s06-desc" style="margin-top: 20px; font-size: 32px; color: var(--muted); font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; transition: color 0.3s;">いちばん低いG線だけで高い音まで</div>
        </div>
      </div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const canvas = ctx.root.querySelector('#s06-canvas');
    const cctx = canvas.getContext('2d');
    
    // String configs
    const STRINGS = {
      'E': { y: 300, w: 2, active: false, sparks: [], nodes: [], plucks: [], glowPos: null },
      'A': { y: 400, w: 4, active: false, sparks: [], nodes: [], plucks: [], glowPos: null },
      'D': { y: 500, w: 6, active: false, sparks: [], nodes: [], plucks: [], glowPos: null },
      'G': { y: 600, w: 8, active: false, sparks: [], nodes: [], plucks: [], glowPos: null }
    };
    
    const startX = 200;
    const endX = 1720;
    const strLen = endX - startX;
    
    let isSoloG = false;
    
    // Animation loop
    let reqId;
    function loop() {
      if (!alive) return;
      cctx.clearRect(0, 0, 1920, 1080);
      
      cctx.globalCompositeOperation = 'lighter';
      
      Object.keys(STRINGS).forEach(key => {
        const s = STRINGS[key];
        
        let opacity = 0.6;
        if (isSoloG) opacity = key === 'G' ? 1.0 : 0.2;
        else if (s.active) opacity = 1.0;
        
        cctx.save();
        cctx.shadowBlur = s.active || isSoloG && key === 'G' ? 15 : 0;
        cctx.shadowColor = '#d4a64a';
        cctx.strokeStyle = `rgba(212, 166, 74, ${opacity})`; // gold
        cctx.lineWidth = s.w;
        
        cctx.beginPath();
        for (let x = startX; x <= endX; x += 10) {
          let dy = 0;
          
          s.plucks.forEach(p => {
            const relX = (x - startX) / strLen; // 0 to 1
            // Basic standing wave: sin(n * pi * x)
            // p.waves contains harmonics
            let waveDy = 0;
            p.waves.forEach(w => {
              waveDy += Math.sin(w.n * Math.PI * relX) * w.amp;
            });
            dy += waveDy * Math.sin(p.phase);
          });
          
          if (x === startX) cctx.moveTo(x, s.y + dy);
          else cctx.lineTo(x, s.y + dy);
        }
        cctx.stroke();
        
        // Draw nodes for harmonics
        s.nodes.forEach(n => {
          cctx.fillStyle = '#d4a64a';
          cctx.shadowBlur = 20;
          cctx.beginPath();
          cctx.arc(startX + strLen * (1 - n.pos), s.y, 10, 0, Math.PI * 2);
          cctx.fill();
        });
        
        // Draw moving glow for G-string
        if (s.glowPos !== null) {
          cctx.fillStyle = 'rgba(255,255,255,0.8)';
          cctx.shadowBlur = 30;
          cctx.shadowColor = 'white';
          cctx.beginPath();
          cctx.arc(startX + s.glowPos * strLen, s.y, 10, 0, Math.PI * 2);
          cctx.fill();
        }
        
        // Update plucks
        for (let i = s.plucks.length - 1; i >= 0; i--) {
          const p = s.plucks[i];
          p.phase += p.speed;
          p.waves.forEach(w => w.amp *= 0.93);
          if (p.waves[0].amp < 0.1) {
            s.plucks.splice(i, 1);
          } else {
            s.active = true;
          }
        }
        if (s.plucks.length === 0) s.active = false;
        
        // Draw sparks
        for (let i = s.sparks.length - 1; i >= 0; i--) {
          const sp = s.sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.5; // gravity
          sp.life -= 0.05;
          if (sp.life <= 0) {
            s.sparks.splice(i, 1);
          } else {
            cctx.fillStyle = `rgba(255, 200, 100, ${sp.life})`;
            cctx.shadowBlur = 5;
            cctx.beginPath();
            cctx.arc(sp.x, sp.y, 3, 0, Math.PI*2);
            cctx.fill();
          }
        }
        
        cctx.restore();
      });
      
      reqId = requestAnimationFrame(loop);
    }
    loop();
    ctx.addCleanup(() => cancelAnimationFrame(reqId));
    
    // Button Logic
    let currentPart = null;
    const buttons = [
      { id: 'btn-1', key: '1', data: PG.melodies.labDoubleStops },
      { id: 'btn-2', key: '2', data: PG.melodies.labHarmonics },
      { id: 'btn-3', key: '3', data: PG.melodies.labLeftPizz },
      { id: 'btn-4', key: '4', data: PG.melodies.labGString }
    ];
    
    function resetVisuals() {
      isSoloG = false;
      Object.keys(STRINGS).forEach(key => {
        STRINGS[key].nodes = [];
        STRINGS[key].glowPos = null;
        STRINGS[key].plucks = [];
        STRINGS[key].sparks = [];
        STRINGS[key].active = false;
      });
    }
    
    function playLab(index, data) {
      if (currentPart) currentPart.stop();
      resetVisuals();
      
      isSoloG = (index === 3);
      
      // Highlight button and description
      buttons.forEach((b, i) => {
        const el = ctx.root.querySelector('#' + b.id);
        const desc = el.nextElementSibling;
        if (i === index) {
          el.style.background = 'rgba(212,166,74,0.3)';
          desc.style.color = 'var(--gold)';
        } else {
          el.style.background = 'rgba(0,0,0,0.6)';
          desc.style.color = 'var(--muted)';
        }
      });
      
      currentPart = ctx.audio.playMelody(data, {
        onNote: (idx, nObj, dur) => {
          if (!alive) return;
          
          const strs = Array.isArray(nObj.string) ? nObj.string : [nObj.string];
          
          if (isSoloG) {
            // Note pitch defines X position (approx)
            // G3 is 0, G5 is 1 (2 octaves)
            const noteStr = Array.isArray(nObj.note) ? nObj.note[0] : nObj.note;
            const freq = Tone.Frequency(noteStr).toMidi();
            const g3Midi = Tone.Frequency('G3').toMidi();
            const rel = Math.max(0, Math.min(1, (freq - g3Midi) / 24)); // 24 semitones = 2 octaves
            STRINGS['G'].glowPos = 0.2 + rel * 0.6; // keep within boundaries
          }
          
          strs.forEach(strKey => {
            if (STRINGS[strKey]) {
              const s = STRINGS[strKey];
              
              if (nObj.tech === 'pizz') {
                // Sparks left side
                for(let k=0; k<15; k++){
                  s.sparks.push({
                    x: startX + 100 + Math.random()*20,
                    y: s.y,
                    vx: (Math.random()-0.5)*10,
                    vy: (Math.random()-0.5)*10,
                    life: 1
                  });
                }
                s.plucks.push({ phase: 0, speed: 0.8, waves: [{ n: 1, amp: 20 }] });
              } else if (nObj.tech === 'harm') {
                const harmonicN = Math.round(1 / nObj.node); // 1/2 -> 2, 1/3 -> 3, 1/4 -> 4
                s.nodes = [];
                for(let k=1; k<harmonicN; k++) {
                  s.nodes.push({ pos: k / harmonicN });
                }
                s.plucks.push({ phase: 0, speed: 0.5, waves: [{ n: harmonicN, amp: 15 }] });
                ctx.timeout(() => { s.nodes = []; }, dur * 1000);
              } else {
                // Normal arco
                s.plucks.push({ phase: 0, speed: 0.4, waves: [{ n: 1, amp: 10 }, { n: 2, amp: 5 }] });
              }
            }
          });
        }
      });
    }
    
    // Bind buttons and keys
    buttons.forEach((b, i) => {
      const el = ctx.root.querySelector('#' + b.id);
      ctx.on(el, 'click', () => playLab(i, b.data));
    });
    
    ctx.on(window, 'keydown', (e) => {
      const idx = buttons.findIndex(b => b.key === e.key);
      if (idx >= 0) playLab(idx, buttons[idx].data);
    });
    
    // Hide UI initially, animate in
    const tl = gsap.timeline();
    tl.from(ctx.root.querySelectorAll('.s06-btn-group'), {
      y: 50,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "back.out(1.5)"
    }, 0.5);
    
    return tl;
  }
});