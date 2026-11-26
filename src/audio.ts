/// <reference types="vite/client" />
/** Optional audio playlist. Playback always starts with an explicit visitor interaction. */
type TrackConfig = { id: string; src: string | null; title: string; artist: string; license: string };
type AudioEngine = {
  start: () => Promise<void>;
  pause: () => void;
  setLevel: (value: number) => void;
  dispose: () => void;
};

const DEFAULT_TRACK: TrackConfig = {
  id: 'after-hours',
  src: null,
  title: 'After Hours',
  artist: 'Original instrumental',
  license: 'Original procedural composition; no third-party samples.',
};
const STORAGE_KEY = 'km-audio-preferences';
const clamp = (value: number) => Math.min(1, Math.max(0, value));

class OriginalInstrumental implements AudioEngine {
  private context: AudioContext;
  private master: GainNode;
  private bus: BiquadFilterNode;
  private noise: AudioBuffer;
  private voices = new Set<AudioScheduledSourceNode>();
  private scheduler: ReturnType<typeof setInterval> | undefined;
  private pauseTimer: ReturnType<typeof setTimeout> | undefined;
  private nextNote = 0;
  private step = 0;
  private level = 0.28;
  private running = false;
  private disposed = false;
  private operation = 0;

  constructor() {
    // Construction is called only by the explicit Play handler.
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.bus = this.context.createBiquadFilter();
    this.bus.type = 'lowpass';
    this.bus.frequency.value = 7200;
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    this.bus.connect(compressor);
    compressor.connect(this.master);
    this.master.connect(this.context.destination);
    this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const samples = this.noise.getChannelData(0);
    let seed = 7219;
    for (let index = 0; index < samples.length; index++) {
      seed = (seed * 16807) % 2147483647;
      samples[index] = (seed / 2147483647) * 2 - 1;
    }
  }

  async start() {
    if (this.disposed) throw new Error('Audio has been closed.');
    const attempt = ++this.operation;
    clearTimeout(this.pauseTimer);
    await this.context.resume();
    if (this.disposed || attempt !== this.operation) return;
    this.running = true;
    this.setLevel(this.level);
    this.nextNote = this.context.currentTime + 0.045;
    this.tick();
    clearInterval(this.scheduler);
    this.scheduler = setInterval(() => this.tick(), 30);
  }

  private track(source: AudioScheduledSourceNode, output: AudioNode, time: number, duration: number) {
    this.voices.add(source);
    source.onended = () => {
      this.voices.delete(source);
      source.disconnect();
      output.disconnect();
    };
    source.start(time);
    source.stop(time + duration);
  }

