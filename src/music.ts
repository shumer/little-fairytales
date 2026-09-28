// Original sixteen-bar music-box waltz, composed for this game.
const melody = [
  [72,76,79,76,74,76], [71,74,79,74,71,67],
  [69,72,76,79,76,72], [69,74,77,76,74,71],
  [72,76,81,79,76,74], [71,74,79,81,79,74],
  [69,72,77,76,74,71], [72,76,79,76,72,0],
  [76,79,84,83,79,76], [74,79,83,81,79,74],
  [72,76,81,79,76,72], [74,77,81,79,77,74],
  [76,79,84,79,76,72], [74,77,83,81,79,74],
  [72,77,81,79,74,71], [72,76,79,76,72,0],
];
const chords = [[48,55,60],[43,55,59],[45,52,60],[50,57,62],[48,55,60],[43,55,59],[41,53,60],[48,55,60]];
const stepSeconds = 60 / 84 / 2;
const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12);

export class StoryAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private timer?: number;
  private nodes = new Set<OscillatorNode>();
  private enabled: boolean;
  private unlocked = false;
  private step = 0;
  private nextTime = 0;
  private generation = 0;

  constructor(enabled: boolean) {
    this.enabled = enabled;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause(); else void this.start();
    });
    window.addEventListener('pagehide', () => this.pause());
    window.addEventListener('pageshow', () => void this.start());
    document.addEventListener('pointerdown', () => {
      this.unlocked = true;
      void this.start();
    }, { passive: true });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) void this.start(); else this.pause();
  }

  private async start() {
    if (!this.enabled || !this.unlocked || document.hidden) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = .65;
        this.master.connect(this.context.destination);
      }
      const generation = this.generation;
      await this.context.resume();
      if (generation !== this.generation || !this.enabled || document.hidden || this.timer !== undefined) return;
      this.nextTime = this.context.currentTime + .08;
      this.schedule();
      this.timer = window.setInterval(() => this.schedule(), 100);
    } catch { /* The next user gesture retries audio if the browser blocked it. */ }
  }

  private pause() {
    this.generation++;
    window.clearInterval(this.timer);
    this.timer = undefined;
    for (const node of this.nodes) { try { node.stop(); } catch { /* Already stopped nodes can be ignored. */ } }
    this.nodes.clear();
    if (this.context) void this.context.suspend().catch(() => {});
  }

  private tone(hz: number, when: number, duration: number, volume: number, overtone = false) {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = hz;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + .018);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    oscillator.connect(envelope); envelope.connect(this.master);
    this.nodes.add(oscillator);
    oscillator.onended = () => { this.nodes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(when); oscillator.stop(when + duration + .03);
    if (overtone) this.tone(hz * 2, when, duration * .45, volume * .13);
  }

  private schedule() {
    const context = this.context;
    if (!context || context.state !== 'running' || !this.enabled || document.hidden) return;
    if (this.nextTime < context.currentTime) this.nextTime = context.currentTime + .05;
    while (this.nextTime < context.currentTime + .25) {
      const bar = Math.floor(this.step / 6) % melody.length;
      const beat = this.step % 6;
      const note = melody[bar][beat];
      if (note) this.tone(frequency(note), this.nextTime, .95, .037, true);
      const chord = chords[bar % chords.length];
      if (beat === 0) this.tone(frequency(chord[0]), this.nextTime, 1.6, .027);
      if (beat === 2 || beat === 4) {
        this.tone(frequency(chord[1]), this.nextTime, .8, .014);
        this.tone(frequency(chord[2]), this.nextTime + .025, .8, .012);
      }
      this.step = (this.step + 1) % (melody.length * 6);
      this.nextTime += stepSeconds;
    }
  }

  chime(notes: number[]) {
    if (!this.enabled || !this.unlocked || document.hidden) return;
    void this.start().then(() => {
      if (!this.enabled || document.hidden || this.context?.state !== 'running') return;
      notes.forEach((hz, i) => this.tone(hz, this.context!.currentTime + i * .1, .3, .055));
    });
  }
}
