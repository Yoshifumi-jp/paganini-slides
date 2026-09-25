PG.slides.register({
  id: 's03',
  timeline: { from: 1780, to: 1782 },
  narration: [
    "パガニーニは1782年、イタリアの港町ジェノヴァで生まれました。",
    "5歳で父親からマンドリンを習い、7歳でヴァイオリンを始めました。"
  ],
  build(root) {
    root.innerHTML = `
      <div id="s03-map-container" style="position: absolute; inset: 0;"></div>
      <div id="s03-title" style="position: absolute; top: 130px; left: 80px; font-family: 'Yu Mincho', '游明朝', serif; font-size: 64px; color: var(--gold); opacity: 0; text-shadow: 0 0 10px rgba(0,0,0,0.8);">1782年、ジェノヴァに生まれる</div>
    `;
  },
  enter(ctx) {
    const mapContainer = ctx.root.querySelector('#s03-map-container');
    const titleEl = ctx.root.querySelector('#s03-title');
    
    const map = PG.map.create(mapContainer);
    ctx.addCleanup(() => map.destroy());
    
    // Add some subtle sea shimmer/noise (SVG overlay is already doing it slightly, we could add a slow CSS animation or just leave it)
    
    const tl = gsap.timeline();
    
    tl.add(map.drawIn(2.0), 0);
    tl.add(map.zoomTo('genoa', 3.5, 2.5), 1.0);
    tl.add(map.pin('genoa', { label: 'ジェノヴァ', sub: '1782年10月27日 誕生' }), 3.5);
    
    tl.to(titleEl, { autoAlpha: 1, x: 20, duration: 1.0, ease: "power1.out" }, 4.0);
    
    return tl;
  }
});