PG.slides.register({
  id: 's05',
  narration: [
    "パガニーニが愛したヴァイオリンは、1743年にグァルネリ・デル・ジェスが作った名器です。",
    "爆発するような力強い音から、パガニーニ自身が「大砲（イル・カノーネ）」と呼びました。",
    "この楽器は今もジェノヴァの市庁舎に大切に保管されています。"
  ],
  build(root) {
    root.innerHTML = `
      <canvas id="s05-embers" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none;"></canvas>
      <div style="position: absolute; left: 400px; top: 490px; transform: translateY(-50%) scale(0.8); width: 400px; height: 800px; transform-origin: center center;">
        <svg id="s05-violin" width="400" height="800" viewBox="0 0 400 800" style="overflow: visible;">
          <defs>
            <filter id="v-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g id="v-group-all" style="stroke: var(--gold); fill: none; stroke-width: 3px; stroke-linejoin: round; filter: url(#v-glow);">
            
            <g id="v-part-back" class="v-part">
              <!-- Back plate -->
              <path class="v-path" d="M150,300 C100,300 50,350 80,450 C90,480 120,500 120,530 C120,560 70,600 70,700 C70,780 150,780 200,780 C250,780 330,780 330,700 C330,600 280,560 280,530 C280,500 310,480 320,450 C350,350 300,300 250,300 Z" />
              <!-- Label -->
              <g class="v-label" style="opacity: 0;">
                <line x1="280" y1="540" x2="330" y2="540" style="stroke: var(--gold); stroke-width: 1px;" />
                <text x="340" y="550" font-size="32" style="fill: var(--gold); stroke: none;" font-family="'Yu Mincho', '游明朝', serif">裏板</text>
              </g>
            </g>
            
            <g id="v-part-front" class="v-part">
              <!-- Front plate -->
              <path class="v-path" d="M150,300 C100,300 50,350 80,450 C90,480 120,500 120,530 C120,560 70,600 70,700 C70,780 150,780 200,780 C250,780 330,780 330,700 C330,600 280,560 280,530 C280,500 310,480 320,450 C350,350 300,300 250,300 Z" />
              <!-- f-holes -->
              <path class="v-path" d="M130,500 C140,550 100,600 120,600 C130,600 140,550 120,500 Z" />
              <path class="v-path" d="M270,500 C260,550 300,600 280,600 C270,600 260,550 280,500 Z" />
              <!-- Label -->
              <g class="v-label" style="opacity: 0;">
                <line x1="120" y1="540" x2="70" y2="540" style="stroke: var(--gold); stroke-width: 1px;" />
                <text x="60" y="550" font-size="32" style="fill: var(--gold); stroke: none; text-anchor: end;" font-family="'Yu Mincho', '游明朝', serif">表板</text>
              </g>
            </g>
            
            <g id="v-part-neck" class="v-part">
              <!-- Fingerboard & Neck -->
              <rect class="v-path" x="185" y="150" width="30" height="250" />
              <path class="v-path" d="M185,150 L185,100 C185,50 215,50 215,100 C215,120 195,120 195,100" /> <!-- Scroll -->
              <!-- Label -->
              <g class="v-label" style="opacity: 0;">
                <line x1="215" y1="120" x2="265" y2="120" style="stroke: var(--gold); stroke-width: 1px;" />
                <text x="275" y="130" font-size="32" style="fill: var(--gold); stroke: none;" font-family="'Yu Mincho', '游明朝', serif">ネック・指板・渦巻き</text>
              </g>
            </g>
            
            <g id="v-part-bridge" class="v-part">
              <!-- Bridge and Tailpiece -->
              <path class="v-path" d="M170,570 L230,570 L230,580 L170,580 Z" />
              <path class="v-path" d="M180,620 L220,620 L210,750 L190,750 Z" />
              <!-- Label -->
              <g class="v-label" style="opacity: 0;">
                <line x1="215" y1="700" x2="265" y2="700" style="stroke: var(--gold); stroke-width: 1px;" />
                <text x="275" y="710" font-size="32" style="fill: var(--gold); stroke: none;" font-family="'Yu Mincho', '游明朝', serif">駒・テールピース</text>
              </g>
            </g>
            
            <g id="v-part-strings" class="v-part">
              <line class="v-path" x1="190" y1="120" x2="190" y2="620" />
              <line class="v-path" x1="196" y1="120" x2="196" y2="620" />
              <line class="v-path" x1="204" y1="120" x2="204" y2="620" />
              <line class="v-path" x1="210" y1="120" x2="210" y2="620" />
              <!-- Label -->
              <g class="v-label" style="opacity: 0;">
                <line x1="210" y1="200" x2="260" y2="200" style="stroke: var(--gold); stroke-width: 1px;" />
                <text x="270" y="210" font-size="32" style="fill: var(--gold); stroke: none;" font-family="'Yu Mincho', '游明朝', serif">弦</text>
              </g>
            </g>
            
          </g>
          
          <circle id="v-shockwave" cx="200" cy="530" r="10" style="fill: none; stroke: var(--gold); stroke-width: 10px; opacity: 0;" />
        </svg>
      </div>
      
      <div id="s05-texts" style="position: absolute; left: 900px; top: 400px; opacity: 0;">
        <div id="s05-title" style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 88px; color: var(--ink); margin-bottom: 30px; white-space: nowrap;">
          イル・カノーネ（<span style="color: var(--ember);">大砲</span>）
        </div>
        <div style="font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; font-size: 40px; color: var(--muted); line-height: 1.5; white-space: nowrap;">
          1743年 グァルネリ・デル・ジェス作<br>
          今もジェノヴァ市庁舎に保管
        </div>
      </div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);
    
    const tl = gsap.timeline();
    const paths = ctx.root.querySelectorAll('.v-path');
    const labels = ctx.root.querySelectorAll('.v-label');
    const parts = {
      back: ctx.root.querySelector('#v-part-back'),
      front: ctx.root.querySelector('#v-part-front'),
      neck: ctx.root.querySelector('#v-part-neck'),
      bridge: ctx.root.querySelector('#v-part-bridge'),
      strings: ctx.root.querySelector('#v-part-strings'),
    };
    const shockwave = ctx.root.querySelector('#v-shockwave');
    const texts = ctx.root.querySelector('#s05-texts');
    const title = ctx.root.querySelector('#s05-title');
    
    const embersCanvas = ctx.root.querySelector('#s05-embers');
    const embers = PG.fx.createEmbers(embersCanvas);
    ctx.addCleanup(() => embers.destroy());
    
    // 1. Draw SVG (3s)
    tl.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 3, ease: "power2.inOut" }, 0);
    
    // 2. Explode
    const explodeTime = 3.5;
    tl.to(parts.front, { x: -280, y: 0, duration: 1.5, ease: "power1.inOut" }, explodeTime);
    tl.to(parts.back, { x: 280, y: 0, duration: 1.5, ease: "power1.inOut" }, explodeTime);
    tl.to(parts.neck, { x: 0, y: -80, duration: 1.5, ease: "power1.inOut" }, explodeTime); // stays above y 130
    tl.to(parts.bridge, { x: 0, y: 80, duration: 1.5, ease: "power1.inOut" }, explodeTime);
    tl.to(parts.strings, { x: 100, y: -60, duration: 1.5, ease: "power1.inOut" }, explodeTime);
    tl.to(labels, { opacity: 1, duration: 0.5 }, explodeTime + 1.0);
    
    // 3. Reassemble
    const assembleTime = explodeTime + 1.5 + 2.0; // wait 2s
    tl.to(labels, { opacity: 0, duration: 0.5 }, assembleTime);
    Object.values(parts).forEach(p => {
      tl.to(p, { x: 0, y: 0, duration: 1.0, ease: "power2.in" }, assembleTime + 0.5);
    });
    
    // Impact
    const impactTime = assembleTime + 1.5;
    tl.call(() => {
      if (PG.engine.isTestMode() || ctx.audio.isMuted()) return;
      const mem = new Tone.MembraneSynth().toDestination();
      mem.triggerAttackRelease("C2", "8n");
      ctx.timeout(() => mem.dispose(), 2000);
    }, null, impactTime);
    
    tl.fromTo(shockwave, 
      { r: 10, opacity: 1, strokeWidth: 20 }, 
      { r: 400, opacity: 0, strokeWidth: 1, duration: 1.0, ease: "power2.out" }, 
      impactTime
    );
    tl.call(() => {
      embers.burst(400 + 200, 1080/2, 40); // center of violin
    }, null, impactTime);
    
    // 4 & 5. Right Text
    tl.to(texts, { opacity: 1, duration: 0 }, impactTime + 0.2);
    // Shake effect
    tl.fromTo(title, 
      { x: -15 }, 
      { x: 0, duration: 0.6, ease: "elastic.out(1, 0.2)" }, 
      impactTime + 0.2
    );
    tl.fromTo(texts, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.0, ease: "power2.out" }, 
      impactTime + 0.2
    );
    
    return tl;
  }
});