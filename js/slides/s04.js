PG.slides.register({
  id: 's04',
  timeline: { from: 1782, to: 1782 },
  narration: [
    "少年パガニーニは、ジェノヴァで演奏会を開くほどの腕前になりました。",
    "1801年からはイタリアのルッカで活動し、1805年からはナポレオンの妹エリーザの宮廷に仕えました。",
    "代表作「24の奇想曲」は、1802年から1817年ごろにかけて書かれ、1820年に出版されました。"
  ],
  build(root) {
    root.innerHTML = `
      <div id="s04-map-container" style="position: absolute; inset: 0;"></div>
      
      <!-- Overlay Crown -->
      <div id="s04-crown-group" style="position: absolute; left: 120px; top: 300px; width: 580px; height: 200px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--gold); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0;">
        <svg id="s04-crown" width="100" height="80" viewBox="0 0 100 100">
          <path class="crown-path" d="M10,80 L90,80 L80,30 L65,55 L50,20 L35,55 L20,30 Z" style="fill: none; stroke: var(--gold); stroke-width: 4px; stroke-linejoin: round;" />
          <circle cx="20" cy="25" r="4" style="fill: none; stroke: var(--gold); stroke-width: 3px;" class="crown-path" />
          <circle cx="50" cy="15" r="4" style="fill: none; stroke: var(--gold); stroke-width: 3px;" class="crown-path" />
          <circle cx="80" cy="25" r="4" style="fill: none; stroke: var(--gold); stroke-width: 3px;" class="crown-path" />
        </svg>
        <div style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 36px; color: var(--gold); margin-top: 15px;">ナポレオンの妹 エリーザの宮廷</div>
      </div>
      
      <!-- Papers Animation on the right -->
      <div id="s04-papers-container" style="position: absolute; left: 1350px; top: 300px; width: 400px; height: 400px;">
        <div id="s04-papers-stack" style="position: relative; width: 100%; height: 100%;"></div>
        <div id="s04-counter" style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); font-family: 'Yu Mincho', '游明朝', serif; font-size: 80px; color: var(--gold); text-shadow: 2px 2px 8px rgba(0,0,0,0.8); opacity: 0; z-index: 50;">1</div>
      </div>
      <div id="s04-caprice-label" style="position: absolute; left: 1350px; top: 720px; width: 400px; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 40px; color: var(--gold); background: rgba(0, 0, 0, 0.6); padding: 10px 0; border-radius: 8px; opacity: 0;">24の奇想曲</div>
    `;
    
    // Generate papers
    const stack = root.querySelector('#s04-papers-stack');
    for (let i = 0; i < 24; i++) {
      const paper = document.createElement('div');
      paper.className = 's04-paper';
      paper.style.position = 'absolute';
      paper.style.width = '200px';
      paper.style.height = '280px';
      paper.style.background = '#f4ecd8';
      paper.style.border = '1px solid #dcd0b8';
      paper.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.3)';
      paper.style.opacity = '0';
      // Add random rotation and slight offset for stacking
      const rot = (Math.random() - 0.5) * 20;
      const dx = (Math.random() - 0.5) * 30 + 100;
      const dy = (Math.random() - 0.5) * 30 + 50;
      paper.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      
      // Draw 5 lines
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '180');
      svg.setAttribute('height', '260');
      svg.style.margin = '10px';
      let d = '';
      for (let y = 0; y < 5; y++) {
        const lineY = 60 + y * 10;
        d += `M 20 ${lineY} L 160 ${lineY} `;
      }
      for (let y = 0; y < 5; y++) {
        const lineY = 160 + y * 10;
        d += `M 20 ${lineY} L 160 ${lineY} `;
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.style.stroke = '#a09886';
      path.style.strokeWidth = '1px';
      svg.appendChild(path);
      paper.appendChild(svg);
      
      stack.appendChild(paper);
    }
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const mapContainer = root.querySelector('#s04-map-container');
    const crownGroup = root.querySelector('#s04-crown-group');
    const crownPaths = root.querySelectorAll('.crown-path');
    const papers = root.querySelectorAll('.s04-paper');
    const counterEl = root.querySelector('#s04-counter');
    const capriceLabel = root.querySelector('#s04-caprice-label');
    
    const map = PG.map.create(mapContainer);
    ctx.addCleanup(() => map.destroy());
    
    const tl = gsap.timeline();
    
    // 1. Initial State
    map.drawIn(0.01).progress(1);
    map.zoomTo('genoa', 3.5, 0.01).progress(1);
    map.pin('genoa', { label: 'ジェノヴァ', sub: '1782年10月27日 誕生' }).progress(1);
    
    // 2. Year 1794
    tl.call(() => {
      if (PG.timeline) {
        PG.timeline.moveTo(1794, 2);
        ctx.timeout(() => {
          if (!alive) return;
          const genoaPin = mapContainer.querySelector('#map-pin-genoa');
          if (genoaPin) {
            const texts = genoaPin.querySelectorAll('text');
            if (texts.length > 1) {
              texts[1].textContent = '1794年 初の公開演奏';
            }
          }
        }, 1000);
      }
    }, null, 1.5);
    
    // 3. Year 1801 -> Lucca
    tl.call(() => {
      if (!alive) return;
      map.unpin('genoa');
      if (PG.timeline) PG.timeline.moveTo(1801, 1.5);
    }, null, 4.5);
    tl.add(map.zoomTo('lucca', 3.5, 2), 4.5);
    tl.add(map.pin('lucca', { label: 'ルッカ', sub: '1801年〜', side: 'left' }), 6.0);
    
    // 4. Year 1805 -> Crown
    tl.call(() => {
      if (PG.timeline) PG.timeline.moveTo(1805, 1.5);
    }, null, 7.5);
    
    tl.set(crownGroup, { autoAlpha: 1 }, 8.5);
    tl.fromTo(crownPaths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.0, ease: "power1.inOut" }, 8.5);
    
    // 5. Papers Animation (10.0 ~ 13.0)
    tl.to(counterEl, { autoAlpha: 1, duration: 0.5 }, 10.0);
    
    const paperObj = { count: 1 };
    tl.to(paperObj, {
      count: 24,
      duration: 2.0,
      ease: "power2.out",
      onUpdate: () => {
        const c = Math.floor(paperObj.count);
        counterEl.textContent = c;
        for (let i = 0; i < c; i++) {
          if (papers[i]) papers[i].style.opacity = '1';
        }
      }
    }, 10.5);
    
    tl.to(capriceLabel, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 12.5);
    
    return tl;
  }
});