PG.slides.register({
  id: 's08',
  manualNarration: true,
  timeline: { from: 1828, to: 1828 },
  narration: [
    "1828年のウィーンを皮切りに、パガニーニはヨーロッパ各地で演奏旅行を行いました。",
    "ウィーンでは、何でも「パガニーニ風」と名づけられるほどの大ブームになりました。",
    "1831年にはパリとロンドンでもデビューし、どこでも大評判となりました。",
    "一人の演奏家が各地を回ってスターになる――今のコンサートツアーの原型とも言えます。"
  ],
  build(root) {
    root.innerHTML = `
      <div id="s08-map-container" style="position: absolute; inset: 0;"></div>
      <div id="s08-floating-texts" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden;"></div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const mapContainer = root.querySelector('#s08-map-container');
    const floatContainer = root.querySelector('#s08-floating-texts');
    const map = PG.map.create(mapContainer);
    ctx.addCleanup(() => map.destroy());
    
    map.drawIn(0.01).progress(1);
    
    let noise, filter;
    if (!PG.engine.isTestMode()) {
      filter = new Tone.Filter(1000, "bandpass");
      PG.audio.connect(filter);
      
      noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
      }).connect(filter);
      
      noise.volume.value = -15;
      
      ctx.addCleanup(() => {
        if (noise) noise.dispose();
        if (filter) filter.dispose();
      });
    }

    function playApplause() {
      if (PG.engine.isTestMode() || ctx.audio.isMuted() || !noise) return;
      const count = 30;
      for (let i = 0; i < count; i++) {
        if (!alive) break;
        const delay = Math.random() * 2.0;
        ctx.timeout(() => {
          if (alive && noise) noise.triggerAttackRelease("16n");
        }, delay * 1000);
      }
    }
    
    const tl = gsap.timeline();
    
    const runSeq = async () => {
      const n = [
        "1828年のウィーンを皮切りに、パガニーニはヨーロッパ各地で演奏旅行を行いました。",
        "ウィーンでは、何でも「パガニーニ風」と名づけられるほどの大ブームになりました。",
        "1831年にはパリとロンドンでもデビューし、どこでも大評判となりました。",
        "一人の演奏家が各地を回ってスターになる――今のコンサートツアーの原型とも言えます。"
      ];

      // 1
      let tl1 = gsap.timeline();
      tl1.add(map.pin('vienna', { label: 'ウィーン', sub: '1828年', side: 'top' }));
      tl1.call(() => playApplause());
      await Promise.all([ctx.speak([n[0]]), new Promise(r => { tl1.eventCallback('onComplete', r); if (tl1.progress() === 1) r(); })]);
      if (!alive) return;

      // 2
      const vPin = mapContainer.querySelector('#map-pin-vienna');
      const vx = vPin ? parseFloat(vPin.getAttribute('data-x')) : 1000;
      const vy = vPin ? parseFloat(vPin.getAttribute('data-y')) : 500;
      
      for(let i=0; i<5; i++) {
        const span = document.createElement('div');
        span.textContent = 'パガニーニ風';
        span.style.position = 'absolute';
        span.style.left = `${vx + (Math.random() - 0.5) * 200}px`;
        span.style.top = `${vy + (Math.random() - 0.5) * 150}px`;
        span.style.fontFamily = '"Yu Mincho", "游明朝", serif';
        span.style.fontSize = `${Math.random() * 10 + 20}px`;
        span.style.color = 'var(--gold)';
        span.style.opacity = 0;
        floatContainer.appendChild(span);
        
        gsap.to(span, { opacity: 0.8, duration: 1.0, delay: Math.random() * 0.5 });
        gsap.to(span, { y: "-=80", duration: 8.0, ease: "none" });
      }
      
      await ctx.speak([n[1]]);
      if (!alive) return;
      gsap.to(floatContainer, { opacity: 0, duration: 0.5, onComplete: () => floatContainer.innerHTML = '' });

      // 3
      if (PG.timeline) PG.timeline.moveTo(1831, 2);
      let tl3 = gsap.timeline();
      tl3.add(map.route(['vienna', 'paris'], 2.0));
      tl3.add(map.pin('paris', { label: 'パリ', sub: '1831年3月', side: 'top' }));
      tl3.call(() => playApplause());
      tl3.add(map.route(['paris', 'london'], 1.5));
      tl3.add(map.pin('london', { label: 'ロンドン', sub: '1831年6月', side: 'left' }));
      tl3.call(() => playApplause());

      await Promise.all([ctx.speak([n[2]]), new Promise(r => { tl3.eventCallback('onComplete', r); if (tl3.progress() === 1) r(); })]);
      if (!alive) return;

      // 4
      let tl4 = gsap.timeline();
      tl4.call(() => {
        if (!alive) return;
        ['vienna', 'paris', 'london'].forEach((cityKey, i) => {
          const pin = mapContainer.querySelector(`#map-pin-${cityKey}`);
          if (pin) {
            const r = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            r.setAttribute("r", "5");
            r.style.fill = "none";
            r.style.stroke = "var(--gold)";
            r.style.strokeWidth = "3px";
            pin.insertBefore(r, pin.firstChild);
            
            gsap.to(r, { r: 100, opacity: 0, duration: 2.0, ease: "power1.out", onComplete: () => r.remove() });
          }
        });
      });
      await Promise.all([ctx.speak([n[3]]), new Promise(r => { tl4.eventCallback('onComplete', r); if (tl4.progress() === 1) r(); })]);
      if (!alive) return;
      
      ctx.markNarrationDone();
    };

    tl.call(() => runSeq());
    
    return tl;
  }
});