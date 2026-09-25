PG.slides.register({
  id: 's14',
  manualNarration: true,
  build(root) {
    root.innerHTML = `
      <!-- Background for credits -->
      <canvas id="s14-bg" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none; opacity: 0;"></canvas>
      
      <!-- Quiz Area -->
      <div id="s14-quiz-area" style="position: absolute; inset: 0;">
        <div id="s14-title" style="position: absolute; top: 130px; left: 0; right: 0; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 64px; color: var(--gold);">まとめクイズ</div>
        <div id="s14-q" style="position: absolute; top: 250px; left: 0; right: 0; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 56px; color: var(--ink); opacity: 0;"></div>
        <div id="s14-choices" style="position: absolute; top: 480px; left: 0; right: 0; display: flex; justify-content: center; gap: 40px;"></div>
        <div id="s14-note" style="position: absolute; top: 660px; left: 0; right: 0; text-align: center; font-family: sans-serif; font-size: 28px; color: var(--muted); opacity: 0;"></div>
        <div id="s14-score" style="position: absolute; top: 400px; left: 0; right: 0; text-align: center; font-family: 'Yu Mincho', '游明朝', serif; font-size: 72px; color: var(--gold); opacity: 0;"></div>
      </div>
      
      <!-- Confetti Canvas -->
      <canvas id="s14-confetti" width="1920" height="1080" style="position: absolute; inset: 0; pointer-events: none;" data-no-advance="true"></canvas>

      <!-- Credits Area -->
      <div id="s14-credits-area" style="position: absolute; inset: 0; overflow: hidden; opacity: 0; pointer-events: none;">
        <div id="s14-credits-scroll" style="position: absolute; top: 1080px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 80px; padding-bottom: 540px;">
          <!-- Credits content injected here -->
        </div>
        <div id="s14-final-name" style="position: absolute; top: 500px; left: 0; right: 0; text-align: center; font-family: 'Yu Mincho', serif; font-size: 64px; color: var(--gold); text-shadow: 0 0 20px rgba(212,166,74,0.5); opacity: 0;">ニコロ・パガニーニ<br><span style="font-size: 40px;">（1782–1840）</span></div>
      </div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);
    
    const root = ctx.root;
    const qEl = root.querySelector('#s14-q');
    const choicesEl = root.querySelector('#s14-choices');
    const noteEl = root.querySelector('#s14-note');
    const scoreEl = root.querySelector('#s14-score');
    const quizArea = root.querySelector('#s14-quiz-area');
    const creditsArea = root.querySelector('#s14-credits-area');
    const scrollEl = root.querySelector('#s14-credits-scroll');
    const confettiCanvas = root.querySelector('#s14-confetti');
    
    // Confetti engine
    const cctx = confettiCanvas.getContext('2d');
    let confettis = [];
    let confettiReq;
    const colors = ['#d4a64a', '#c8342b', '#f5e6cc'];
    function spawnConfetti(amount) {
      for(let i=0; i<amount; i++) {
        confettis.push({
          x: Math.random() * 1920,
          y: -10 - Math.random() * 200,
          w: Math.random() * 15 + 10,
          h: Math.random() * 10 + 5,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 5 + 5,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    function drawConfetti() {
      if (!alive) return;
      cctx.clearRect(0, 0, 1920, 1080);
      for(let i = confettis.length - 1; i >= 0; i--) {
        const c = confettis[i];
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vrot;
        cctx.save();
        cctx.translate(c.x, c.y);
        cctx.rotate(c.rot);
        cctx.fillStyle = c.color;
        cctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
        cctx.restore();
        if (c.y > 1100) confettis.splice(i, 1);
      }
      confettiReq = requestAnimationFrame(drawConfetti);
    }
    drawConfetti();
    ctx.addCleanup(() => cancelAnimationFrame(confettiReq));
    
    // Build Credits
    let creditsHtml = '';
    if (PG.credits) {
      PG.credits.forEach(c => {
        creditsHtml += `<div style="text-align: center;">`;
        creditsHtml += `<div style="font-family: 'Yu Mincho', serif; font-size: 32px; color: var(--gold); margin-bottom: 20px;">${c.head}</div>`;
        c.items.forEach(item => {
          creditsHtml += `<div style="max-width: 1500px; margin: 0 auto; font-family: sans-serif; font-size: 26px; color: #f5e6cc; margin-bottom: 10px; line-height: 1.5;">${item}</div>`;
        });
        creditsHtml += `</div>`;
      });
    }
    scrollEl.innerHTML = creditsHtml;
    
    let score = 0;
    
    const tl = gsap.timeline();
    
    // Key blocker for RightArrow during unanswered question
    let answering = false;
    let nextCallback = null;
    const keyHandler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        if (answering) {
          e.stopPropagation();
          e.preventDefault();
        } else if (nextCallback) {
          nextCallback();
          nextCallback = null;
        }
      }
    };
    document.addEventListener('keydown', keyHandler, true);
    ctx.addCleanup(() => document.removeEventListener('keydown', keyHandler, true));
    
    const runQuiz = async () => {
      await ctx.speak(["最後にクイズです。今日の内容から3問出します。"]);
      if (!alive) return;
      
      if (!PG.quiz) {
        console.error("PG.quiz is missing!");
        return;
      }

      for (let i = 0; i < PG.quiz.length; i++) {
        if (!alive) return;
        const q = PG.quiz[i];
        
        qEl.textContent = q.q;
        noteEl.textContent = q.note;
        choicesEl.innerHTML = '';
        gsap.to(qEl, { autoAlpha: 1, duration: 0.5 });
        gsap.set(choicesEl, { autoAlpha: 1 });
        gsap.set(noteEl, { autoAlpha: 0 });
        
        let resolveQuestion;
        const qPromise = new Promise(r => resolveQuestion = r);
        
        answering = true;
        let answered = false;
        let timeoutTimer = null;
        
        const checkAnswer = (idx, isAuto = false) => {
          if (answered || !alive) return;
          answered = true;
          answering = false;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          
          const btns = Array.from(choicesEl.children);
          const correct = idx === q.answer;
          
          if (correct && !isAuto) {
            score++;
            gsap.to(btns[idx], { borderColor: '#d4a64a', backgroundColor: 'rgba(212,166,74,0.3)', color: '#d4a64a', boxShadow: '0 0 20px rgba(212,166,74,0.6)' });
            spawnConfetti(60);
            if (PG.audio && PG.audio.sfx) {
              PG.audio.sfx.shimmer('E6');
              setTimeout(() => PG.audio.sfx.shimmer('B6'), 150);
            }
          } else {
            if (!isAuto && PG.audio && PG.audio.sfx) PG.audio.sfx.whoosh(0.4);
            if (!isAuto) {
              gsap.to(btns[idx], { x: -10, yoyo: true, repeat: 5, duration: 0.05, borderColor: '#555', color: '#777' });
            }
            gsap.to(btns[q.answer], { borderColor: '#d4a64a', backgroundColor: 'rgba(212,166,74,0.3)', color: '#d4a64a' });
          }
          
          gsap.to(noteEl, { autoAlpha: 1, duration: 0.5, delay: 0.5 });
          
          let waitTime = isAuto ? 1000 : 2500;
          let waitT = setTimeout(() => {
            if (alive) resolveQuestion();
          }, waitTime);
          
          nextCallback = () => {
            clearTimeout(waitT);
            resolveQuestion();
          };
        };
        
        q.choices.forEach((cText, cIdx) => {
          const btn = document.createElement('div');
          btn.textContent = cText;
          btn.style.cssText = `width: 500px; height: 120px; border: 1px solid var(--gold); border-radius: 12px; display: flex; justify-content: center; align-items: center; font-family: 'Yu Gothic UI', 'Meiryo', sans-serif; font-size: ${cText.length > 8 ? '34px' : '40px'}; color: var(--ink); cursor: pointer; background: #1a1a1a; transition: background 0.2s; white-space: nowrap;`;
          btn.setAttribute('data-no-advance', 'true');
          ctx.on(btn, 'click', () => checkAnswer(cIdx));
          choicesEl.appendChild(btn);
          gsap.fromTo(btn, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.2 + cIdx * 0.1, ease: 'back.out' });
        });
        
        const ansKeyHandler = (e) => {
          if (!answering || answered) return;
          if (e.key === '1') checkAnswer(0);
          if (e.key === '2') checkAnswer(1);
          if (e.key === '3') checkAnswer(2);
        };
        ctx.on(document, 'keydown', ansKeyHandler);
        
        ctx.speak([q.speak]).then(() => {
          if (!alive) return;
          // In PG.engine, isAutoPlay is usually a property or method, let's assume property or global PG.engine.autoPlay
          const autoPlay = PG.engine.isAutoPlay && PG.engine.isAutoPlay();
          if (PG.engine.isTestMode() || autoPlay) {
            timeoutTimer = setTimeout(() => {
              checkAnswer(q.answer, true); // Auto resolve
            }, 8000);
          }
        });
        
        await qPromise;
        // Event listener managed by ctx.on
        
        gsap.to([qEl, choicesEl, noteEl], { autoAlpha: 0, duration: 0.3 });
        await new Promise(r => setTimeout(r, 400));
      }
      
      if (!alive) return;
      
      // Score
      scoreEl.textContent = `3問中 ${score}問 正解！`;
      gsap.to(scoreEl, { autoAlpha: 1, scale: 1.2, duration: 1, ease: 'elastic.out' });
      if (score === 3) spawnConfetti(200);
      
      await new Promise(r => setTimeout(r, 1500));
      if (!alive) return;
      
      gsap.to(quizArea, { autoAlpha: 0, duration: 1 });
      
      // Credits Roll
      const bg = root.querySelector('#s14-bg');
      if (PG.fx && PG.fx.createEmbers) {
        const embers = PG.fx.createEmbers(bg);
        ctx.addCleanup(() => embers.destroy());
      }
      gsap.to(bg, { autoAlpha: 0.5, duration: 2 });
      gsap.to(creditsArea, { autoAlpha: 1, duration: 1 });
      
      const scrollHeight = scrollEl.offsetHeight;
      const dist = scrollHeight; 
      
      gsap.to(scrollEl, {
        y: -dist - 540,
        duration: 30,
        ease: 'none',
        onComplete: () => {
          if (!alive) return;
          const finalName = root.querySelector('#s14-final-name');
          gsap.to(finalName, { 
            autoAlpha: 1, 
            duration: 2, 
            onComplete: () => {
               if (alive) ctx.markNarrationDone();
            } 
          });
        }
      });
    };
    
    tl.call(() => runQuiz());
    
    return tl;
  }
});