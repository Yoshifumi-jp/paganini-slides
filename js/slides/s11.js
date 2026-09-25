PG.slides.register({
  id: 's11',
  manualNarration: true,
  narration: [
    "1934年、ラフマニノフは「パガニーニの主題による狂詩曲」を作りました。",
    "その第18変奏では、パガニーニのメロディを上下さかさまにしています。",
    "すると、あの激しいメロディが、まるで別の曲のように美しく変身しました。聴き比べてみましょう。",
    "これから流れるのは、1934年にラフマニノフ本人がピアノを弾いた録音です。"
  ],
  build(root) {
    root.innerHTML = `
      <div class="title" style="position: absolute; top: 80px; width: 100%; text-align: center;">ラフマニノフの魔法「旋律を逆さにすると…」</div>
      
      <svg id="s11-staff" width="1600" height="400" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0;">
        <defs>
          <filter id="s11-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g id="s11-lines" style="stroke: var(--ink); stroke-width: 2px; opacity: 0.5;">
          <line x1="0" y1="120" x2="1600" y2="120" />
          <line x1="0" y1="160" x2="1600" y2="160" />
          <line x1="0" y1="200" x2="1600" y2="200" />
          <line x1="0" y1="240" x2="1600" y2="240" />
          <line x1="0" y1="280" x2="1600" y2="280" />
        </g>
        
        <text x="50" y="250" font-family="'Segoe UI Symbol', sans-serif" font-size="140" style="fill: var(--ink); opacity: 0.8;">𝄞</text>
        
        <line id="s11-axis" x1="200" y1="220" x2="1400" y2="220" style="stroke: var(--gold); stroke-width: 4px; stroke-dasharray: 10,10; opacity: 0;" filter="url(#s11-glow)" />
        
        <g id="s11-notes-g" transform="translate(400, 0)"></g>
      </svg>
      
      <div id="s11-label" style="position: absolute; top: 220px; width: 100%; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 40px; color: var(--gold); opacity: 0;"></div>
      
      <canvas id="s11-aurora" width="1920" height="260" style="position: absolute; top: 560px; left: 0; pointer-events: none; opacity: 0; mix-blend-mode: screen;"></canvas>
      
      <div id="s11-credit" style="position: absolute; top: 230px; right: 40px; text-align: right; opacity: 0;">
        <div style="font-size: 28px; color: var(--muted); font-family: sans-serif;">${PG.recordings.rachmaninoff.credit}</div>
      </div>
      
      <div id="s11-buttons" style="position: absolute; top: 290px; right: 40px; display: flex; gap: 20px; opacity: 0;">
        <button id="btn-original" style="font-size: 24px; padding: 10px 20px; background: rgba(0,0,0,0.6); border: 1px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer;">原型</button>
        <button id="btn-inverted" style="font-size: 24px; padding: 10px 20px; background: rgba(0,0,0,0.6); border: 1px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer;">上下さかさま</button>
        <button id="btn-record" style="font-size: 24px; padding: 10px 20px; background: rgba(0,0,0,0.6); border: 1px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer;">本人の演奏</button>
      </div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const staff = root.querySelector('#s11-staff');
    const notesG = root.querySelector('#s11-notes-g');
    const axis = root.querySelector('#s11-axis');
    const label = root.querySelector('#s11-label');
    const auroraCanvas = root.querySelector('#s11-aurora');
    const credit = root.querySelector('#s11-credit');
    const buttons = root.querySelector('#s11-buttons');
    
    // Y coords mapping (B4 is 34)
    // A4 is 33 -> diff = 1 -> y = 200 + 1*20 = 220
    const noteMap = { 'C':0, 'D':1, 'E':2, 'F':3, 'G':4, 'A':5, 'B':6 };
    function getY(noteStr) {
      const match = noteStr.match(/([A-G])([#b]?)(\d)/);
      if (!match) return 220;
      const diatonic = noteMap[match[1]] + parseInt(match[3]) * 7;
      const diff = 34 - diatonic;
      return 200 + diff * 20;
    }

    const noteEls = [];
    const headNotes = PG.melodies.s11Head.slice(0, 5); // Take first 5 notes
    const invNotes = PG.melodies.s11Inverted.slice(0, 5);
    const rachNotes = PG.melodies.s11Rach.slice(0, 5);

    // Initial notes
    headNotes.forEach((n, i) => {
      const y = getY(n.note);
      const x = i * 150;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${x}, ${y})`);
      
      const flat = document.createElementNS("http://www.w3.org/2000/svg", "text");
      flat.textContent = "♭";
      flat.setAttribute("x", "-35");
      flat.setAttribute("y", "10");
      flat.setAttribute("font-size", "40");
      flat.style.fill = "var(--ink)";
      flat.style.opacity = "0";
      g.appendChild(flat);

      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      ellipse.setAttribute("rx", "16");
      ellipse.setAttribute("ry", "12");
      ellipse.style.fill = "var(--ink)";
      ellipse.setAttribute("transform", "rotate(-20)");
      g.appendChild(ellipse);
      
      notesG.appendChild(g);
      noteEls[i] = { g, ellipse, flat, currX: x, currY: y };
    });

    const tl = gsap.timeline();

    tl.call(() => {
      ctx.speak([this.narration[0]]).then(() => {
        if (!alive) return;
        
        gsap.to(staff, { autoAlpha: 1, duration: 1 });
        label.textContent = "パガニーニの主題";
        gsap.to(label, { autoAlpha: 1, duration: 1 });
        
        playCurrent('head', () => {
          if (!alive) return;
          ctx.speak([this.narration[1]]).then(() => {
            if (!alive) return;
            
            // Show axis
            gsap.to(axis, { autoAlpha: 1, duration: 0.5 });
            
            ctx.timeout(() => {
              if (!alive) return;
              
              // Invert
              label.textContent = "上下さかさま";
              invNotes.forEach((n, i) => {
                const targetY = getY(n.note);
                noteEls[i].currY = targetY;
                gsap.to(noteEls[i].g, {
                  y: targetY,
                  duration: 1,
                  ease: "back.out(1.2)",
                  delay: i * 0.2
                });
              });
              
              ctx.timeout(() => {
                if (!alive) return;
                playCurrent('inv', () => {
                  if (!alive) return;
                  
                  // Rachmaninoff transform
                  label.textContent = "ラフマニノフの第18変奏";
                  gsap.to(axis, { autoAlpha: 0, duration: 0.5 });
                  
                  rachNotes.forEach((n, i) => {
                    const targetY = getY(n.note.replace('b', ''));
                    const targetX = i * 200;
                    noteEls[i].currY = targetY;
                    noteEls[i].currX = targetX;
                    gsap.to(noteEls[i].g, {
                      x: targetX,
                      y: targetY,
                      duration: 1.5,
                      ease: "power2.inOut",
                      delay: i * 0.3
                    });
                    if (n.note.includes('b')) {
                      gsap.to(noteEls[i].flat, { autoAlpha: 1, duration: 0.5, delay: i * 0.3 + 1 });
                    }
                  });
                  
                  ctx.timeout(() => {
                    if (!alive) return;
                    playCurrent('rach', () => {
                      if (!alive) return;
                      
                      ctx.speak([this.narration[2], this.narration[3]]).then(() => {
                        if (!alive) return;
                        startRecording();
                      });
                    });
                  }, 2500);
                  
                });
              }, 1500);
              
            }, 1000);
          });
        });
      });
    });

    let currentAudioParts = null;
    let requestID;

    function playCurrent(type, onComplete) {
      if (currentAudioParts) currentAudioParts.stop();
      noteEls.forEach(el => gsap.set(el.ellipse, { fill: "var(--ink)" }));
      
      let melody = type === 'head' ? headNotes : type === 'inv' ? invNotes : rachNotes;
      let inst = type === 'rach' ? 'piano' : 'violin'; // 'violin' is default arco
      let bpm = type === 'rach' ? 60 : 116;
      
      let p = ctx.audio.playMelody(melody, {
        instrument: inst === 'violin' ? undefined : inst,
        bpm: bpm,
        onNote: (idx) => {
          if (!alive || !noteEls[idx]) return;
          const el = noteEls[idx];
          gsap.fromTo(el.ellipse, { fill: "var(--gold)" }, { fill: "var(--ink)", duration: 0.5 });
        }
      });
      currentAudioParts = p;
      if (onComplete) p.done.then(onComplete);
    }

    function startRecording() {
      if (currentAudioParts) currentAudioParts.stop();
      gsap.to([staff, label], { autoAlpha: 0, duration: 1 });
      gsap.to([auroraCanvas, credit, buttons], { autoAlpha: 1, duration: 1 });
      
      const p = ctx.audio.playRecording('rachmaninoff', { analyse: true });
      currentAudioParts = p;
      
      p.done.then(() => {
        if (!alive) return;
        cancelAnimationFrame(requestID);
        ctx.markNarrationDone();
      });

      const actx = auroraCanvas.getContext('2d');
      const w = auroraCanvas.width;
      const h = auroraCanvas.height;
      
      function drawAurora() {
        if (!alive) return;
        actx.clearRect(0, 0, w, h);
        
        let data;
        if (PG.engine.isTestMode() || ctx.audio.isMuted()) {
          data = new Float32Array(64).fill(-80).map(() => -80 + Math.random() * 40);
        } else {
          data = ctx.audio.getRecordingFFT();
        }
        
        if (data && data.length > 0) {
          actx.beginPath();
          actx.moveTo(0, h);
          const step = w / 64; // draw 64 points
          for (let i = 0; i < 64; i++) {
            // sample from lower 256 bins
            const idx = Math.floor((i / 64) * 256);
            let val = data[idx] || -100;
            let n = (val + 80) / 60; // 0 to 1
            if (n < 0) n = 0;
            if (n > 1) n = 1;
            
            const x = i * step;
            const y = h - (n * h * 0.8) - 20;
            if (i === 0) actx.moveTo(x, y);
            else actx.lineTo(x, y);
          }
          actx.lineTo(w, h);
          actx.closePath();
          
          const grad = actx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, 'rgba(212, 166, 74, 0.8)');
          grad.addColorStop(1, 'rgba(212, 166, 74, 0.0)');
          actx.fillStyle = grad;
          actx.fill();
        }
        requestID = requestAnimationFrame(drawAurora);
      }
      drawAurora();
    }

    ctx.on(root.querySelector('#btn-original'), 'click', () => {
      cancelAnimationFrame(requestID);
      gsap.to([staff, label], { autoAlpha: 1, duration: 0.5 });
      gsap.to(auroraCanvas, { autoAlpha: 0, duration: 0.5 });
      label.textContent = "パガニーニの主題";
      
      // Reset notes position
      headNotes.forEach((n, i) => {
        const x = i * 150;
        const y = getY(n.note);
        gsap.to(noteEls[i].g, { x, y, duration: 0.5 });
        gsap.to(noteEls[i].flat, { autoAlpha: 0, duration: 0.5 });
      });
      playCurrent('head');
    });

    ctx.on(root.querySelector('#btn-inverted'), 'click', () => {
      cancelAnimationFrame(requestID);
      gsap.to([staff, label], { autoAlpha: 1, duration: 0.5 });
      gsap.to(auroraCanvas, { autoAlpha: 0, duration: 0.5 });
      label.textContent = "上下さかさま";
      
      invNotes.forEach((n, i) => {
        const x = i * 150;
        const y = getY(n.note);
        gsap.to(noteEls[i].g, { x, y, duration: 0.5 });
        gsap.to(noteEls[i].flat, { autoAlpha: 0, duration: 0.5 });
      });
      playCurrent('inv');
    });

    ctx.on(root.querySelector('#btn-record'), 'click', () => startRecording());

    ctx.addCleanup(() => {
      if (currentAudioParts) currentAudioParts.stop();
      cancelAnimationFrame(requestID);
    });

    return tl;
  }
});
