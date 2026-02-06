// Web Audio API Synthesizer for Drum Kit

const createAudioContext = () => {
    return new (window.AudioContext || window.webkitAudioContext)();
};

let audioCtx = null;

const getContext = () => {
    if (!audioCtx) audioCtx = createAudioContext();
    return audioCtx;
};

// Sound Synthesis Functions
const playKick = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.5);
};

const playSnare = (ctx, time) => {
    // Noise
    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Tone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, time);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.2);
};

const playHiHat = (ctx, time, open = false) => {
    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, time);
    // Short decay for closed, longer for open
    gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.4 : 0.05));

    source.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(time);
    source.stop(time + (open ? 0.4 : 0.05));
};

const playTom = (ctx, time, freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.4); // Pitch drop

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.4);
};

const playCymbal = (ctx, time) => {
    // More metallic noise synthesis usually involves multiple square waves but we'll use noise for simplicity
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 5000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 2); // Long decay

    source.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(time);
    source.stop(time + 2);
}


import { useState } from 'react';

export const useSynthAudio = () => {

    const playSound = (id) => {
        const ctx = getContext();
        const time = ctx.currentTime;

        switch (id) {
            case 'kick': playKick(ctx, time); break;
            case 'snare': playSnare(ctx, time); break;
            case 'hat_close': playHiHat(ctx, time, false); break;
            case 'hat_open': playHiHat(ctx, time, true); break;
            case 'tom1': playTom(ctx, time, 200); break;
            case 'tom2': playTom(ctx, time, 150); break;
            case 'tom3': playTom(ctx, time, 100); break;
            case 'crash1': playCymbal(ctx, time); break;
            case 'crash2': playCymbal(ctx, time); break;
            case 'ride': playCymbal(ctx, time); break; // Reuse cymbal logic for now
            default: break;
        }
    };

    // Keeping interface consistent with previous hook
    const sounds = [
        { id: 'kick', label: 'Kick', defaultKey: ' ' },
        { id: 'snare', label: 'Snare', defaultKey: 'f' },
        { id: 'hat_close', label: 'Hi-Hat Cl', defaultKey: 'd' },
        { id: 'hat_open', label: 'Hi-Hat Op', defaultKey: 's' },
        { id: 'tom1', label: 'Tom 1', defaultKey: 'g' },
        { id: 'tom2', label: 'Tom 2', defaultKey: 'h' },
        { id: 'tom3', label: 'Tom 3', defaultKey: 'j' },
        { id: 'crash1', label: 'Crash 1', defaultKey: 'r' },
        { id: 'crash2', label: 'Crash 2', defaultKey: 'y' },
        { id: 'ride', label: 'Ride', defaultKey: 'u' },
    ];

    return { sounds, playSound };
};
