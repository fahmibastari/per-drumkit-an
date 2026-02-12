import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconFolder } from './Icons';

const PadSettingsModal = ({ isOpen, onClose, pad, onUpdate, onDelete, onOpenSoundSelector, onUpdateSize, currentSize }) => {
    if (!isOpen || !pad) return null;

    const [keyBind, setKeyBind] = useState(pad.defaultKey || '');
    const [volume, setVolume] = useState(pad.volume || 1.0);
    const [listening, setListening] = useState(false);

    useEffect(() => {
        setKeyBind(pad.defaultKey || '');
        setVolume(pad.volume || 1.0);
    }, [pad]);

    useEffect(() => {
        if (listening) {
            const handleKeyDown = (e) => {
                e.preventDefault();
                const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
                setKeyBind(key);
                setListening(false);
                onUpdate(pad.id, { defaultKey: key });
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [listening, pad.id, onUpdate]);

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        onUpdate(pad.id, { volume: val });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none' // Allow click-through to close via backdrop in parent if needed, but here we block
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', pointerEvents: 'auto' }} onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        padding: '2rem',
                        borderRadius: '4px',
                        width: '320px',
                        pointerEvents: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 2600
                    }}
                >
                    <h3 style={{ margin: '0 0 20px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                        PAD SETTINGS <span style={{ color: '#d4af37', fontSize: '0.8em', marginLeft: '5px' }}>{pad.label}</span>
                    </h3>

                    {/* Sound Selection */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sound Source</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{
                                flex: 1,
                                background: '#111',
                                padding: '10px',
                                borderRadius: '4px',
                                color: '#ccc',
                                border: '1px solid #333',
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'monospace'
                            }}>
                                {pad.fileName || 'No Sound'}
                            </div>
                            <button
                                onClick={() => onOpenSoundSelector(pad.id)}
                                style={{
                                    background: '#333', border: '1px solid #444', color: '#fff',
                                    padding: '10px 14px', borderRadius: '4px', cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#444'}
                                onMouseOut={e => e.currentTarget.style.background = '#333'}
                            >
                                <IconFolder size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Key Binding */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Key Trigger</label>
                        <button
                            onClick={() => setListening(true)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: listening ? '#d4af37' : '#111',
                                border: listening ? '1px solid #d4af37' : '1px solid #333',
                                color: listening ? '#000' : '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                                fontFamily: 'monospace'
                            }}
                        >
                            {listening ? 'PRESS ANY KEY...' : (keyBind === ' ' ? 'SPACE' : keyBind.toUpperCase() || 'NONE')}
                        </button>
                    </div>

                    {/* Volume */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Volume: {Math.round(volume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#d4af37' }}
                        />
                    </div>

                    {/* Size */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Size: {currentSize}px
                        </label>
                        <input
                            type="range"
                            min="60" max="200" step="10"
                            value={currentSize}
                            onChange={(e) => onUpdateSize(pad.id, parseInt(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#d4af37' }}
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Layer (Stack Order)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '5px', borderRadius: '4px', border: '1px solid #333' }}>
                            <button
                                onClick={() => onUpdate(pad.id, { zIndex: Math.max(1, (pad.zIndex || 10) - 1) })}
                                style={{
                                    background: 'transparent', color: '#888', border: '1px solid #444',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Send Backward"
                            >
                                ▼
                            </button>

                            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: '1rem', color: '#d4af37' }}>
                                {pad.zIndex || 10}
                            </div>

                            <button
                                onClick={() => onUpdate(pad.id, { zIndex: Math.min(100, (pad.zIndex || 10) + 1) })}
                                style={{
                                    background: 'transparent', color: '#fff', border: '1px solid #444',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Bring Forward"
                            >
                                ▲
                            </button>
                        </div>
                    </div>

                    {/* Mute Group (Choke) */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Mute Group (Choke)
                        </label>
                        <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '8px', fontStyle: 'italic' }}>
                            *Pads in the same group cut each other off (e.g. Open/Close Hat).
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '5px', borderRadius: '4px', border: '1px solid #333' }}>
                            <button
                                onClick={() => onUpdate(pad.id, { muteGroup: Math.max(0, (pad.muteGroup || 0) - 1) })}
                                style={{
                                    background: 'transparent', color: '#888', border: '1px solid #444',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Previous Group"
                            >
                                ▼
                            </button>

                            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: '1rem', color: pad.muteGroup ? '#ff4444' : '#666' }}>
                                {pad.muteGroup ? `Group ${pad.muteGroup}` : 'None'}
                            </div>

                            <button
                                onClick={() => onUpdate(pad.id, { muteGroup: Math.min(8, (pad.muteGroup || 0) + 1) })}
                                style={{
                                    background: 'transparent', color: '#fff', border: '1px solid #444',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Next Group"
                            >
                                ▲
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => onDelete(pad.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#888',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                letterSpacing: '1px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.borderColor = '#ff4444';
                                e.currentTarget.style.color = '#ff4444';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.borderColor = '#444';
                                e.currentTarget.style.color = '#888';
                            }}
                        >
                            DELETE
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: '#d4af37',
                                border: 'none',
                                color: '#000',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                letterSpacing: '1px'
                            }}
                        >
                            DONE
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PadSettingsModal;
