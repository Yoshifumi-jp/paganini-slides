window.PG = window.PG || {};

PG.audio = (function() {
  let isInitialized = false;
  let muted = false;
  
  let musicBus;
  let reverb;
  let limiter;
  let vibrato;
  let synth;
  let synthPizz;
  let synthHarm;
  let synthBell;
  let synthPiano;
  let synthGuitar;
  let parts = [];
  let sfxReverb, eeriePad, eerieMembrane, eerieTremolo, whooshNoise, whooshFilter, whooshEnv, whooshVol, shimmerSynth, resolvePad;
 
  

  const sfx = {
    eerie(sec = 3) {
      if (!isInitialized || muted || PG.engine.isTestMode()) return;
      const t = Tone.now();
      eeriePad.triggerAttackRelease(['C3','F#3','B3','F4'], sec, t);
      eerieMembrane.triggerAttackRelease('C1', '8n', t);
    },
    whoosh(sec = 1.2) {
      if (!isInitialized || muted || PG.engine.isTestMode()) return;
      const t = Tone.now();
      whooshEnv.attack = Math.min(sec * 0.25, 0.3);
      whooshEnv.decay = sec * 0.75;
      whooshEnv.triggerAttack(t);
      whooshFilter.frequency.setValueAtTime(300, t);
      whooshFilter.frequency.exponentialRampToValueAtTime(3000, t + sec);
    },
    shimmer(note = 'E6') {
      if (!isInitialized || muted || PG.engine.isTestMode()) return;
      const t = Tone.now();
      shimmerSynth.triggerAttackRelease(note, 2.5, t);
      shimmerSynth.triggerAttackRelease(Tone.Frequency(note).transpose(12).toNote(), 2.5, t + 0.06);
    },
    resolve(sec = 4) {
      if (!isInitialized || muted || PG.engine.isTestMode()) return;
      const t = Tone.now();
      resolvePad.triggerAttackRelease(['A2','E3','A3','C#4','E4'], sec, t, 0.5);
      sfx.shimmer('A5');
    },
    stopAll() {
      if (!isInitialized) return;
      const t = Tone.now() + 0.3;
      if (eeriePad) eeriePad.releaseAll(t);
      if (resolvePad) resolvePad.releaseAll(t);
      if (shimmerSynth) shimmerSynth.releaseAll(t);
      if (whooshEnv) whooshEnv.triggerRelease(t);
    }
  };

  // ducking
  let duckTarget = 0;
  const buffers = {};
  let activePlayers = [];

  async function decodeRecording(key, base64Src) {
    try {
      const b64 = base64Src.split(',')[1];
      const binary = atob(b64);
      const array = new Uint8Array(binary.length);
      for(let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const audioBuffer = await Tone.context.decodeAudioData(array.buffer);
      buffers[key] = new Tone.ToneAudioBuffer(audioBuffer);
    } catch(e) {
      console.error('Failed to decode', key, e);
    }
  }

  async function init() {
    if (isInitialized) return;
    await Tone.start();
    
    musicBus = new Tone.Volume(0);
    reverb = new Tone.Reverb({
      decay: 3.5,
      preDelay: 0.01,
      wet: 0.25
    });
    limiter = new Tone.Limiter(-2);
    
    musicBus.chain(reverb, limiter, Tone.Destination);
    await reverb.generate();
    
    vibrato = new Tone.Vibrato({
      frequency: 5.5,
      depth: 0.1
    }).connect(musicBus);
    
    synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 0.5,
      modulationIndex: 1.5,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.5 }
    }).connect(vibrato);

    synthPizz = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.1 }
    }).connect(musicBus);

    synthHarm = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.5, release: 0.5 }
    }).connect(vibrato);

    synthBell = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 5,
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 2, sustain: 0.2, release: 2 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.01, decay: 2, sustain: 0, release: 2 }
    }).connect(musicBus);

    synthPiano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.8, sustain: 0.1, release: 1.2 }
    }).connect(musicBus);

    synthGuitar = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 }
    });
    const dist = new Tone.Distortion(0.7).connect(musicBus);
    synthGuitar.connect(dist);

    
    // --- SFX Initialization ---
    sfxReverb = new Tone.Reverb({ decay: 5, wet: 0.45 }).connect(musicBus);
    
    eerieTremolo = new Tone.Tremolo(12, 0.6).start().connect(sfxReverb);
    eeriePad = new Tone.PolySynth(Tone.Synth, { volume: -10,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
      envelope: { attack: 0.8, decay: 0.1, sustain: 1, release: 2 }
    });
    const eerieFilter = new Tone.Filter(900, 'lowpass');
    eeriePad.connect(eerieFilter);
    eerieFilter.connect(eerieTremolo);

    eerieMembrane = new Tone.MembraneSynth({ volume: -8 }).connect(sfxReverb);

    whooshVol = new Tone.Volume(4).connect(sfxReverb);
    whooshFilter = new Tone.Filter({ type: 'bandpass', Q: 1.5 }).connect(whooshVol);
    whooshEnv = new Tone.AmplitudeEnvelope({ attack: 0.3, decay: 0.8, sustain: 0, release: 0.1 }).connect(whooshFilter);
    whooshNoise = new Tone.Noise('pink').connect(whooshEnv);
    whooshNoise.start();

    shimmerSynth = new Tone.PolySynth(Tone.FMSynth, {
      volume: -7,
      harmonicity: 3.01,
      modulationIndex: 12,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 2.5, sustain: 0, release: 0.1 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 2.5, sustain: 0, release: 0.1 }
    }).connect(sfxReverb);

    resolvePad = new Tone.PolySynth(Tone.Synth, { volume: -16,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
      envelope: { attack: 1.2, decay: 0.1, sustain: 1, release: 4 }
    });
    const resolveFilter = new Tone.Filter(900, 'lowpass').connect(sfxReverb);
    resolvePad.connect(resolveFilter);

    await sfxReverb.generate();

    isInitialized = true;

    // Decode audio recordings asynchronously
    if (PG.recordings) {
      for (const [key, rec] of Object.entries(PG.recordings)) {
        if (rec.src) decodeRecording(key, rec.src);
      }
    }
  }

  function playMelody(notes, options = {}) {
    let { bpm = PG.melodies ? PG.melodies.DEFAULT_BPM : 120, instrument = 'violin', onNote } = options;
    
    let resolveDone;
    const donePromise = new Promise(r => resolveDone = r);

    if (!isInitialized || muted || PG.engine.isTestMode()) {
      resolveDone();
      return { stop: () => {}, done: donePromise };
    }

        if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    
    let timeAcc = 0;
    const events = [];
    
    notes.forEach((n, idx) => {
      events.push({
        time: timeAcc,
        noteObj: n,
        duration: durToSec(n.dur, bpm),
        index: idx
      });
      timeAcc += durToSec(n.dur, bpm);
    });
    
    const startAt = Tone.Transport.seconds + 0.1;
    const part = new Tone.Part((time, event) => {
      const nObj = event.noteObj;
      const noteArray = Array.isArray(nObj.note) ? nObj.note : [nObj.note];
      
      let activeSynth = synth; // arco default
      if (instrument === 'bell') activeSynth = synthBell;
      else if (instrument === 'piano') activeSynth = synthPiano;
      else if (instrument === 'guitar') activeSynth = synthGuitar;
      else if (nObj.tech === 'pizz') activeSynth = synthPizz;
      else if (nObj.tech === 'harm') activeSynth = synthHarm;

      if (noteArray[0] !== 'R') {
        activeSynth.triggerAttackRelease(noteArray, event.duration, time);
      }
      if (onNote) {
        Tone.Draw.schedule(() => {
          onNote(event.index, nObj, event.duration);
        }, time);
      }
    }, events).start(startAt);
    
    parts.push(part);
    
    // schedule end
    const duration = timeAcc + 0.5; // slight padding
    const endEventId = Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(() => {
        resolveDone();
      }, time);
    }, startAt + duration);
    
    return {
      stop: () => {
        part.stop();
        part.dispose();
        Tone.Transport.clear(endEventId);
        resolveDone();
        const idx = parts.indexOf(part);
        if (idx >= 0) parts.splice(idx, 1);
      },
      done: donePromise
    };
  }
  
  let analyser = null;

  function playRecording(key, options = {}) {
    const { onNote, fadeIn = 0, analyse = false } = options;
    let resolveDone;
    const donePromise = new Promise(r => resolveDone = r);
    
    const rec = PG.recordings && PG.recordings[key];
    if (!rec) {
      resolveDone();
      return { stop: () => {}, done: donePromise };
    }

    if (!isInitialized || muted || PG.engine.isTestMode()) {
      let timeouts = [];
      if (onNote && rec.noteTimes) {
        rec.noteTimes.forEach((timeSec, idx) => {
           let t = setTimeout(() => {
             onNote(idx, timeSec);
           }, timeSec * 1000);
           timeouts.push(t);
        });
      }
      let endT = setTimeout(() => {
        resolveDone();
      }, rec.themeEnd * 1000);
      
      return {
         stop: () => {
            timeouts.forEach(clearTimeout);
            clearTimeout(endT);
            resolveDone();
         },
         done: donePromise
      };
    }

    let stopped = false;
    let _stopFn = () => { stopped = true; resolveDone(); };

    const playWhenReady = async () => {
      while (!buffers[key]) {
        await new Promise(r => setTimeout(r, 100));
        if (stopped) return;
      }
      
      const player = new Tone.Player(buffers[key]);
      if (analyse) {
        analyser = new Tone.FFT(4096);
        player.connect(analyser);
      }
      player.connect(musicBus);
      player.fadeIn = fadeIn;
      activePlayers.push(player);
      
      if (Tone.Transport.state !== 'started') Tone.Transport.start();
      const startAt = Tone.Transport.seconds + 0.1;
      
      let part, endEventId;
      
      if (onNote && rec.noteTimes) {
        let events = [];
        rec.noteTimes.forEach((timeSec, idx) => {
           events.push({ time: timeSec, index: idx });
        });
        
        part = new Tone.Part((time, event) => {
           Tone.Draw.schedule(() => {
             onNote(event.index, event.time);
           }, time);
        }, events).start(startAt);
        parts.push(part);
      }
      
      player.start(startAt);
      
      endEventId = Tone.Transport.schedule((time) => {
        Tone.Draw.schedule(() => { resolveDone(); }, time);
      }, startAt + rec.themeEnd);
      
      _stopFn = () => {
         player.fadeOut = 0.3;
         player.stop("+" + 0.3);
         
         if (part) { part.stop(); part.dispose(); }
         if (endEventId) Tone.Transport.clear(endEventId);
         if (analyser) {
           player.disconnect(analyser);
           analyser.dispose();
           analyser = null;
         }
         setTimeout(() => { player.dispose(); }, 400);
         
         const idx = activePlayers.indexOf(player);
         if (idx > -1) activePlayers.splice(idx, 1);
         resolveDone();
      };
    };
    
    playWhenReady();
    
    return {
      stop: () => _stopFn(),
      done: donePromise
    };
  }

  function stopAll() {
    parts.forEach(p => {
      p.stop();
      p.dispose();
    });
    parts = [];
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    if (synth) synth.releaseAll();
    sfx.stopAll();
    
    activePlayers.forEach(p => {
       p.fadeOut = 0.3;
       p.stop("+" + 0.3);
       setTimeout(() => p.dispose(), 400);
    });
    activePlayers = [];
    if (analyser) {
      analyser.dispose();
      analyser = null;
    }
  }

  function setMuted(val) {
    muted = val;
    if (musicBus) {
      musicBus.mute = muted;
    }
  }

  function duck(on) {
    if (!musicBus) return;
    if (on) {
      musicBus.volume.rampTo(-12, 0.3);
    } else {
      musicBus.volume.rampTo(0, 0.3);
    }
  }

  function durToSec(dur, bpm) {
    const beatsPerMin = bpm || (PG.melodies ? PG.melodies.DEFAULT_BPM : 120);
    const secPerBeat = 60 / beatsPerMin; // '4n'
    if (dur === '2n') return secPerBeat * 2;
    if (dur === '4n') return secPerBeat;
    if (dur === '8n') return secPerBeat / 2;
    if (dur === '16n') return secPerBeat / 4;
    return secPerBeat;
  }

  function connect(node) {
    if (musicBus) node.connect(musicBus);
  }
  
  function getRecordingDuration(key) {
    if (PG.recordings && PG.recordings[key]) {
       return PG.recordings[key].themeEnd || 0;
    }
    return 0;
  }

  function getRecordingFFT() {
    if (analyser) {
      return analyser.getValue();
    }
    return null;
  }

  return {
    init,
    playMelody,
    playRecording,
    getRecordingDuration,
    getRecordingFFT,
    stopAll,
    setMuted,
    isMuted: () => muted,
    duck,
    durToSec,
    connect,
    sfx
  };
})();





