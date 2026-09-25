PG.slides.register({
  id: 's13',
  timeline: { from: 1831, to: 1840 },
  narration: [
    "1840年、パガニーニはフランスのニースで亡くなりました。57歳でした。",
    "しかし、彼が広げたヴァイオリンの可能性と、スター演奏家という生き方は、今も音楽の世界に生き続けています。"
  ],
  build(root) {
    root.innerHTML = `
      <div id="s13-map-container" style="position: absolute; inset: 0;"></div>
      <div id="s13-map-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.8); opacity: 0; pointer-events: none;"></div>
      
      <!-- Glowing string container -->
      <canvas id="s13-string-canvas" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none;"></canvas>
      
      <!-- Name -->
      <div id="s13-name" style="position: absolute; top: 560px; left: 50%; transform: translateX(-50%); font-family: 'Yu Mincho', '游明朝', serif; font-size: 56px; color: var(--gold); text-shadow: 0 0 15px rgba(0,0,0,0.8); opacity: 0; text-align: center;">ニコロ・パガニーニ<br><span style="font-size: 40px;">（1782–1840）</span></div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const mapContainer = root.querySelector('#s13-map-container');
    const overlay = root.querySelector('#s13-map-overlay');
    const stringCanvas = root.querySelector('#s13-string-canvas');
    const nameLabel = root.querySelector('#s13-name');
    
    const map = PG.map.create(mapContainer);
    ctx.addCleanup(() => map.destroy());
    
    // Draw map instantly
    map.drawIn(0.01).progress(1);
    
    const tl = gsap.timeline();
    
    // 1. Map zoom and pin
    tl.add(map.zoomTo('nice', 3, 2.5), 0.5);
    tl.add(map.pin('nice', { label: 'ニース', sub: '1840年5月27日' }), 2.5);
    
    // 2. Darken and string
    tl.to(overlay, { autoAlpha: 1, duration: 2 }, 4.0);
    
    tl.call(() => {
      if (!alive) return;
      if (PG.fx && PG.fx.createString) {
        const str = PG.fx.createString(stringCanvas, {
          y: 660,
          color: '#d4a64a',
          glow: true
        });
        
        // draw from 0 to 1
        const strObj = { progress: 0 };
        gsap.to(strObj, {
          progress: 1,
          duration: 0.5,
          onUpdate: () => {
             if (alive) str.draw(strObj.progress);
          }
        });
        
        let amp = 1.0;
        const tick = () => {
          if (!alive) {
            str.destroy();
            return;
          }
          str.pluck(amp * 20); // amp is 0-1, so mult by max dist
          amp *= 0.93; // decay over ~6 sec
          if (amp > 0.01) {
            ctx.timeout(tick, 100);
          } else {
            // Stop vibration
            str.pluck(0);
            gsap.to(stringCanvas, { autoAlpha: 0, duration: 2, onComplete: () => str.destroy() });
          }
        };
        tick();
      }
      
      // 3. Play chord
      ctx.audio.playMelody([
        { note: ['A3', 'C4', 'E4', 'A4'], dur: '1n' }
      ], { instrument: 'piano', bpm: 20 }); // Slow bpm makes the note last longer
      
    }, null, 5.0);
    
    // 4. Unpin and Name appears after string stops vibrating (approx 6 seconds later)
    tl.call(() => {
      if (alive) map.unpin('nice');
    }, null, 11.0);
    tl.to(nameLabel, { autoAlpha: 1, duration: 2 }, 11.0);
    
    return tl;
  }
});