  private tone(midi: number, time: number, duration: number, amplitude: number, type: OscillatorType = 'sine') {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(amplitude, time + 0.035);
    envelope.gain.exponentialRampToValueAtTime(Math.max(amplitude * 0.5, 0.0002), time + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(this.bus);
    this.track(oscillator, envelope, time, duration + 0.015);
  }

  private percussion(time: number, kind: 'kick' | 'snare' | 'hat', accent = 1) {
    const envelope = this.context.createGain();
    if (kind === 'kick') {
      const oscillator = this.context.createOscillator();
      oscillator.frequency.setValueAtTime(106, time);
      oscillator.frequency.exponentialRampToValueAtTime(43, time + 0.1);
      envelope.gain.setValueAtTime(0.23 * accent, time);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      oscillator.connect(envelope);
      envelope.connect(this.bus);
      this.track(oscillator, envelope, time, 0.24);
      return;
    }
    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    const filter = this.context.createBiquadFilter();
    filter.type = kind === 'hat' ? 'highpass' : 'bandpass';
    filter.frequency.value = kind === 'hat' ? 6500 : 1900;
    filter.Q.value = kind === 'hat' ? 0.7 : 0.55;
    const duration = kind === 'hat' ? 0.06 : 0.14;
    envelope.gain.setValueAtTime((kind === 'hat' ? 0.022 : 0.055) * accent, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.bus);
    this.track(source, envelope, time, duration + 0.01);
    const previousEnded = source.onended;
    source.onended = (event) => {
      if (typeof previousEnded === 'function') previousEnded.call(source, event);
      filter.disconnect();
    };
  }

  private tick() {
    if (!this.running || this.disposed) return;
    const eighth = 60 / 82 / 2;
    const chords = [
      [52, 55, 59, 62, 66],
      [48, 52, 55, 59, 62],
      [45, 48, 52, 55, 59],
      [50, 54, 57, 60, 64],
    ];
    const bass = [40, 36, 33, 38];
    // Bound the scheduler after a background-tab delay; never catch up thousands of beats.
    if (this.nextNote < this.context.currentTime - 0.1) this.nextNote = this.context.currentTime + 0.02;
    while (this.nextNote < this.context.currentTime + 0.15) {
      const beat = this.step % 8;
      const bar = Math.floor(this.step / 8) % 4;
      const time = this.nextNote + (beat % 2 ? 0.018 : 0);
      if (beat === 0) {
        chords[bar].forEach((note, index) => this.tone(note, time + index * 0.018, eighth * 7.6, 0.023, 'triangle'));
      }
      if (beat === 0 || beat === 3 || beat === 6) this.tone(bass[bar], time, eighth * (beat === 3 ? 1.7 : 1.3), 0.11);
      if (beat === 0 || beat === 4) this.percussion(time, 'kick', beat === 0 ? 1 : 0.72);
      if (beat === 2 || beat === 6) this.percussion(time + 0.012, 'snare');
      this.percussion(time, 'hat', beat % 2 ? 0.55 : 0.8);
      if ((bar === 1 && beat === 5) || (bar === 3 && beat === 7)) {
        this.tone(chords[bar][3] + 12, time, eighth * 1.3, 0.032);
      }
      this.step = (this.step + 1) % 32;
      this.nextNote += eighth;
    }
  }

  setLevel(value: number) {
    this.level = clamp(value);
    const time = this.context.currentTime;
    this.master.gain.cancelScheduledValues(time);
    this.master.gain.setTargetAtTime(this.running ? this.level : 0, time, 0.055);
  }

  pause() {
    this.operation++;
    this.running = false;
    clearInterval(this.scheduler);
    const time = this.context.currentTime;
    this.master.gain.cancelScheduledValues(time);
    this.master.gain.setTargetAtTime(0, time, 0.04);
    clearTimeout(this.pauseTimer);
    if (document.hidden) {
      this.stopVoices();
      if (this.context.state !== 'closed') void this.context.suspend();
      return;
    }
    this.pauseTimer = setTimeout(() => {
      this.stopVoices();
      if (this.context.state !== 'closed') void this.context.suspend();
    }, 220);
  }

  private stopVoices() {
    this.voices.forEach((voice) => {
      try { voice.stop(); } catch { /* An already-ended voice needs no further cleanup. */ }
    });
    this.voices.clear();
  }

  dispose() {
    this.operation++;
    this.disposed = true;
    this.running = false;
    clearInterval(this.scheduler);
    clearTimeout(this.pauseTimer);
    this.stopVoices();
    if (this.context.state !== 'closed') void this.context.close();
  }
}

class FileTrack implements AudioEngine {
  private element: HTMLAudioElement;
  private frame = 0;
  private level = 0.28;
  private playing = false;
  private disposed = false;
  private generation = 0;

  constructor(src: string, container: HTMLElement) {
    this.element = new Audio(src);
    this.element.loop = true;
    this.element.preload = 'none';
    this.element.volume = 0;
    // During a crossfade, only the newly selected media element has the public ID.
    document.getElementById('audio-media')?.removeAttribute('id');
    this.element.id = 'audio-media';
    this.element.hidden = true;
    this.element.setAttribute('aria-hidden', 'true');
    container.append(this.element);
  }

