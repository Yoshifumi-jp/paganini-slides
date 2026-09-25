PG.slides.register({
  id: 's10',
  narration: [
    "カプリース第24番のメロディは、多くの作曲家が自分の作品の材料にしました",
    "ブラームス、ラフマニノフ、ルトスワフスキ、そしてミュージカル作曲家のロイド＝ウェバーまで",
    "1つのメロディから、200年にわたって新しい音楽が生まれ続けているのです"
  ],
  build(root) {
    const pieces = [
      { year: 1838, comp: "リスト", title: "パガニーニによる大練習曲 第6番", desc: "ピアノ1台で変奏を再現（1851年に改訂）" },
      { year: 1863, comp: "ブラームス", title: "パガニーニの主題による変奏曲", desc: "ピアノの超絶技巧の練習曲としても有名" },
      { year: 1934, comp: "ラフマニノフ", title: "パガニーニの主題による狂詩曲", desc: "第18変奏は次のスライドで" },
      { year: 1941, comp: "ルトスワフスキ", title: "パガニーニの主題による変奏曲", desc: "ピアノ2台のための作品" },
      { year: 1947, comp: "ブラッハー", title: "パガニーニの主題による変奏曲", desc: "オーケストラのための作品" },
      { year: 1977, comp: "ロイド＝ウェバー", title: "ヴァリエーションズ", desc: "ミュージカル作曲家によるロック風の変奏" }
    ];

    let svgHtml = '';
    let htmlContent = '';

    const rootX = 400;
    const rootY = 540;

    pieces.forEach((p, i) => {
      const y = 230 + i * 92;
      svgHtml += `<path id="s10-branch-${i}" d="M ${rootX},${rootY} C ${rootX + 200},${rootY} ${rootX + 300},${y} 900,${y}" fill="none" stroke="var(--gold)" stroke-width="3" style="opacity: 0;" />`;
      svgHtml += `<circle id="s10-node-${i}" cx="900" cy="${y}" r="8" fill="var(--gold)" style="opacity: 0; cursor: pointer;" />`;
      
      htmlContent += `
        <div id="s10-text-${i}" style="position: absolute; left: 930px; top: ${y - 20}px; opacity: 0; pointer-events: none; white-space: nowrap;">
          <span style="font-size: 28px; color: var(--gold); font-family: sans-serif; display: inline-block; width: 80px;">${p.year}</span>
          <span style="font-size: 32px; color: var(--ink); font-family: 'Yu Mincho', '游明朝', serif; font-weight: bold; margin-right: 20px;">${p.comp}</span>
          <span style="font-size: 28px; color: var(--ink); font-family: 'Yu Mincho', '游明朝', serif;">${p.title}</span>
          <div id="s10-desc-${i}" style="font-size: 28px; color: var(--muted); font-family: sans-serif; margin-top: 5px; opacity: 0; transform: translateX(20px);">${p.desc}</div>
        </div>
      `;
    });

    // Dashed branch
    const dashedY = 800;
    svgHtml += `<path id="s10-branch-dashed" d="M ${rootX},${rootY} C ${rootX + 200},${rootY} ${rootX + 300},${dashedY} 900,${dashedY}" fill="none" stroke="var(--gold)" stroke-width="3" stroke-dasharray="8,8" style="opacity: 0;" />`;
    htmlContent += `
      <div id="s10-text-dashed" style="position: absolute; left: 930px; top: ${dashedY - 15}px; opacity: 0; pointer-events: none; font-size: 28px; color: var(--muted); font-family: sans-serif;">
        現代へ ロックギター…
      </div>
    `;

    root.innerHTML = `
      <div class="title" style="position: absolute; top: 80px;">影響② カプリース第24番「変奏の系譜」</div>
      
      <svg width="1920" height="1080" style="position: absolute; inset: 0;">
        ${svgHtml}
      </svg>
      
      <!-- Root Node -->
      <div id="s10-root-node" style="position: absolute; left: 100px; top: 390px; width: 300px; height: 300px; border-radius: 50%; background: rgba(212,166,74,0.1); border: 2px solid var(--gold); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; opacity: 0; transform: scale(0.8);">
        <div style="font-family: 'Yu Mincho', '游明朝', serif; font-size: 40px; color: var(--gold); line-height: 1.4;">パガニーニ<br>24の奇想曲<br>第24番</div>
      </div>
      
      ${htmlContent}
      
      <!-- Interactive layer for clicking nodes easily -->
      <div id="s10-click-layer" style="position: absolute; inset: 0;"></div>
    `;
    
    // Add clickable hit areas
    const clickLayer = root.querySelector('#s10-click-layer');
    pieces.forEach((p, i) => {
      const y = 230 + i * 92;
      const hit = document.createElement('div');
      hit.style.cssText = `position: absolute; left: 880px; top: ${y - 30}px; width: 900px; height: 80px; cursor: pointer;`;
      hit.dataset.idx = i;
      hit.setAttribute('data-no-advance', 'true');
      clickLayer.appendChild(hit);
    });
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const rootNode = root.querySelector('#s10-root-node');
    const tl = gsap.timeline();
    const stateDesc = {};
    
    // Show root
    tl.to(rootNode, { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.2)" });

    function playTransposed(halfSteps) {
      if (!alive || !PG.melodies.s11Head) return;
      const transposed = PG.melodies.s11Head.map(n => {
        if (n.note === 'R' || (Array.isArray(n.note) && n.note[0] === 'R')) return n;
        let newNote = n.note;
        if (Array.isArray(n.note)) {
           newNote = n.note.map(nt => Tone.Frequency(nt).transpose(halfSteps).toNote());
        } else {
           newNote = Tone.Frequency(n.note).transpose(halfSteps).toNote();
        }
        return Object.assign({}, n, { note: newNote });
      });
      ctx.audio.playMelody(transposed, { instrument: 'piano', bpm: 120 });
    }

    // Expand branches
    for (let i = 0; i < 6; i++) {
      const branch = root.querySelector(`#s10-branch-${i}`);
      const node = root.querySelector(`#s10-node-${i}`);
      const text = root.querySelector(`#s10-text-${i}`);
      
      gsap.set(branch, { opacity: 1 });
      
      tl.from(branch, {
        drawSVG: "0%",
        duration: 1,
        ease: "power1.inOut"
      }, `+=${i === 0 ? 0.5 : 0.2}`);
      
      tl.to(node, { autoAlpha: 1, duration: 0.3 }, "-=0.2");
      tl.to(text, { autoAlpha: 1, x: 10, duration: 0.5 }, "-=0.2");
      
      const desc = root.querySelector(`#s10-desc-${i}`);
      tl.to(desc, { autoAlpha: 1, x: 0, duration: 0.5 }, "-=0.3");
      
      tl.call(() => {
        stateDesc[i] = true;
        if (alive) playTransposed(i * 2); // Transpose up by 2 half steps each time
      });
    }

    // Dashed branch
    const dashedBranch = root.querySelector('#s10-branch-dashed');
    const dashedText = root.querySelector('#s10-text-dashed');
    gsap.set(dashedBranch, { opacity: 1 });
    tl.from(dashedBranch, { drawSVG: "0%", duration: 1.5, ease: "none" }, "+=0.5");
    tl.to(dashedText, { autoAlpha: 1, duration: 1 });

    // Interactions
    const hitAreas = root.querySelectorAll('#s10-click-layer > div');
    
    hitAreas.forEach(hit => {
      ctx.on(hit, 'click', () => {
        const i = hit.dataset.idx;
        const desc = root.querySelector(`#s10-desc-${i}`);
        if (!stateDesc[i]) {
          stateDesc[i] = true;
          gsap.to(desc, { autoAlpha: 1, x: 0, duration: 0.3 });
        } else {
          stateDesc[i] = false;
          gsap.to(desc, { autoAlpha: 0, x: 20, duration: 0.3 });
        }
      });
    });

    return tl;
  }
});
