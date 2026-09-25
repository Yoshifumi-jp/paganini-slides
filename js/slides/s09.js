PG.slides.register({
  id: 's09',
  timeline: { from: 1831, to: 1832 },
  manualNarration: true,
  narration: [
    "パリでパガニーニの演奏を聴いた若きピアニスト、フランツ・リストは衝撃を受けました",
    "「ピアノでパガニーニのような名手になろう」と決意し、ピアノの技巧をみがきます",
    "パガニーニの曲をもとに作った「パガニーニによる大練習曲」の中の「ラ・カンパネラ」は、今も大人気の曲です"
  ],
  build(root) {
    let pianoHtml = '<g id="s09-keys" style="opacity: 0;">';
    const isBlack = (midi) => {
      const m = midi % 12;
      return m === 1 || m === 3 || m === 6 || m === 8 || m === 10;
    };
    
    // 1. White keys first
    let wx = 212;
    const whiteKeyPositions = {};
    for (let m = 60; m <= 96; m++) {
      if (!isBlack(m)) {
        pianoHtml += `<rect x="${wx}" y="360" width="68" height="220" style="fill: #efe6d2; stroke: #3a342a; stroke-width: 2px;" />`;
        pianoHtml += `<rect id="keyGlow-${m}" x="${wx}" y="360" width="68" height="220" style="fill: #ffc24a; stroke: #3a342a; stroke-width: 2px; opacity: 0;" />`;
        pianoHtml += `<rect id="glow-${m}" x="${wx}" y="240" width="68" height="120" style="fill: #ffc24a; filter: blur(20px); mix-blend-mode: screen; opacity: 0;" />`;
        whiteKeyPositions[m] = wx;
        wx += 68;
      }
    }
    
    // 2. Black keys next
    for (let m = 60; m <= 96; m++) {
      if (isBlack(m)) {
        const prevWhiteX = whiteKeyPositions[m - 1];
        const x = prevWhiteX + 68 - 20;
        pianoHtml += `<rect x="${x}" y="360" width="40" height="136" style="fill: #141210; stroke: none;" />`;
        pianoHtml += `<rect id="keyGlow-${m}" x="${x}" y="360" width="40" height="136" style="fill: #d4a64a; stroke: none; opacity: 0;" />`;
        pianoHtml += `<rect id="glow-${m}" x="${x}" y="240" width="40" height="120" style="fill: #d4a64a; filter: blur(15px); mix-blend-mode: screen; opacity: 0;" />`;
      }
    }
    pianoHtml += '</g>';

    root.innerHTML = `
      <div id="s09-title" style="position: absolute; top: 130px; left: 80px; font-family: 'Yu Mincho', '游明朝', serif; font-size: 60px; color: var(--gold);">影響① リスト「ピアノのパガニーニ」をめざして</div>
      
      <div id="s09-labels" style="position: absolute; top: 230px; width: 100%; display: flex; justify-content: space-around; opacity: 0;">
        <div style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 32px; color: var(--ink);">1832年4月　パガニーニの演奏会</div>
        <div style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 32px; color: var(--ink);">フランツ・リスト（1811–1886）　当時20歳</div>
      </div>
      
      <svg width="1920" height="1080" style="position: absolute; inset: 0; overflow: visible;">
        <!-- Piano shape for morphing -->
        <path id="s09-piano-rect" d="M212,360 L1708,360 L1708,580 L212,580 Z" style="visibility: hidden;" />
        <!-- Initial violin shape -->
        <path id="s09-shape" d="M212,470 C300,360 700,360 960,430 C1200,360 1600,360 1708,470 C1600,580 1200,580 960,510 C700,580 300,580 212,470 Z" style="fill: none; stroke: var(--gold); stroke-width: 4px;" />
        ${pianoHtml}
      </svg>
      
      <canvas id="s09-embers" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none;"></canvas>
      
      <div id="s09-credit" style="position: absolute; top: 620px; width: 100%; text-align: center; opacity: 0;">
        <div style="font-size: 28px; color: var(--muted); font-family: sans-serif;">${PG.recordings.paderewski.credit}</div>
        <div style="font-size: 24px; color: var(--ink); font-family: sans-serif; margin-top: 5px;">リスト：ラ・カンパネラ</div>
      </div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const labels = root.querySelector('#s09-labels');
    const shape = root.querySelector('#s09-shape');
    const keysGroup = root.querySelector('#s09-keys');
    const credit = root.querySelector('#s09-credit');
    const canvas = root.querySelector('#s09-embers');
    const embers = ctx.fx.createEmbers(canvas);
    ctx.addCleanup(() => embers.destroy());

    const tl = gsap.timeline();

    tl.to(labels, { autoAlpha: 1, duration: 1, y: -10, ease: "power1.out" });
    
    tl.call(() => {
      ctx.speak([this.narration[0], this.narration[1]]).then(() => {
        if (!alive) return;
        
        // Morph violin to piano
        gsap.to(shape, {
          morphSVG: "#s09-piano-rect",
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(shape, { autoAlpha: 0 });
            gsap.to(keysGroup, { autoAlpha: 1, duration: 0.5 });
            
            // Bell effect
            ctx.timeout(() => {
              if (!alive) return;
              embers.burst(960, 300, 30);
              ctx.audio.playMelody([{ note: 'D#6', dur: '8n' }], { instrument: 'bell' });
              
              ctx.timeout(() => {
                if (!alive) return;
                embers.burst(960, 300, 30);
                ctx.audio.playMelody([{ note: 'D#6', dur: '8n' }], { instrument: 'bell' });
                
                ctx.timeout(() => {
                  if (!alive) return;
                  embers.burst(960, 300, 30);
                  ctx.audio.playMelody([{ note: 'D#6', dur: '2n' }], { instrument: 'bell' });
                  
                  // Start recording
                  ctx.timeout(() => {
                    if (!alive) return;
                    startMusic();
                  }, 1500);
                }, 400);
              }, 400);
            }, 500);
          }
        });
      });
    });

    let requestID;
    
    function startMusic() {
      gsap.to(credit, { autoAlpha: 1, duration: 1 });
      
      const p = ctx.audio.playRecording('paderewski', { analyse: true });
      
      ctx.speak([PG.slides.defs.find(d => d.id === 's09').narration[2]]).then(() => {
        // Line 3 done
      });
      
      p.done.then(() => {
        if (!alive) return;
        cancelAnimationFrame(requestID);
        ctx.markNarrationDone();
      });
      
      ctx.addCleanup(() => {
        p.stop();
        cancelAnimationFrame(requestID);
      });

      if (PG.engine.isTestMode() || ctx.audio.isMuted()) {
        const testLoop = () => {
          if (!alive) return;
          const m = 60 + Math.floor(Math.random() * 37);
          const glow = root.querySelector(`#glow-${m}`);
          const keyGlow = root.querySelector(`#keyGlow-${m}`);
          if (glow) {
            gsap.fromTo([glow, keyGlow].filter(Boolean), { opacity: 0.8 }, { opacity: 0, duration: 0.3 });
          }
          ctx.timeout(testLoop, 200);
        };
        testLoop();
        return;
      }

      // FFT analysis
      const bins = [];
      const sampleRate = Tone.context.sampleRate;
      for (let m = 60; m <= 96; m++) {
        const f = Tone.Frequency(m, "midi").toFrequency();
        const binIndex = Math.round(f * 4096 / sampleRate);
        bins.push({ m, binIndex, el: root.querySelector(`#glow-${m}`), keyGlow: root.querySelector(`#keyGlow-${m}`) });
      }

      function updateFFT() {
        if (!alive) return;
        const data = ctx.audio.getRecordingFFT();
        if (data && data.length > 0) {
          let globalMax = -100;
          bins.forEach(b => {
            for (let i = b.binIndex - 1; i <= b.binIndex + 1; i++) {
              if (data[i] !== undefined && data[i] > globalMax) globalMax = data[i];
            }
          });
          
          let candidates = [];
          bins.forEach(b => {
            let maxDb = -100;
            for (let i = b.binIndex - 1; i <= b.binIndex + 1; i++) {
              if (data[i] !== undefined && data[i] > maxDb) maxDb = data[i];
            }
            
            let v = 0;
            if (globalMax > -100) {
              const maxAmp = Math.pow(10, globalMax / 20);
              const valAmp = Math.pow(10, maxDb / 20);
              v = valAmp / maxAmp;
              if (v < 0) v = 0;
              if (v > 1) v = 1;
            }
            candidates.push({ b, v });
          });
          
          // Sort by intensity descending
          candidates.sort((c1, c2) => c2.v - c1.v);
          
          // Apply to bins
          candidates.forEach((c, idx) => {
            let op = 0;
            // Only top 6 keys with v >= 0.55 will glow
            if (idx < 6 && c.v >= 0.55) {
              op = Math.pow(c.v, 0.7) * 0.95;
            }
            
            // smooth decay
            const b = c.b;
            if (b.el) {
              const currentOp = parseFloat(b.el.style.opacity) || 0;
              let newOp = op > currentOp ? op : currentOp - 0.11;
              if (newOp < 0) newOp = 0;
              b.el.style.opacity = newOp;
              if (b.keyGlow) b.keyGlow.style.opacity = newOp;
            }
          });
        }
        requestID = requestAnimationFrame(updateFFT);
      }
      updateFFT();
    }

    return tl;
  }
});