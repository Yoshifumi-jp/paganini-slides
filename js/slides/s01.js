window.PG = window.PG || {};

PG.slides.register({
  id: 's01',
  title: '悪魔と呼ばれたヴァイオリニスト',
  narrationDelay: 7.5,
  narration: [
    "今から200年ほど前、ヨーロッパ中の人々を熱狂させたヴァイオリニストがいました。",
    "あまりのうまさに「悪魔に魂を売ったのでは」とうわさされた男。",
    "その名は、ニコロ・パガニーニです。"
  ],
  
  build(root) {
    root.innerHTML = `
      <canvas id="s01-embers" style="position:absolute; inset:0; z-index:1; pointer-events:none;"></canvas>
      <canvas id="s01-string" style="position:absolute; inset:0; z-index:2; pointer-events:none;"></canvas>
      <div id="s01-title-container" style="position:absolute; inset:0; z-index:3; display:flex; flex-direction:column; justify-content:center; align-items:center; pointer-events:none;">
        <h1 class="title" id="s01-title" style="margin-bottom:60px;">
          <span style="color:var(--ember);" class="flicker">悪魔</span>と呼ばれたヴァイオリニスト
        </h1>
        <p class="body" id="s01-subtitle" style="margin-top:20px; font-size:40px;">ニコロ・パガニーニ（1782–1840）</p>
      </div>
      <button id="s01-start-btn" style="position:absolute; z-index:10; font-family:'Yu Mincho',serif; font-size:40px; padding:20px 60px; background:rgba(0,0,0,0.7); color:var(--gold); border:2px solid var(--gold); border-radius:10px; cursor:pointer; box-shadow:0 0 20px var(--gold);">
        ▶ はじめる
        <div style="font-size:20px; font-family:sans-serif; color:var(--muted); margin-top:10px; border:none; box-shadow:none;">音が出ます（Microsoft Edge 推奨）</div>
      </button>
    `;

    // ちらつきエフェクトのCSS追加
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flickerAnim {
        0%, 100% { opacity: 1; text-shadow: 0 0 10px var(--ember); }
        50% { opacity: 0.8; text-shadow: 0 0 5px var(--ember); }
        75% { opacity: 0.9; text-shadow: 0 0 15px var(--ember); }
      }
      .flicker {
        display: inline-block;
        animation: flickerAnim 3s infinite alternate;
      }
    `;
    root.appendChild(style);
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const startBtn = root.querySelector('#s01-start-btn');
    const titleEl = root.querySelector('#s01-title');
    const subtitleEl = root.querySelector('#s01-subtitle');
    
    // Canvas setup
    const stringCanvas = root.querySelector('#s01-string');
    const embersCanvas = root.querySelector('#s01-embers');
    const stringFx = ctx.fx.createString(stringCanvas, { y: 540 });
    const embersFx = ctx.fx.createEmbers(embersCanvas, { rate: ctx.reducedMotion ? 15 : 60 });
    
    ctx.addCleanup(() => {
      stringFx.destroy();
      embersFx.destroy();
    });

    gsap.set(titleEl, { autoAlpha: 0 });
    gsap.set(subtitleEl, { autoAlpha: 0, letterSpacing: "0px" });
    
    // ボタンの明滅アニメーション
    const btnTwinkle = gsap.to(startBtn, {
      boxShadow: "0 0 40px var(--gold)",
      duration: 1.5,
      repeat: -1,
      yoyo: true
    });

    const tl = gsap.timeline({ paused: true });
    
    // 0.5s ~ 弦が伸びる
    tl.to({}, { 
      duration: 1.2, 
      onUpdate: function() { stringFx.draw(this.progress()); },
      ease: "power2.inOut"
    }, 0.5);

    // 1.5s ~ 演奏と同期
    tl.call(() => {
      if (!alive) return;
      if (PG.engine.isTestMode()) {
        embersFx.start();
        return;
      }
      const p = ctx.audio.playMelody(PG.melodies.caprice24ThemeA, {
        onNote: (idx, nObj, dur) => {
          if (!alive) return;
          const note = Array.isArray(nObj.note) ? nObj.note[0] : nObj.note;
          if (note === 'R') return;
          const baseFreq = Tone.Frequency(note).toFrequency();
          const norm = Math.max(0, Math.min(1, (Math.log2(baseFreq) - Math.log2(220)) / 2)); 
          const x = 1920 / 2 + (norm - 0.5) * 800; 
          
          stringFx.pluck(1.0, x);
          embersFx.burst(x, 540, ctx.reducedMotion ? 2 : 5);
        }
      });
      p.done.then(() => {
        if (!alive) return;
        embersFx.start(); // 連続放出
        ctx.timeout(function randomPluck() {
          if (!alive) return;
          stringFx.pluck(0.1, 1920/2 + (Math.random()-0.5)*800);
          ctx.timeout(randomPluck, 500 + Math.random() * 1000);
        }, 1000);
      });
      ctx.addCleanup(() => p.stop());
    }, null, 1.5);

    // 5.5s ~ 見出し
    const splitTitle = new SplitText(titleEl, { type: "chars" });
    tl.set(titleEl, { autoAlpha: 1 }, 5.5);
    tl.from(splitTitle.chars, {
      duration: 1.0,
      y: 50,
      autoAlpha: 0,
      rotation: 5,
      filter: 'blur(10px)',
      stagger: 0.06,
      ease: "back.out(1.2)"
    }, 5.5);

    // 7.0s ~ 副題
    tl.to(subtitleEl, {
      duration: 2.0,
      autoAlpha: 1,
      letterSpacing: "8px",
      ease: "power1.out"
    }, 7.0);

    // 開始イベント
    if (PG.engine.isTestMode() || PG.engine.isStarted()) {
      startBtn.style.display = 'none';
      btnTwinkle.kill();
      tl.play();
    } else {
      ctx.on(startBtn, 'click', async () => {
        btnTwinkle.kill();
        await PG.audio.init();
        if (!alive) return;
        PG.narration.init();
        
        gsap.to(startBtn, { 
          autoAlpha: 0, 
          duration: 0.5, 
          onComplete: () => {
            if (!alive) return;
            startBtn.style.display = 'none';
            PG.engine.setStarted(true);
            tl.play();
          }
        });
      });
    }

    return tl;
  },
  
  leave(ctx) {}
});

