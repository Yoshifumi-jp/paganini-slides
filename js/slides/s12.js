PG.slides.register({
  id: 's12',
  narration: [
    "パガニーニの影響は、クラシック音楽だけにとどまりません。",
    "エレキギターの速弾きで知られるロックギタリストたちも、カプリース第24番を演奏に取り入れています。",
    "「すごい技を持つ演奏家がスターになる」という文化は、パガニーニから始まったとも言われます。"
  ],
  build(root) {
    let audienceHtml = '';
    for (let i = 0; i < 40; i++) {
      const x = 50 + Math.random() * 1820;
      const y = 825 + Math.random() * 20; // Within 820-850
      const delay = Math.random() * -2;
      const dur = 1.5 + Math.random();
      audienceHtml += `<circle class="s12-phone" cx="${x}" cy="${y}" r="4" fill="#ffffff" style="opacity: 0.8; filter: drop-shadow(0 0 4px #ffffff); animation: s12-sway ${dur}s ease-in-out ${delay}s infinite alternate;" />`;
    }

    root.innerHTML = `
      <style>
        @keyframes s12-sway {
          0% { transform: translate(-15px, 0); }
          100% { transform: translate(15px, 0); }
        }
      </style>
      <div class="title" style="position: absolute; top: 80px; width: 100%; text-align: center; color: var(--gold); z-index: 10; pointer-events: none;">影響③ 現代へ</div>
      
      <!-- Stage -->
      <svg width="1920" height="1080" style="position: absolute; inset: 0;">
        <defs>
          <linearGradient id="s12-spot-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
          </linearGradient>
          <filter id="spot-blur">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>
        
        <!-- Spotlights -->
        <g id="s12-spots" opacity="0">
          <polygon id="s12-spot-1" points="500,-50 100,1080 1100,1080" fill="url(#s12-spot-grad)" filter="url(#spot-blur)" style="mix-blend-mode: screen; transform-origin: 500px -50px;" />
          <polygon id="s12-spot-2" points="1420,-50 820,1080 1820,1080" fill="url(#s12-spot-grad)" filter="url(#spot-blur)" style="mix-blend-mode: screen; transform-origin: 1420px -50px;" />
        </g>

        <!-- Scaled instrument group -->
        <g id="s12-instrument" transform="scale(0.85)" transform-origin="960px 490px">
          <!-- Guitar target shape hidden -->
          <path id="s12-guitar" d="M960,250 L940,260 L940,300 L945,300 L945,450 C900,450 840,480 810,540 C850,550 880,560 860,600 C800,650 820,730 960,730 C1100,730 1120,650 1060,600 C1040,560 1070,550 1110,540 C1080,480 1020,450 975,450 L975,300 L980,300 L980,260 Z" style="visibility: hidden;" />
          
          <!-- Initial Violin -->
          <path id="s12-shape" d="M960,250 C910,250 860,300 890,400 C900,430 930,450 930,480 C930,510 880,550 880,650 C880,730 960,730 1010,730 C1060,730 1140,730 1140,650 C1140,550 1090,510 1090,480 C1090,450 1120,430 1130,400 C1160,300 1110,250 1060,250 Z" style="fill: #141210; stroke: var(--gold); stroke-width: 4px; filter: drop-shadow(0 0 15px var(--gold));" />
          
          <!-- Guitar details (faded in) -->
          <g id="s12-guitar-details" opacity="0">
            <!-- Pegs -->
            <line x1="940" y1="260" x2="920" y2="260" stroke="var(--gold)" stroke-width="4" />
            <line x1="940" y1="280" x2="920" y2="280" stroke="var(--gold)" stroke-width="4" />
            <line x1="940" y1="300" x2="920" y2="300" stroke="var(--gold)" stroke-width="4" />
            <line x1="980" y1="260" x2="1000" y2="260" stroke="var(--gold)" stroke-width="4" />
            <line x1="980" y1="280" x2="1000" y2="280" stroke="var(--gold)" stroke-width="4" />
            <line x1="980" y1="300" x2="1000" y2="300" stroke="var(--gold)" stroke-width="4" />
            <!-- Pickups -->
            <rect x="930" y="550" width="60" height="15" rx="4" fill="none" stroke="var(--gold)" stroke-width="2" />
            <rect x="930" y="580" width="60" height="15" rx="4" fill="none" stroke="var(--gold)" stroke-width="2" />
            <!-- Bridge -->
            <rect x="920" y="620" width="80" height="20" fill="none" stroke="var(--gold)" stroke-width="4" />
          </g>
        </g>

        <!-- Audience -->
        <g id="s12-audience" opacity="0">
          <path d="M0,820 Q100,810 200,825 T400,820 T600,830 T800,815 T1000,825 T1200,810 T1400,820 T1600,815 T1800,825 T1920,820 L1920,850 L0,850 Z" fill="#000000" opacity="0.9" />
          ${audienceHtml}
        </g>
      </svg>
      
      <!-- Label with semi-transparent background to prevent overlap issues -->
      <div id="s12-label" style="position: absolute; top: 760px; left: 50%; transform: translateX(-50%); text-align: center; opacity: 0; font-size: 28px; color: var(--gold); font-family: sans-serif; background: rgba(0,0,0,0.6); padding: 10px 30px; border-radius: 20px; z-index: 5;">イングヴェイ・マルムスティーンなど、多くのギタリストがカプリース第24番を演奏</div>
    `;
  },
  
  enter(ctx) {
    let alive = true;
    ctx.addCleanup(() => alive = false);

    const root = ctx.root;
    const shape = root.querySelector('#s12-shape');
    const details = root.querySelector('#s12-guitar-details');
    const spots = root.querySelector('#s12-spots');
    const spot1 = root.querySelector('#s12-spot-1');
    const spot2 = root.querySelector('#s12-spot-2');
    const audience = root.querySelector('#s12-audience');
    const label = root.querySelector('#s12-label');
    
    const tl = gsap.timeline();
    
    // Morph
    tl.to(shape, { morphSVG: "#s12-guitar", duration: 2, ease: "power2.inOut" }, 0.5);
    tl.to(details, { autoAlpha: 1, duration: 1 }, 2.0);
    tl.to(spots, { autoAlpha: 1, duration: 1 }, 1.5);
    tl.to(audience, { autoAlpha: 1, duration: 1 }, 1.5);
    tl.to(label, { autoAlpha: 1, duration: 1 }, 2.0);
    
    // Spotlights swinging
    gsap.to(spot1, { rotation: 15, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(spot2, { rotation: -15, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    
    tl.call(() => {
      if (!alive) return;
      
      let beat = 0;
      ctx.audio.playMelody(PG.melodies.caprice24ThemeA, {
        bpm: 140,
        instrument: 'guitar',
        onNote: () => {
          if (!alive) return;
          // Flash spots
          if (beat % 2 === 0) {
            gsap.fromTo(spots, { opacity: 0.3 }, { opacity: 1, duration: 0.1, ease: "power1.in" });
          }
          beat++;
        }
      });
      
    }, null, 2.5);

    return tl;
  }
});