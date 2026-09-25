window.PG = window.PG || {};

gsap.registerPlugin(SplitText, TextPlugin, CustomEase, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin);

PG.slides = {
  defs: [],
  register(def) {
    this.defs.push(def);
  }
};

PG.engine = (function() {
  let currentIndex = -1;
  let currentTl = null;
  let isAnimating = false;
  let isStarted = false;
  let autoPlay = false;
  
  let cleanupFuncs = [];
  let eventListeners = [];
  let timeouts = [];
  
  let visitId = 0;
  let tlDone = false;
  let narrDone = false;
  let currentCtx = null;
  
  const state = {
    testMode: false
  };

  function showToast(msg) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.className = 'toast';
      document.getElementById('stage').appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = 1;
    setTimeout(() => {
      toast.style.opacity = 0;
    }, 1500);
  }

  function resize() {
    const stage = document.getElementById('stage');
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    // 中央寄せのためのオフセット計算
    const offsetX = (window.innerWidth - 1920 * scale) / 2;
    const offsetY = (window.innerHeight - 1080 * scale) / 2;
    stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  function clearCurrentContext() {
    if (currentTl) {
      currentTl.kill();
      currentTl = null;
    }
    cleanupFuncs.forEach(fn => fn());
    cleanupFuncs = [];
    eventListeners.forEach(({target, type, fn}) => {
      target.removeEventListener(type, fn);
    });
    eventListeners = [];
    timeouts.forEach(clearTimeout);
    timeouts = [];
    
    if (PG.audio) PG.audio.stopAll();
    if (PG.narration) PG.narration.cancel();
  }

  function getContext(visitIdAtCreation) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      root: null, // goToで設定
      audio: PG.audio,
      narr: PG.narration,
      fx: PG.fx,
      on: (target, type, fn) => {
        target.addEventListener(type, fn);
        eventListeners.push({target, type, fn});
      },
      timeout: (fn, ms) => {
        const t = setTimeout(fn, ms);
        timeouts.push(t);
        return t;
      },
      addCleanup: (fn) => {
        cleanupFuncs.push(fn);
      },
      reducedMotion,
      speak: (lines) => {
        if (visitId !== visitIdAtCreation) return Promise.resolve();
        return PG.narration.speakLines(lines);
      },
      markNarrationDone: () => {
        if (visitId === visitIdAtCreation) {
          narrDone = true;
          checkAutoPlay();
        }
      }
    };
  }

  function updateUI(index) {
    const defs = PG.slides.defs;
    const progress = document.getElementById('progress');
    const counter = document.getElementById('counter');
    
    if (defs.length > 0) {
      progress.style.width = `${((index + 1) / defs.length) * 100}%`;
      counter.textContent = `${index + 1} / ${defs.length}`;
      history.replaceState(null, '', `#${defs[index].id}`);
    }
  }

  async function goTo(index) {
    const defs = PG.slides.defs;
    if (index < 0 || index >= defs.length) return;
    if (isAnimating) return;
    
    isAnimating = true;
    visitId++;
    const currentVisitId = visitId;
    tlDone = false;
    
    // 退場処理
    if (currentIndex >= 0) {
      const oldDef = defs[currentIndex];
      if (oldDef.leave) oldDef.leave(currentCtx);
      clearCurrentContext();
      currentCtx = null;
      
      const oldSlide = document.querySelector(`.slide[data-id="${oldDef.id}"]`);
      if (oldSlide) {
        gsap.to(oldSlide, {
          autoAlpha: 0, 
          scale: 1.05, 
          duration: 0.6,
          onComplete: () => {
            oldSlide.style.visibility = 'hidden';
            gsap.set(oldSlide, { clearProps: 'transform,filter' });
          }
        });
      }
    }
    
    currentIndex = index;
    const newDef = defs[currentIndex];
    const newSlide = document.querySelector(`.slide[data-id="${newDef.id}"]`);
    
    narrDone = newDef.manualNarration ? false : !(newDef.narration && newDef.narration.length > 0);
    
    // rootの中身を再構築 (build)
    newSlide.innerHTML = '';
    if (newDef.build) newDef.build(newSlide);
    
    updateUI(currentIndex);
    
    const ctx = getContext(currentVisitId);
    ctx.root = newSlide;
    currentCtx = ctx;
    
    if (newDef.enter) {
      currentTl = newDef.enter(ctx);
      if (currentTl) {
        currentTl.eventCallback('onComplete', () => {
          if (visitId === currentVisitId) {
            tlDone = true;
            checkAutoPlay();
          }
        });
      }
    } else {
      tlDone = true;
    }
    
    // 入場アニメーション
    await gsap.fromTo(newSlide, 
      { autoAlpha: 0, filter: 'blur(10px)' }, 
      { autoAlpha: 1, filter: 'blur(0px)', duration: 0.6 }
    );
    
    if (newDef.timeline && PG.timeline) {
      PG.timeline.show();
      PG.timeline.setYear(newDef.timeline.from);
      PG.timeline.moveTo(newDef.timeline.to, 1.5);
    } else if (PG.timeline) {
      PG.timeline.hide();
    }
    
    isAnimating = false;

    let narrationStarted = false;
    const startNarration = () => {
      if (narrationStarted) return;
      narrationStarted = true;
      if (!newDef.manualNarration && newDef.narration && newDef.narration.length > 0) {
        const delay = newDef.narrationDelay !== undefined ? newDef.narrationDelay : 0.8;
        ctx.timeout(() => {
          PG.narration.speakLines(newDef.narration).then(() => {
            if (visitId === currentVisitId) {
              narrDone = true;
              checkAutoPlay();
            }
          });
        }, delay * 1000);
      } else {
        checkAutoPlay();
      }
    };

    if (isStarted || state.testMode) {
      startNarration();
    } else {
      // まだ始まっていない（S1のボタン待ちなど）場合は、ポーリングで開始を待つ
      const checkStart = () => {
        if (isStarted || state.testMode) {
          startNarration();
        } else {
          ctx.timeout(checkStart, 100);
        }
      };
      checkStart();
    }
    
    if (!currentTl) {
      checkAutoPlay();
    }
  }

  function checkAutoPlay() {
    if (!autoPlay) return;
    if (tlDone && narrDone) {
      if (currentCtx) {
        currentCtx.timeout(() => {
          if (autoPlay && currentIndex < PG.slides.defs.length - 1) {
            goTo(currentIndex + 1);
          }
        }, 2000);
      }
    }
  }

  function goNext() {
    if (!isStarted && !state.testMode) return;
    
    if (currentTl && currentTl.isActive()) {
      currentTl.progress(1);
      return;
    }
    if (currentIndex < PG.slides.defs.length - 1) {
      goTo(currentIndex + 1);
    }
  }

  function goPrev() {
    if (!isStarted && !state.testMode) return;
    
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }

  function setupInput() {
    window.addEventListener('resize', resize);
    
    document.addEventListener('keydown', (e) => {
      // 操作ヘルプ切替
      if (e.key === '?') {
        const help = document.getElementById('help');
        help.classList.toggle('show');
        return;
      }
      
      // F: 全画面
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else {
          document.exitFullscreen();
        }
        return;
      }

      if (!isStarted && !state.testMode) return;

      switch(e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          goNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          goPrev();
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(PG.slides.defs.length - 1);
          break;
        case 'n':
        case 'N':
          const nState = !PG.narration.isEnabled();
          PG.narration.setEnabled(nState);
          showToast(`ナレーション ${nState ? 'ON' : 'OFF'}`);
          break;
        case 'm':
        case 'M':
          const mState = !PG.audio.isMuted();
          PG.audio.setMuted(mState);
          showToast(`ミュート ${mState ? 'ON' : 'OFF'}`);
          break;
        case 'a':
        case 'A':
          autoPlay = !autoPlay;
          showToast(`自動再生 ${autoPlay ? 'ON' : 'OFF'}`);
          if (autoPlay) checkAutoPlay();
          break;
      }
    });

    document.getElementById('stage').addEventListener('click', (e) => {
      if (!isStarted && !state.testMode) return;
      // ボタンなどの上のクリックは除外
      if (e.target.closest('button, a, input, [data-no-advance]')) return;
      goNext();
    });
  }

  function start() {
    resize();
    setupInput();

    const slidesContainer = document.getElementById('slides');
    PG.slides.defs.forEach(def => {
      const section = document.createElement('section');
      section.className = 'slide';
      section.dataset.id = def.id;
      slidesContainer.appendChild(section);
    });

    const urlParams = new URLSearchParams(window.location.search);
    state.testMode = urlParams.get('test') === '1';

    let startIndex = 0;
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      const idx = PG.slides.defs.findIndex(d => d.id === hashId);
      if (idx >= 0) startIndex = idx;
    }

    if (state.testMode) {
      PG.narration.setEnabled(false);
      PG.audio.setMuted(true);
      isStarted = true;
      goTo(startIndex);
    } else {
      // testModeでない場合はs01を開き、「はじめる」を待つ
      // ?test=1以外でもハッシュ指定があればそこを開くべきだが、開始ボタンはS1にあるので
      // いったん goTo してイベント待ちになる。
      goTo(startIndex);
    }

    window.PG.debug = {
      goTo,
      current: () => currentIndex,
      count: () => PG.slides.defs.length,
      isAnimating: () => isAnimating
    };
  }

  return {
    start,
    setStarted: (val) => isStarted = val,
    isStarted: () => isStarted,
    isTestMode: () => state.testMode,
    isAutoPlay: () => autoPlay
  };
})();
