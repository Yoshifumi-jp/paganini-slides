PG.slides.register({
  id: 's02',
  manualNarration: true,
  build(root) {
    root.innerHTML = `
      <div id="s02-title" class="title" style="position: absolute; top: 80px;">このメロディ、聞いたことある？</div>
      
      <svg id="s02-staff" width="1600" height="400" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <defs>
          <filter id="s02-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Staff Lines -->
        <g id="s02-lines" style="stroke: var(--ink); stroke-width: 2px; opacity: 0.5;">
          <line x1="0" y1="120" x2="1600" y2="120" />
          <line x1="0" y1="160" x2="1600" y2="160" />
          <line x1="0" y1="200" x2="1600" y2="200" />
          <line x1="0" y1="240" x2="1600" y2="240" />
          <line x1="0" y1="280" x2="1600" y2="280" />
        </g>
        
        <!-- Clef -->
        <text x="50" y="250" font-family="'Segoe UI Symbol', sans-serif" font-size="140" style="fill: var(--ink); opacity: 0.8;">𝄞</text>
        
        <!-- Playhead -->
        <line x1="800" y1="80" x2="800" y2="320" style="stroke: var(--gold); stroke-width: 4px;" filter="url(#s02-glow)" />
        
        <!-- Notes Group (moves left) -->
        <g id="s02-notes-g" transform="translate(800, 0)"></g>
      </svg>
      
      <div id="s02-credit" style="position: absolute; top: calc(50% + 210px); left: 50%; width: 1600px; transform: translateX(-50%); text-align: right; line-height: 1.4;">
        <div style="font-size: 28px; color: var(--muted); font-family: sans-serif;">${PG.recordings.ricci.credit}</div>
        <div style="font-size: 24px; color: var(--muted); font-family: sans-serif;">世界初のカプリース全曲録音</div>
      </div>
      
      <div id="s02-result" style="position: absolute; top: 50%; left: 0; right: 0; margin: auto; width: fit-content; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; opacity: 0; pointer-events: none;">
        <div style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 64px; color: var(--ink); margin-bottom: 20px; white-space: nowrap;">パガニーニ作曲　24の奇想曲　第24番</div>
        <div style="font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; font-size: 44px; color: var(--ember); white-space: nowrap;">約200年前の曲</div>
      </div>
      
      <button id="s02-replay" style="position: absolute; bottom: 80px; right: 80px; font-size: 32px; padding: 15px 30px; background: transparent; border: 2px solid var(--gold); color: var(--gold); border-radius: 8px; cursor: pointer; opacity: 0; pointer-events: none; transition: background 0.3s;">♪ もう一度聴く</button>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const titleEl = root.querySelector('#s02-title');
    const staffSvg = root.querySelector('#s02-staff');
    const notesG = root.querySelector('#s02-notes-g');
    const resultEl = root.querySelector('#s02-result');
    const replayBtn = root.querySelector('#s02-replay');
    const creditEl = root.querySelector('#s02-credit');
    
    // Notes parsing
    const notes = PG.melodies.caprice24Theme;
    const noteMap = { 'C':0, 'D':1, 'E':2, 'F':3, 'G':4, 'A':5, 'B':6 };
    const pxPerSec = 400; // speed of notes
    
    const ricciRec = PG.recordings.ricci;
    const totalTime = ricciRec.themeEnd;
    
    // Middle line (B4) is y=200, line spacing = 40, step = 20
    const noteEls = [];
    
    notes.forEach((n, i) => {
      const timeSec = ricciRec.noteTimes[i];
      const x = timeSec * pxPerSec;
      
      if (n.note !== 'R' && (!Array.isArray(n.note) || n.note[0] !== 'R')) {
        const noteStr = Array.isArray(n.note) ? n.note[0] : n.note;
        const match = noteStr.match(/([A-G])([#b]?)(\d)/);
        if (match) {
          const diatonic = noteMap[match[1]] + parseInt(match[3]) * 7;
          const diff = 34 - diatonic; // B4 is 34
          const y = 200 + diff * 20;
          
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("transform", `translate(${x}, ${y})`);
          
          const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
          ellipse.setAttribute("rx", "16");
          ellipse.setAttribute("ry", "12");
          ellipse.style.fill = "var(--ink)";
          // Slant slightly
          ellipse.setAttribute("transform", "rotate(-20)");
          g.appendChild(ellipse);
          
          // Ripple
          const ripple = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          ripple.setAttribute("r", "16");
          ripple.style.fill = "none";
          ripple.style.stroke = "var(--gold)";
          ripple.style.strokeWidth = "4px";
          ripple.style.opacity = "0";
          g.appendChild(ripple);
          
          notesG.appendChild(g);
          noteEls[i] = { ellipse, ripple, g };
        }
      }
    });
    
    const lines = [
      "まずは、このメロディを聴いてください。",
      "テレビやCMで耳にしたことがある人もいるかもしれません。",
      "これはパガニーニが作った「24の奇想曲（カプリース）」の第24番。200年たった今も、世界中で演奏されています。"
    ];

    const tl = gsap.timeline();
    
    // Title Animation
    const splitTitle = new SplitText(titleEl, { type: "chars" });
    tl.from(splitTitle.chars, {
      duration: 0.8,
      y: -50,
      autoAlpha: 0,
      stagger: 0.05,
      ease: "back.out(1.2)"
    });

    let currentAudioParts = null;
    
    function playMusicAndAnimate() {
      if (!alive) return;
      
      // Reset position
      gsap.set(notesG, { x: 800 });
      noteEls.forEach(el => {
        if (el) {
          gsap.set(el.ellipse, { fill: "var(--ink)" });
          gsap.set(el.ellipse.parentNode, { filter: "none" });
          gsap.set(el.ripple, { opacity: 0, r: 16 });
        }
      });
      
      const moveDuration = totalTime;
      const moveTl = gsap.to(notesG, {
        x: 800 - (totalTime * pxPerSec),
        duration: moveDuration,
        ease: "none",
        paused: true
      });
      
      const p = ctx.audio.playRecording('ricci', {
        onNote: (idx, timeSec) => {
          if (!alive) return;
          if (idx === 0) {
             moveTl.time(timeSec);
             moveTl.play();
          }
          const el = noteEls[idx];
          if (el) {
            gsap.set(el.ellipse, { fill: "var(--gold)" });
            gsap.set(el.g, { filter: "url(#s02-glow)" });
            gsap.fromTo(el.ripple, 
              { r: 16, opacity: 1 }, 
              { r: 60, opacity: 0, duration: 0.6, ease: "power1.out" }
            );
          }
        }
      });
      currentAudioParts = p;
      p.done.then(() => {
        if (!alive) return;
        showResult();
      });
      
      ctx.addCleanup(() => {
        moveTl.kill();
        if (currentAudioParts) currentAudioParts.stop();
      });
    }

    let resultShown = false;
    let hasSpokenResult = false;
    function showResult() {
      if (!alive || resultShown) return;
      resultShown = true;
      gsap.to([staffSvg, creditEl], { autoAlpha: 0.2, duration: 1 });
      gsap.to(resultEl, { autoAlpha: 1, duration: 1, y: -20, ease: "power1.out" });
      
      if (!hasSpokenResult) {
        hasSpokenResult = true;
        ctx.speak([lines[1], lines[2]]).then(() => {
          if (!alive) return;
          ctx.markNarrationDone();
          gsap.to(replayBtn, { autoAlpha: 1, duration: 0.5 });
          replayBtn.style.pointerEvents = "auto";
        });
      } else {
        // Replay: just show button again immediately
        gsap.to(replayBtn, { autoAlpha: 1, duration: 0.5 });
        replayBtn.style.pointerEvents = "auto";
      }
    }

    ctx.on(replayBtn, 'mouseover', () => replayBtn.style.background = 'rgba(212,166,74,0.1)');
    ctx.on(replayBtn, 'mouseout', () => replayBtn.style.background = 'transparent');
    ctx.on(replayBtn, 'click', () => {
      gsap.to(replayBtn, { autoAlpha: 0, duration: 0.2, onComplete: () => replayBtn.style.pointerEvents = "none" });
      gsap.to([staffSvg, creditEl], { autoAlpha: 1, duration: 0.5 });
      gsap.to(resultEl, { autoAlpha: 0, duration: 0.5 });
      resultShown = false;
      playMusicAndAnimate();
    });

    // Start Sequence
    tl.call(() => {
      ctx.speak([lines[0]]).then(() => {
        playMusicAndAnimate();
      });
    });

    return tl;
  }
});