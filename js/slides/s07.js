PG.slides.register({
  id: 's07',
  manualNarration: true,
  build(root) {
    root.innerHTML = `
      <canvas id="s07-smoke" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none; opacity: 0.3;"></canvas>
      
      <div id="s07-title" style="position: absolute; top: 120px; left: 0; right: 0; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 64px; color: var(--gold);">「悪魔に魂を売った？」うわさの正体</div>
      
      <div id="s07-cards" style="position: absolute; top: 350px; left: 0; right: 0; display: flex; justify-content: center; gap: 80px; perspective: 1200px;">
        <!-- Card 1 -->
        <div class="s07-card-container" data-no-advance="true" style="width: 460px; height: 320px; cursor: pointer;">
          <div class="s07-card" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d;">
            <!-- Front -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #111; border: 2px solid var(--ember); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(200,52,43,0.3);">
              <div style="color: var(--ember); font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">うわさ</div>
              <div style="color: #eee; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif;">悪魔と契約した</div>
            </div>
            <!-- Back -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #d4a64a; border: 2px solid #fff; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: rotationY(180deg); box-shadow: 0 10px 30px rgba(212,166,74,0.3);">
              <div style="color: #333; font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">本当は</div>
              <div style="color: #111; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif; font-weight: bold;">毎日の練習と研究</div>
            </div>
          </div>
        </div>
        
        <!-- Card 2 -->
        <div class="s07-card-container" data-no-advance="true" style="width: 460px; height: 320px; cursor: pointer;">
          <div class="s07-card" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d;">
            <!-- Front -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #111; border: 2px solid var(--ember); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(200,52,43,0.3);">
              <div style="color: var(--ember); font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">うわさ</div>
              <div style="color: #eee; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif;">人間離れした演奏</div>
            </div>
            <!-- Back -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #d4a64a; border: 2px solid #fff; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: rotationY(180deg); box-shadow: 0 10px 30px rgba(212,166,74,0.3);">
              <div style="color: #333; font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">本当は</div>
              <div style="color: #111; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif; font-weight: bold;">技を徹底的にみがいた</div>
            </div>
          </div>
        </div>
        
        <!-- Card 3 -->
        <div class="s07-card-container" data-no-advance="true" style="width: 460px; height: 320px; cursor: pointer;">
          <div class="s07-card" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d;">
            <!-- Front -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #111; border: 2px solid var(--ember); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(200,52,43,0.3);">
              <div style="color: var(--ember); font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">うわさ</div>
              <div style="color: #eee; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif;">青白くやせた姿</div>
            </div>
            <!-- Back -->
            <div class="s07-face" style="position: absolute; inset: 0; backface-visibility: hidden; background: #d4a64a; border: 2px solid #fff; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: rotationY(180deg); box-shadow: 0 10px 30px rgba(212,166,74,0.3);">
              <div style="color: #333; font-size: 28px; margin-bottom: 20px; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif;">本当は</div>
              <div style="color: #111; font-size: 40px; font-family: 'Yu Mincho', '游明朝', serif; font-weight: bold;">うわさがさらに評判を呼んだ</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Fix backface transform for Webkit
    const backs = root.querySelectorAll('.s07-face:nth-child(2)');
    backs.forEach(b => {
      b.style.transform = 'rotateY(180deg)';
    });
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    // Smoke effect
    const canvas = ctx.root.querySelector('#s07-smoke');
    const cctx = canvas.getContext('2d');
    let reqId;
    const particles = [];
    for(let i=0; i<8; i++){
      particles.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: Math.random() * 300 + 200,
        a: Math.random() * 0.5 + 0.1
      });
    }
    
    function drawSmoke() {
      if (!alive) return;
      cctx.clearRect(0, 0, 1920, 1080);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -p.r) p.x = 1920 + p.r;
        if (p.x > 1920 + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = 1080 + p.r;
        if (p.y > 1080 + p.r) p.y = -p.r;
        
        const grad = cctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `rgba(200, 52, 43, ${p.a})`);
        grad.addColorStop(1, 'rgba(200, 52, 43, 0)');
        cctx.fillStyle = grad;
        cctx.beginPath();
        cctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        cctx.fill();
      });
      reqId = requestAnimationFrame(drawSmoke);
    }
    drawSmoke();
    ctx.addCleanup(() => cancelAnimationFrame(reqId));
    
    const lines = [
      "青白くやせた顔に、乱れた黒髪。人間離れした演奏。",
      "人々は「悪魔と契約したにちがいない」とうわさしました。",
      "でも本当は、毎日の練習と研究の成果です。うわさは、かえって人気を高めることにもなったと言われています。"
    ];
    
    const cardsContainer = ctx.root.querySelectorAll('.s07-card-container');
    const cards = Array.from(ctx.root.querySelectorAll('.s07-card'));
    
    // Initial states
    gsap.set(cardsContainer, { autoAlpha: 0, z: -500, rotationX: 10 });
    cards.forEach(c => c.isFlipped = false);
    

    
    // Animation & Sequence
    const tl = gsap.timeline();
    
    tl.to(cardsContainer, {
      autoAlpha: 1,
      z: 0,
      rotationX: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power2.out",
      onStart: () => {
        if (PG.audio.sfx) {
          PG.audio.sfx.whoosh(1.5);
          PG.audio.sfx.eerie(3);
        }
      }
    }, 0.5);
    
    tl.call(() => {
      ctx.speak([lines[0], lines[1]]).then(() => {
        if (!alive) return;
        
        // Flip cards
        cards.forEach((c, i) => {
          ctx.timeout(() => {
            if (!alive) return;
            const notes = ['E6', 'G#6', 'B6'];
            if (PG.audio.sfx) {
              PG.audio.sfx.whoosh(0.6);
              PG.audio.sfx.shimmer(notes[i]);
            }
          }, i * 200);
        });
        ctx.timeout(() => {
          if (alive && PG.audio.sfx) PG.audio.sfx.resolve(4);
        }, cards.length * 200 + 400);
        
        gsap.to(cards, {
          rotationY: 180,
          duration: 1.0,
          stagger: 0.2,
          ease: "back.out(1.2)",
          onStart: function() {
            const target = this.targets()[0];
            target.isFlipped = true;
          }
        });
        
        ctx.timeout(() => {
          if (!alive) return;
          ctx.speak([lines[2]]).then(() => {
            if (!alive) return;
            ctx.markNarrationDone();
          });
        }, 1500);
      });
    }, null, "+=0.5");
    
    // Click interaction
    cardsContainer.forEach((container, i) => {
      const card = cards[i];
      ctx.on(container, 'click', () => {
        card.isFlipped = !card.isFlipped;
        gsap.to(card, {
          rotationY: card.isFlipped ? 180 : 0,
          duration: 0.6,
          ease: "back.out(1.5)"
        });
        if (PG.audio.sfx) {
          PG.audio.sfx.whoosh(0.5);
          PG.audio.sfx.shimmer(card.isFlipped ? 'E6' : 'C6');
        }
      });
    });
    
    return tl;
  }
});