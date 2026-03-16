import { Howl } from 'howler';

/**
 * Singleton audio manager using Howler.js.
 * Handles SFX (pin bounces, wins) and background lo-fi music.
 */
class AudioManager {
  private static instance: AudioManager | null = null;

  private sfxEnabled = false;
  private musicEnabled = false;
  private sfxVolume = 0.5;
  private musicVolume = 0.3;

  private pinBounceHowl: Howl | null = null;
  private binLandHowl: Howl | null = null;
  private jackpotHowl: Howl | null = null;
  private bigWinHowl: Howl | null = null;
  private nearMissHowl: Howl | null = null;
  private unlockHowl: Howl | null = null;
  private musicHowl: Howl | null = null;

  private initialized = false;
  private blobUrls: string[] = [];

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  initSfx(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Use Web Audio API to generate simple SFX procedurally
    // This avoids needing external audio files
    this.pinBounceHowl = this.createToneHowl(800, 0.05, 'sine');
    this.binLandHowl = this.createToneHowl(400, 0.15, 'triangle');
    this.jackpotHowl = this.createFanfareHowl();
    this.bigWinHowl = this.createToneHowl(600, 0.2, 'sine');
    this.nearMissHowl = this.createToneHowl(200, 0.3, 'sawtooth');
    this.unlockHowl = this.createFanfareHowl();
  }

  private createToneHowl(freq: number, duration: number, type: OscillatorType): Howl {
    // Generate a simple tone using Web Audio API via an audio buffer
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * (5 / duration));
      let sample = 0;
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * freq * t);
          break;
        case 'triangle':
          sample = 2 * Math.abs(2 * (freq * t - Math.floor(freq * t + 0.5))) - 1;
          break;
        case 'sawtooth':
          sample = 2 * (freq * t - Math.floor(freq * t + 0.5));
          break;
        default:
          sample = Math.sin(2 * Math.PI * freq * t);
      }
      data[i] = sample * envelope * 0.3;
    }

    // Encode buffer to WAV
    const wav = this.encodeWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    this.blobUrls.push(url);

    ctx.close();

    return new Howl({ src: [url], format: ['wav'], volume: this.sfxVolume });
  }

  private createFanfareHowl(): Howl {
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 1.0;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteIdx = Math.min(Math.floor(t / (duration / notes.length)), notes.length - 1);
      const freq = notes[noteIdx];
      const envelope = Math.exp(-(t % (duration / notes.length)) * 4);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
    }

    const wav = this.encodeWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    this.blobUrls.push(url);

    ctx.close();

    return new Howl({ src: [url], format: ['wav'], volume: this.sfxVolume });
  }

  private encodeWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const byteLength = length * numChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(byteLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, byteLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  playSfx(name: string): void {
    if (!this.sfxEnabled) return;

    switch (name) {
      case 'pin_bounce':
        this.pinBounceHowl?.play();
        break;
      case 'bin_land':
        this.binLandHowl?.play();
        break;
      case 'jackpot':
        this.jackpotHowl?.play();
        break;
      case 'big_win':
        this.bigWinHowl?.play();
        break;
      case 'near_miss':
        this.nearMissHowl?.play();
        break;
      case 'unlock':
        this.unlockHowl?.play();
        break;
    }
  }

  playPinBounce(rowIndex: number, totalRows: number): void {
    if (!this.sfxEnabled || !this.pinBounceHowl) return;
    // Higher pitch as ball descends — use sound ID to avoid rate conflicts
    const rate = 0.8 + (rowIndex / totalRows) * 1.2;
    const id = this.pinBounceHowl.play();
    this.pinBounceHowl.rate(rate, id);
  }

  setSfxEnabled(on: boolean): void {
    this.sfxEnabled = on;
    if (on && !this.initialized) {
      this.initSfx();
    }
  }

  setMusicEnabled(on: boolean): void {
    this.musicEnabled = on;
    if (on) {
      if (!this.musicHowl) {
        this.initMusic();
      }
      this.musicHowl?.play();
    } else {
      this.musicHowl?.pause();
    }
  }

  private initMusic(): void {
    // Generate a simple lo-fi loop procedurally
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 8; // 8 second loop
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Simple chord progression: Am - F - C - G
    const chords = [
      [220, 261.6, 329.6], // Am
      [174.6, 220, 261.6], // F
      [261.6, 329.6, 392],  // C
      [196, 246.9, 293.7],  // G
    ];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const chordIdx = Math.floor(t / 2) % chords.length;
      const chord = chords[chordIdx];
      let sample = 0;
      for (const freq of chord) {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.08;
      }
      // Lo-fi: add subtle crackle
      sample += (Math.random() - 0.5) * 0.005;
      data[i] = sample;
    }

    const wav = this.encodeWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    this.blobUrls.push(url);

    ctx.close();

    this.musicHowl = new Howl({
      src: [url],
      format: ['wav'],
      loop: true,
      volume: this.musicVolume,
    });
  }

  setSfxVolume(vol: number): void {
    this.sfxVolume = vol;
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = vol;
    this.musicHowl?.volume(vol);
  }

  destroy(): void {
    this.pinBounceHowl?.unload();
    this.binLandHowl?.unload();
    this.jackpotHowl?.unload();
    this.bigWinHowl?.unload();
    this.nearMissHowl?.unload();
    this.unlockHowl?.unload();
    this.musicHowl?.unload();
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
    AudioManager.instance = null;
  }
}

export default AudioManager;
