import { useRef, useEffect, useState, useCallback } from 'react';
import { Howl } from 'howler';

const DEFAULT_KIT_MAP = {
    kick: { folder: 'KICKS', index: 0, label: 'Kick', key: ' ' },
    snare: { folder: 'SNARES', index: 0, label: 'Snare', key: 'f' },
    hat_close: { folder: 'HATS', index: 0, label: 'Hi-Hat Cl', key: 'd', muteGroup: 1 },
    hat_open: { folder: 'HATS', index: 1, label: 'Hi-Hat Op', key: 's', muteGroup: 1 },
    tom1: { folder: 'TOMS', index: 0, label: 'Tom 1', key: 'g' },
    tom2: { folder: 'TOMS', index: 1, label: 'Tom 2', key: 'h' },
    tom3: { folder: 'TOMS', index: 2, label: 'Tom 3', key: 'j' },
    crash1: { folder: 'CRASHES', index: 0, label: 'Crash 1', key: 'r' },
    crash2: { folder: 'CRASHES', index: 1, label: 'Crash 2', key: 'y' },
    ride: { folder: 'RIDES', index: 0, label: 'Ride', key: 'u' },
};

export const useAudio = () => {
    const howlsRef = useRef({});
    const sourcesRef = useRef({}); // Track mapped sources to avoid unnecessary reloads
    const [sounds, setSounds] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [presets, setPresets] = useState([]);
    const [reverbAmount, setReverbAmountState] = useState(0);

    // Web Audio API refs for reverb
    const audioContextRef = useRef(null);
    const convolverRef = useRef(null);
    const dryGainRef = useRef(null);
    const wetGainRef = useRef(null);

    // Initialize Web Audio API for reverb
    useEffect(() => {
        try {
            // Wait for Howler to initialize its context
            const initReverb = () => {
                if (!Howl || !Howl.ctx) {
                    setTimeout(initReverb, 100);
                    return;
                }

                const ctx = Howl.ctx;
                audioContextRef.current = ctx;

                // Create convolver for reverb
                const convolver = ctx.createConvolver();
                convolverRef.current = convolver;

                // Generate synthetic impulse response
                const sampleRate = ctx.sampleRate;
                const duration = 2; // 2 second reverb tail
                const length = sampleRate * duration;
                const impulse = ctx.createBuffer(2, length, sampleRate);

                for (let channel = 0; channel < 2; channel++) {
                    const channelData = impulse.getChannelData(channel);
                    for (let i = 0; i < length; i++) {
                        // Exponential decay with random noise
                        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                    }
                }
                convolver.buffer = impulse;

                // Create dry/wet gain nodes
                const dryGain = ctx.createGain();
                const wetGain = ctx.createGain();
                dryGainRef.current = dryGain;
                wetGainRef.current = wetGain;

                // CRITICAL: Disconnect Howler's master from destination
                // and route through our reverb chain
                const masterGain = Howl.masterGain;
                masterGain.disconnect();

                // Connect: Howler.masterGain -> [dry -> destination, wet -> convolver -> destination]
                masterGain.connect(dryGain);
                masterGain.connect(wetGain);

                dryGain.connect(ctx.destination);
                wetGain.connect(convolver);
                convolver.connect(ctx.destination);

                // Set initial gains (0% reverb)
                dryGain.gain.value = 1.0;
                wetGain.gain.value = 0.0;

                // Load saved reverb amount
                const savedReverb = localStorage.getItem('reverbAmount');
                if (savedReverb !== null) {
                    setReverbAmountState(parseFloat(savedReverb));
                }
            };

            initReverb();
        } catch (err) {
            console.error('Failed to initialize Web Audio API:', err);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        const loadKit = async () => {
            try {
                // Load active kit
                const savedKit = localStorage.getItem('userKitConfig');

                // Load presets
                const savedPresets = localStorage.getItem('userKitPresets');
                if (savedPresets) {
                    setPresets(JSON.parse(savedPresets));
                }

                if (savedKit) {
                    setSounds(JSON.parse(savedKit));
                } else {
                    await resetToDefault();
                }
            } catch (err) {
                console.error("Failed to load kit", err);
            } finally {
                setIsLoaded(true);
            }
        };
        loadKit();
    }, []);

    // Sync Howls & Storage
    useEffect(() => {
        if (!isLoaded) return;

        // Helper for audio taper (human hearing is logarithmic)
        // x^2 is a good approximation for "natural" volume feeling
        const getEffectiveVolume = (vol) => {
            const v = vol ?? 1.0;
            return v * v;
        };

        // Cleanup removed sounds
        Object.keys(howlsRef.current).forEach(id => {
            if (!sounds.find(s => s.id === id)) {
                if (howlsRef.current[id]) howlsRef.current[id].unload();
                delete howlsRef.current[id];
                delete sourcesRef.current[id];
            }
        });

        // Add/Update sounds
        sounds.forEach(sound => {
            if (!sound.src) return;

            const existing = howlsRef.current[sound.id];
            const currentSrc = sourcesRef.current[sound.id];
            const effectiveVol = getEffectiveVolume(sound.volume);

            // Reload ONLY if source string changed or doesn't exist
            if (!existing || currentSrc !== sound.src) {
                if (existing) existing.unload();

                const howl = new Howl({
                    src: [sound.src],
                    volume: effectiveVol,
                    preload: true
                });

                // Connect to Web Audio API if available
                if (audioContextRef.current && dryGainRef.current && wetGainRef.current) {
                    const ctx = audioContextRef.current;
                    // Resume context if suspended (browser autoplay policy)
                    if (ctx.state === 'suspended') {
                        ctx.resume();
                    }
                }

                howlsRef.current[sound.id] = howl;
                sourcesRef.current[sound.id] = sound.src;
            } else {
                // Determine if volume changed and update it
                // Howler volume sets current volume, we can blindly set it or check
                // Precision check to avoid tiny float diffs
                if (Math.abs(existing.volume() - effectiveVol) > 0.001) {
                    existing.volume(effectiveVol);
                }
            }
        });

        localStorage.setItem('userKitConfig', JSON.stringify(sounds));
    }, [sounds, isLoaded]);

    const playSound = useCallback((id) => {
        const sound = sounds.find(s => s.id === id);
        if (!sound) return;

        // Mute Group Logic (Hi-Hat Choke)
        if (sound.muteGroup) {
            sounds.forEach(otherSound => {
                if (otherSound.id !== id && otherSound.muteGroup === sound.muteGroup) {
                    const otherHowl = howlsRef.current[otherSound.id];
                    if (otherHowl) {
                        otherHowl.stop(); // Cut off the other sound
                    }
                }
            });
        }

        const howl = howlsRef.current[id];
        if (howl) {
            // howler manages polyphony automatically if we just play()
            // seek(0) was cutting off the tail of previous hits
            howl.play();
        }
    }, [sounds]);

    const resetToDefault = async () => {
        const res = await fetch('/sounds-manifest.json');
        const manifest = await res.json();

        const newKit = Object.keys(DEFAULT_KIT_MAP).map(id => {
            const config = DEFAULT_KIT_MAP[id];
            const files = manifest[config.folder] || [];
            const fileName = files[config.index] || files[0];
            const path = fileName ? `/sounds/${config.folder}/${fileName}` : null;

            return {
                id,
                src: path,
                label: config.label,
                defaultKey: config.key,
                fileName: fileName,
                volume: 1.0,
                muteGroup: config.muteGroup || null // Apply default mute group
            };
        });
        setSounds(newKit);
    };

    const addPad = (type, path, fileName) => {
        const id = `${type.toLowerCase()}_${Date.now()}`;
        const newPad = {
            id,
            src: path,
            label: type,
            defaultKey: '', // User sets this later
            fileName,
            volume: 1.0
        };
        setSounds(prev => [...prev, newPad]);
        return id; // Return ID for positioning
    };

    const removePad = (id) => {
        setSounds(prev => prev.filter(s => s.id !== id));
    };

    const clearKit = () => {
        setSounds([]);
    };

    const updatePadSettings = (id, updates) => {
        setSounds(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, ...updates };
            }
            return s;
        }));
    };

    // Preset Management
    const savePreset = (name) => {
        const newPreset = { name, sounds, date: new Date().toISOString() };
        const updatedPresets = [...presets.filter(p => p.name !== name), newPreset];
        setPresets(updatedPresets);
        localStorage.setItem('userKitPresets', JSON.stringify(updatedPresets));
        return true;
    };

    const loadPreset = (name) => {
        const preset = presets.find(p => p.name === name);
        if (preset) {
            setSounds(preset.sounds);
            return true;
        }
        return false;
    };

    const deletePreset = (name) => {
        const updatedPresets = presets.filter(p => p.name !== name);
        setPresets(updatedPresets);
        localStorage.setItem('userKitPresets', JSON.stringify(updatedPresets));
    };

    // Reverb control
    const setReverbAmount = useCallback((amount) => {
        const clampedAmount = Math.max(0, Math.min(100, amount));
        setReverbAmountState(clampedAmount);
        localStorage.setItem('reverbAmount', clampedAmount.toString());

        // Update dry/wet mix
        if (dryGainRef.current && wetGainRef.current) {
            const wet = clampedAmount / 100;
            const dry = 1 - (wet * 0.5); // Keep some dry signal even at 100%

            dryGainRef.current.gain.value = dry;
            wetGainRef.current.gain.value = wet * 0.8; // Scale wet to prevent clipping
        }
    }, []);

    // Apply reverb amount when it changes
    useEffect(() => {
        setReverbAmount(reverbAmount);
    }, [reverbAmount, setReverbAmount]);

    return {
        sounds,
        playSound,
        addPad,
        removePad,
        updatePadSettings,
        clearKit,
        resetToDefault,
        isLoaded,
        presets,
        savePreset,
        loadPreset,
        deletePreset,
        reverbAmount,
        setReverbAmount
    };
};
