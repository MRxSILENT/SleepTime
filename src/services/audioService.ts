/**
 * 100% Offline Web Audio API Synthesizer
 * Generates all lock clicks, alarm melodies, and ambient sleep sounds programmatically.
 * Zero external audio files required.
 */

import { AmbientSoundType, AlarmSoundType } from '../types';

let audioCtx: AudioContext | null = null;
let activeAmbientSource: AudioNode | null = null;
let activeAlarmInterval: number | null = null;
let ambientGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const AudioService = {
  // Authentic Android Lock click
  playLockClick() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  },

  // Authentic Android Unlock chime
  playUnlockClick() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(660, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.15);
    } catch {
      // ignore
    }
  },

  // Offline Ambient Sleep Noise generator
  startAmbientSound(type: AmbientSoundType, volumePercent: number = 30) {
    this.stopAmbientSound();
    if (type === 'none') return;

    try {
      const ctx = getAudioContext();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime((volumePercent / 100) * 0.15, ctx.currentTime);
      ambientGainNode = gain;

      if (type === 'night_hum') {
        // Deep calming 108Hz drone with slow subtle vibrato
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(216, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        activeAmbientSource = osc1;
      } else {
        // Pink noise / Soft rain generated via buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'soft_rain') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(650, ctx.currentTime);
          filter.Q.setValueAtTime(1.2, ctx.currentTime);
        } else {
          // Pink noise
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        activeAmbientSource = whiteNoise;
      }
    } catch {
      // ignore
    }
  },

  stopAmbientSound() {
    if (activeAmbientSource) {
      try {
        if ('stop' in activeAmbientSource && typeof (activeAmbientSource as AudioScheduledSourceNode).stop === 'function') {
          (activeAmbientSource as AudioScheduledSourceNode).stop();
        }
        activeAmbientSource.disconnect();
      } catch {
        // ignore
      }
      activeAmbientSource = null;
    }
    if (ambientGainNode) {
      try {
        ambientGainNode.disconnect();
      } catch {
        // ignore
      }
      ambientGainNode = null;
    }
  },

  // Offline Gentle Wake-up Alarm melody
  startAlarm(soundType: AlarmSoundType, volumePercent: number = 80) {
    this.stopAlarm();
    if (soundType === 'silent') return;

    try {
      const playChimeSequence = () => {
        const ctx = getAudioContext();
        const notes = soundType === 'gentle_chime' 
          ? [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
          : soundType === 'soft_bells'
          ? [440, 554.37, 659.25, 880]       // A4, C#5, E5, A5
          : [392, 493.88, 587.33, 783.99];   // G4, B4, D5, G5

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.28);

          const startTime = ctx.currentTime + idx * 0.28;
          gain.gain.setValueAtTime((volumePercent / 100) * 0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
      };

      playChimeSequence();
      activeAlarmInterval = window.setInterval(playChimeSequence, 2800);
    } catch {
      // ignore
    }
  },

  stopAlarm() {
    if (activeAlarmInterval) {
      clearInterval(activeAlarmInterval);
      activeAlarmInterval = null;
    }
  },

  triggerHaptic() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
  },
};
