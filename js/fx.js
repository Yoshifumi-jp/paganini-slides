window.PG = window.PG || {};

PG.fx = (function() {
  function createString(canvas, options = {}) {
    const y = options.y || 540;
    const color = options.color || '#d4a64a';
    const ctx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;
    
    let reqId;
    let progress = 0;
    let plucks = [];
    
    function loop() {
      ctx.clearRect(0, 0, 1920, 1080);
      
      if (progress > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        const centerX = 1920 / 2;
        const width = 1920 * 0.8 * progress; // 画面幅の80%まで伸びる
        const startX = centerX - width / 2;
        const endX = centerX + width / 2;
        
        let glow = 0;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += 10) {
          let dy = 0;
          plucks.forEach(p => {
            const dist = Math.abs(x - p.x);
            // 距離による減衰と定在波
            if (dist < 800) {
              const envelope = Math.max(0, 1 - dist / 800);
              dy += Math.sin(x * 0.02 + p.phase) * p.amp * envelope * 50;
              if (x === startX) glow += p.amp; // Accumulate only once per pluck to avoid multiplying glow by number of segments
            }
          });
          if (x === startX) ctx.moveTo(x, y + dy);
          else ctx.lineTo(x, y + dy);
        }
        
        if (glow > 0) {
          ctx.lineWidth = 2 + Math.min(glow * 3, 6);
          ctx.shadowBlur = 20 + Math.min(glow * 40, 60);
        }
        
        ctx.stroke();
        ctx.restore();
      }
      
      // plucksの更新
      for (let i = plucks.length - 1; i >= 0; i--) {
        const p = plucks[i];
        p.phase += 0.5;
        p.amp *= 0.95; // 減衰
        if (p.amp < 0.01) {
          plucks.splice(i, 1);
        }
      }
      
      reqId = requestAnimationFrame(loop);
    }
    
    reqId = requestAnimationFrame(loop);
    
    return {
      draw: (p) => progress = p,
      pluck: (amp, x) => {
        plucks.push({ amp, x, phase: 0 });
      },
      destroy: () => {
        cancelAnimationFrame(reqId);
      }
    };
  }

  function createEmbers(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;
    let reqId;
    let particles = [];
    let isRunning = false;
    // rate is particles per second
    let rate = options.rate || 60; 
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MAX_PARTICLES = reduced ? 60 : 250;
    
    // オフスクリーンキャンバスで火の粉の画像を作成
    const emberImg = document.createElement('canvas');
    emberImg.width = 32;
    emberImg.height = 32;
    const eCtx = emberImg.getContext('2d');
    const grad = eCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(200, 52, 43, 0.8)'); // --ember
    grad.addColorStop(1, 'rgba(200, 52, 43, 0)');
    eCtx.fillStyle = grad;
    eCtx.fillRect(0, 0, 32, 32);

    let lastTime = performance.now();
    let spawnAccumulator = 0;
    
    function loop(time) {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // max 100ms
      lastTime = time;
      
      ctx.clearRect(0, 0, 1920, 1080);
      
      if (isRunning) {
        spawnAccumulator += rate * dt;
        while (spawnAccumulator >= 1) {
          spawn(1920/2 + (Math.random() - 0.5) * 800, 540);
          spawnAccumulator -= 1;
        }
      }
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += Math.sin(p.angle) * 120 * dt;
        p.y -= p.speed * 60 * dt;
        p.life -= p.decay * 60 * dt;
        p.angle += (Math.random() - 0.5) * 6 * dt;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.globalAlpha = Math.min(1, p.life * 2);
          const size = p.size * 10; // emberImg is 32x32, adjust scale
          ctx.drawImage(emberImg, p.x - size/2, p.y - size/2, size, size);
        }
      }
      ctx.restore();
      
      reqId = requestAnimationFrame(loop);
    }
    
    function spawn(x, y) {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 20,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 2 + 1,
        life: 1,
        decay: Math.random() * 0.01 + 0.005,
        angle: Math.random() * Math.PI * 2
      });
    }
    
    reqId = requestAnimationFrame(loop);
    
    return {
      start: () => isRunning = true,
      stop: () => isRunning = false,
      burst: (x, y, n) => {
        for (let i = 0; i < n; i++) spawn(x, y);
      },
      destroy: () => {
        cancelAnimationFrame(reqId);
      }
    };
  }

  return {
    createString,
    createEmbers
  };
})();