  async start() {
    if (this.disposed) throw new Error('Audio has been closed.');
    const attempt = ++this.generation;
    cancelAnimationFrame(this.frame);
    await this.element.play();
    if (this.disposed || attempt !== this.generation) return;
    this.playing = true;
    this.ramp(this.level);
  }

  private ramp(target: number, onComplete?: () => void) {
    cancelAnimationFrame(this.frame);
    const initial = this.element.volume;
    const started = performance.now();
    const update = () => {
      const progress = Math.min(1, (performance.now() - started) / 180);
      this.element.volume = clamp(initial + (target - initial) * progress);
      if (progress < 1) this.frame = requestAnimationFrame(update);
      else onComplete?.();
    };
    this.frame = requestAnimationFrame(update);
  }

  pause() {
    this.generation++;
    const wasPlaying = this.playing;
    this.playing = false;
    if (document.hidden || !wasPlaying) {
      cancelAnimationFrame(this.frame);
      this.element.volume = 0;
      this.element.pause();
      return;
    }
    this.ramp(0, () => this.element.pause());
  }

  setLevel(value: number) {
    this.level = clamp(value);
    if (this.playing) this.ramp(this.level);
  }

  dispose() {
    this.disposed = true;
    this.generation++;
    cancelAnimationFrame(this.frame);
    this.element.pause();
    this.element.removeAttribute('src');
    this.element.load();
    this.element.remove();
  }
}

export function initAudio(): () => void {
  const toggle = document.getElementById('audio-toggle') as HTMLButtonElement | null;
  const mute = document.getElementById('audio-mute') as HTMLButtonElement | null;
  const slider = document.getElementById('audio-volume') as HTMLInputElement | null;
  const title = document.getElementById('audio-title');
  const status = document.getElementById('audio-status');
  const player = document.getElementById('audio-player');
  if (!toggle || !mute || !slider || !title || !status || !player) return () => {};
  const selector = document.getElementById('audio-track-select') as HTMLSelectElement | null;
  const previous = document.getElementById('audio-prev') as HTMLButtonElement | null;
  const next = document.getElementById('audio-next') as HTMLButtonElement | null;
  const position = document.getElementById('audio-track-position');
  let volume = 0.28;
  let muted = false;
  let playing = false;
  let wantsPlayback = false;
  let busy = false;
  let loading = true;
  let disposed = false;
  let engine: AudioEngine | undefined;
  let retired: { engine: AudioEngine; timer: ReturnType<typeof setTimeout> } | undefined;
  let tracks = [{ ...DEFAULT_TRACK }];
  let selectedId = DEFAULT_TRACK.id;
  let storedTrackId: string | undefined;
  let message = 'Sound off';
  let generation = 0;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && typeof stored === 'object') {
      if (typeof stored.volume === 'number' && Number.isFinite(stored.volume)) volume = clamp(stored.volume);
      if (typeof stored.muted === 'boolean') muted = stored.muted;
      if (typeof stored.trackId === 'string') storedTrackId = stored.trackId;
    }
  } catch { /* Storage can be disabled in privacy modes. */ }

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted, trackId: selectedId })); } catch { /* Optional preference storage. */ }
  };
  const currentTrack = () => tracks.find(track => track.id === selectedId) || tracks[0];
  const updateOptions = () => {
    if (!selector) return;
    selector.replaceChildren(...tracks.map(track => {
      const option = document.createElement('option');
      option.value = track.id;
      option.textContent = track.title;
      return option;
    }));
  };
  const render = () => {
    const track = currentTrack();
    toggle.setAttribute('aria-label', busy ? 'Cancel music playback' : playing ? 'Pause music' : 'Play music');
    toggle.setAttribute('aria-pressed', String(wantsPlayback));
    toggle.setAttribute('aria-busy', String(busy));
    toggle.disabled = loading;
    toggle.dataset.playing = String(playing);
    const buttonIcon = toggle.querySelector('[data-audio-icon]');
    if (buttonIcon) buttonIcon.textContent = wantsPlayback ? 'Ⅱ' : '▶';
    const buttonText = toggle.querySelector('[data-audio-label]');
    if (buttonText) buttonText.textContent = wantsPlayback ? 'PAUSE' : 'PLAY';
    mute.setAttribute('aria-label', muted || volume === 0 ? 'Unmute music' : 'Mute music');
    mute.setAttribute('aria-pressed', String(muted || volume === 0));
    mute.dataset.muted = String(muted || volume === 0);
    const muteText = mute.querySelector('[data-mute-label]');
    if (muteText) muteText.textContent = muted || volume === 0 ? 'UNMUTE' : 'MUTE';
    slider.value = String(Math.round(volume * 100));
    slider.setAttribute('aria-valuetext', `${Math.round(volume * 100)} percent`);
    title.textContent = loading ? 'Loading soundtrack' : [track.title, track.artist].filter(Boolean).join(' / ');
    status.textContent = loading ? 'Preparing playlist' : busy ? message : playing ? (muted || volume === 0 ? 'Playing · muted' : 'Now playing') : message;
    player.dataset.playing = String(playing);
    player.dataset.muted = String(muted || volume === 0);
    player.dataset.source = track.src ? 'file' : 'original';
    player.dataset.track = track.id;
    player.dataset.configReady = String(!loading);
    player.dataset.loading = String(busy || loading);
    if (selector) {
      selector.value = selectedId;
      selector.disabled = loading || tracks.length < 2;
    }
    if (previous) previous.disabled = loading || tracks.length < 2;
    if (next) next.disabled = loading || tracks.length < 2;
    if (position) position.textContent = `${String(tracks.findIndex(track => track.id === selectedId) + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
  };
  const applyLevel = () => engine?.setLevel(muted ? 0 : volume);
  const clearRetired = () => {
    if (!retired) return;
    clearTimeout(retired.timer);
    retired.engine.dispose();
    retired = undefined;
  };
  const retire = (oldEngine: AudioEngine, fade: boolean) => {
    // At most one fading-out track may coexist with the selected track.
    clearRetired();
    oldEngine.pause();
    if (!fade || document.hidden) { oldEngine.dispose(); return; }
    const timer = setTimeout(() => {
      oldEngine.dispose();
      if (retired?.engine === oldEngine) retired = undefined;
    }, 230);
    retired = { engine: oldEngine, timer };
  };
  const pause = (reason = 'Paused') => {
    generation++;
    engine?.pause();
    clearRetired();
    playing = false;
    wantsPlayback = false;
    busy = false;
    message = reason;
    render();
  };
  const startCurrent = async () => {
    if (loading || disposed) return;
    const attempt = ++generation;
    let candidate = engine;
    wantsPlayback = true;
    playing = false;
    busy = true;
    message = 'Starting audio';
    render();
    try {
      // Every creation/play path originates in Play, selection, or previous/next interaction.
      const track = currentTrack();
      candidate ??= track.src ? new FileTrack(track.src, player) : new OriginalInstrumental();
      engine = candidate;
      applyLevel();
      await candidate.start();
      if (disposed || attempt !== generation || engine !== candidate) return;
      playing = true;
      message = 'Now playing';
    } catch {
      // An obsolete play promise must never alter a newer selection or its playback.
      if (disposed || attempt !== generation || engine !== candidate) return;
      playing = false;
      wantsPlayback = false;
      message = 'Audio unavailable · try again';
      candidate?.dispose();
      engine = undefined;
    } finally {
      if (!disposed && attempt === generation) {
        busy = false;
        render();
      }
    }
  };
  const onToggle = () => {
    if (wantsPlayback || playing || busy) pause();
    else void startCurrent();
  };
  const selectTrack = (id: string) => {
    if (loading || disposed || id === selectedId || !tracks.some(track => track.id === id)) return;
    const resume = wantsPlayback || playing || busy;
    generation++;
    if (engine) retire(engine, playing);
    else clearRetired();
    engine = undefined;
    selectedId = id;
    playing = false;
    wantsPlayback = false;
    busy = false;
    message = resume ? 'Switching track' : 'Ready · press play';
    persist();
    render();
    if (resume) void startCurrent();
  };
  const onSelection = () => { if (selector) selectTrack(selector.value); };
  const skip = (direction: number) => {
    const index = tracks.findIndex(track => track.id === selectedId);
    selectTrack(tracks[(index + direction + tracks.length) % tracks.length].id);
  };
  const onPrevious = () => skip(-1);
  const onNext = () => skip(1);
  const onMute = () => {
    if (volume === 0 && !muted) { volume = 0.28; muted = false; }
    else muted = !muted;
    applyLevel();
    persist();
    render();
  };
  const onVolume = () => {
    volume = clamp(Number(slider.value) / 100);
    if (volume > 0) muted = false;
    applyLevel();
    persist();
    render();
  };
  const onVisibility = () => {
    if (document.hidden && (playing || busy)) pause('Paused in background');
  };
  const onPageHide = () => pause('Paused');
  toggle.addEventListener('click', onToggle);
  mute.addEventListener('click', onMute);
  slider.addEventListener('input', onVolume);
  selector?.addEventListener('change', onSelection);
  previous?.addEventListener('click', onPrevious);
  next?.addEventListener('click', onNext);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  updateOptions();
  render();

  const configRequest = new AbortController();
  const configTimeout = setTimeout(() => configRequest.abort(), 4000);
  const parseTrack = (input: unknown, index: number): TrackConfig | null => {
    if (!input || typeof input !== 'object') return null;
    const value = input as Record<string, unknown>;
    const title = typeof value.title === 'string' ? value.title.trim() : '';
    if (!title) return null;
    let src: string | null = null;
    if (typeof value.src === 'string' && value.src.trim()) {
      try {
        const url = new URL(value.src.trim(), new URL(import.meta.env.BASE_URL, location.href));
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        src = url.href;
      } catch { return null; }
    } else if (value.src !== null) return null;
    return {
      id: typeof value.id === 'string' && value.id.trim() ? value.id.trim() : `track-${index + 1}`,
      src,
      title,
      artist: typeof value.artist === 'string' && value.artist.trim() ? value.artist.trim() : src ? '' : DEFAULT_TRACK.artist,
      license: typeof value.license === 'string' ? value.license : '',
    };
  };
  void fetch(`${import.meta.env.BASE_URL}audio/track.json`, { signal: configRequest.signal })
    .then((response) => response.ok ? response.json() : null)
    .then((config: unknown) => {
      if (disposed || !config || typeof config !== 'object') return;
      const value = config as Record<string, unknown>;
      // Accept the playlist format and the previous single-track configuration.
      const candidates = Array.isArray(value.tracks) ? value.tracks : [value];
      const ids = new Set<string>();
      const parsed = candidates.map(parseTrack).filter((track): track is TrackConfig => {
        if (!track || ids.has(track.id)) return false;
        ids.add(track.id);
        return true;
      });
      if (!parsed.length) return;
      tracks = parsed;
      const preferred = storedTrackId && tracks.some(track => track.id === storedTrackId) ? storedTrackId : value.defaultTrack;
      selectedId = typeof preferred === 'string' && tracks.some(track => track.id === preferred) ? preferred : tracks[0].id;
    })
    .catch(() => { /* Missing/invalid configuration falls back to the original instrumental. */ })
    .finally(() => {
      clearTimeout(configTimeout);
      if (disposed) return;
      loading = false;
      updateOptions();
      persist();
      render();
    });

  return () => {
    disposed = true;
    generation++;
    clearTimeout(configTimeout);
    configRequest.abort();
    engine?.dispose();
    clearRetired();
    toggle.removeEventListener('click', onToggle);
    mute.removeEventListener('click', onMute);
    slider.removeEventListener('input', onVolume);
    selector?.removeEventListener('change', onSelection);
    previous?.removeEventListener('click', onPrevious);
    next?.removeEventListener('click', onNext);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
  };
}
