window.PG = window.PG || {};

PG.narration = (function() {
  const VOICE_PREFERENCE = ['Haruka', 'Nanami', 'Microsoft'];
  let selectedVoice = null;
  let enabled = true;
  let synth = window.speechSynthesis;
  let activePromise = null;
  let activeResolve = null;
  let cancelFlag = false;
  let speaking = false;

  let currentSessionId = 0;

  function loadVoices() {
    const voices = synth.getVoices();
    if (voices.length === 0) return;

    let jpVoices = voices.filter(v => v.lang.startsWith('ja'));
    if (jpVoices.length === 0) return;

    for (const pref of VOICE_PREFERENCE) {
      const match = jpVoices.find(v => v.name.includes(pref));
      if (match) {
        selectedVoice = match;
        return;
      }
    }
    selectedVoice = jpVoices[0];
  }

  function init() {
    if (!synth) return;
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function speakLines(lines) {
    cancel();
    currentSessionId++;
    const sessionId = currentSessionId;
    speaking = true;

    activePromise = new Promise(async (resolve) => {
      activeResolve = resolve;

      if (!enabled || !synth || !selectedVoice || PG.engine.isTestMode()) {
        // 音声なしモード
        for (const line of lines) {
          if (sessionId !== currentSessionId) return resolve();
          showSubtitle(line);
          const duration = line.length * 130 + 800; // 文字数 × 0.13秒 + 0.8秒
          await wait(duration);
        }
        if (sessionId === currentSessionId) {
          hideSubtitle();
          speaking = false;
        }
        resolve();
        return;
      }

      if (PG.audio) PG.audio.duck(true);

      for (const line of lines) {
        if (sessionId !== currentSessionId) return resolve();
        showSubtitle(line);

        await new Promise(res => {
          const u = new SpeechSynthesisUtterance(line);
          u.voice = selectedVoice;
          u.rate = 1.0;
          u.onend = res;
          u.onerror = res;
          
          if (sessionId !== currentSessionId) {
            res();
          } else {
            synth.speak(u);
          }
        });
      }

      if (sessionId === currentSessionId) {
        hideSubtitle();
        if (PG.audio) PG.audio.duck(false);
        speaking = false;
      }
      resolve();
    });

    return activePromise;
  }

  function cancel() {
    currentSessionId++;
    if (synth) synth.cancel();
    hideSubtitle();
    if (activeResolve) {
      activeResolve();
      activeResolve = null;
    }
    speaking = false;
    if (PG.audio) PG.audio.duck(false);
  }

  function showSubtitle(text) {
    const el = document.getElementById('subtitle');
    if (el) {
      let filteredText = text.replace(/。$/g, '').replace(/。/g, '　');
      el.textContent = filteredText;
      el.style.opacity = 1;
    }
  }

  function hideSubtitle() {
    const el = document.getElementById('subtitle');
    if (el) {
      el.style.opacity = 0;
    }
  }

  return {
    init,
    speakLines,
    cancel,
    setEnabled: (val) => enabled = val,
    isEnabled: () => enabled,
    isSpeaking: () => speaking
  };
})();

