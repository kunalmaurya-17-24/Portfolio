/// <reference types="vite/client" />
/** Original, sample-free instrumental. No audio runs before the visitor presses Play. */
type TrackConfig = { src: string | null; title: string; artist: string; license: string };
type AudioEngine = {
  start: () => Promise<void>;
  pause: () => void;
  setLevel: (value: number) => void;
  dispose: () => void;
};

const DEFAULT_TRACK: TrackConfig = {
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
    clearTimeout(this.pauseTimer);
    await this.context.resume();
    if (this.disposed) return;
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
    this.disposed = true;
    this.running = false;
    clearInterval(this.scheduler);
    clearTimeout(this.pauseTimer);
    this.stopVoices();
    if (this.context.state !== 'closed') void this.context.close();
  }
}

class AuthorizedFile implements AudioEngine {
  private element: HTMLAudioElement;
  private frame = 0;
  private level = 0.28;
  private playing = false;

  constructor(src: string) {
    this.element = new Audio(src);
    this.element.loop = true;
    this.element.preload = 'none';
    this.element.volume = 0;
  }

  async start() {
    cancelAnimationFrame(this.frame);
    await this.element.play();
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
    this.playing = false;
    if (document.hidden) {
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
    cancelAnimationFrame(this.frame);
    this.element.pause();
    this.element.removeAttribute('src');
    this.element.load();
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

  let volume = 0.28;
  let muted = false;
  let playing = false;
  let busy = false;
  let disposed = false;
  let engine: AudioEngine | undefined;
  let track = { ...DEFAULT_TRACK };
  let message = 'Sound off';
  let generation = 0;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && typeof stored === 'object') {
      if (typeof stored.volume === 'number' && Number.isFinite(stored.volume)) volume = clamp(stored.volume);
      if (typeof stored.muted === 'boolean') muted = stored.muted;
    }
  } catch { /* Storage can be disabled in privacy modes. */ }

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted })); } catch { /* Optional preference storage. */ }
  };
  const render = () => {
    toggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.disabled = busy;
    toggle.dataset.playing = String(playing);
    const buttonIcon = toggle.querySelector('[data-audio-icon]');
    if (buttonIcon) buttonIcon.textContent = playing ? 'Ⅱ' : '▶';
    const buttonText = toggle.querySelector('[data-audio-label]');
    if (buttonText) buttonText.textContent = playing ? 'PAUSE' : 'PLAY';
    mute.setAttribute('aria-label', muted || volume === 0 ? 'Unmute music' : 'Mute music');
    mute.setAttribute('aria-pressed', String(muted || volume === 0));
    mute.dataset.muted = String(muted || volume === 0);
    const muteText = mute.querySelector('[data-mute-label]');
    if (muteText) muteText.textContent = muted || volume === 0 ? 'UNMUTE' : 'MUTE';
    slider.value = String(Math.round(volume * 100));
    slider.setAttribute('aria-valuetext', `${Math.round(volume * 100)} percent`);
    title.textContent = `${track.title} / ${track.artist}`;
    status.textContent = playing ? (muted || volume === 0 ? 'Playing · muted' : 'Now playing') : message;
    player.dataset.playing = String(playing);
    player.dataset.muted = String(muted || volume === 0);
    player.dataset.source = track.src ? 'file' : 'original';
  };
  const applyLevel = () => engine?.setLevel(muted ? 0 : volume);
  const pause = (reason = 'Paused') => {
    generation++;
    engine?.pause();
    playing = false;
    busy = false;
    message = reason;
    render();
  };
  const onToggle = async () => {
    if (playing) { pause(); return; }
    if (busy || disposed) return;
    const attempt = ++generation;
    busy = true;
    message = 'Starting audio';
    render();
    try {
      // This is the only creation path and is reached by an explicit user gesture.
      engine ??= track.src ? new AuthorizedFile(track.src) : new OriginalInstrumental();
      applyLevel();
      await engine.start();
      if (disposed || attempt !== generation) { engine.pause(); return; }
      playing = true;
      message = 'Now playing';
    } catch {
      playing = false;
      message = 'Audio unavailable · try again';
      engine?.dispose();
      engine = undefined;
    } finally {
      busy = false;
      if (!disposed) render();
    }
  };
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
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  render();

  const configRequest = new AbortController();
  void fetch(`${import.meta.env.BASE_URL}audio/track.json`, { signal: configRequest.signal })
    .then((response) => response.ok ? response.json() : null)
    .then((config: unknown) => {
      if (disposed || engine || !config || typeof config !== 'object') return;
      const value = config as Record<string, unknown>;
      // Only normal local/HTTP media URLs are accepted; never evaluate configuration as code.
      const src = typeof value.src === 'string' && value.src.trim() ? value.src.trim() : null;
      if (src && !['http:', 'https:'].includes(new URL(src, location.href).protocol)) return;
      track = {
        src,
        title: typeof value.title === 'string' && value.title.trim() ? value.title : DEFAULT_TRACK.title,
        artist: typeof value.artist === 'string' && value.artist.trim() ? value.artist : DEFAULT_TRACK.artist,
        license: typeof value.license === 'string' ? value.license : '',
      };
      render();
    })
    .catch(() => { /* The optional configuration falls back to the original instrumental. */ });

  return () => {
    disposed = true;
    generation++;
    configRequest.abort();
    engine?.dispose();
    toggle.removeEventListener('click', onToggle);
    mute.removeEventListener('click', onMute);
    slider.removeEventListener('input', onVolume);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
  };
}
