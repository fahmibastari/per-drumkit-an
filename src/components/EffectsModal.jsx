import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EffectsModal = ({ isOpen, onClose, reverbAmount, setReverbAmount }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}
            >
                <div
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', pointerEvents: 'auto', backdropFilter: 'blur(5px)' }}
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        background: '#1a1a1a',
                        border: '1px solid #d4af37',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        pointerEvents: 'auto',
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
                        position: 'relative',
                        zIndex: 3100,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111'
                    }}>
                        <h2 style={{ margin: 0, color: '#d4af37', fontSize: '1.2rem', fontFamily: 'Inter', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            STUDIO EFFECTS
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '30px',
                        flex: 1,
                        color: '#eee',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {/* Reverb Control */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Reverb
                                </label>
                                <div style={{
                                    background: '#111',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #333',
                                    fontFamily: 'monospace',
                                    color: '#d4af37',
                                    fontSize: '0.9rem',
                                    minWidth: '50px',
                                    textAlign: 'center'
                                }}>
                                    {Math.round(reverbAmount)}%
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={reverbAmount}
                                onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
                                style={{
                                    width: '100%',
                                    cursor: 'pointer',
                                    accentColor: '#d4af37',
                                    height: '6px'
                                }}
                            />

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '8px',
                                fontSize: '0.7rem',
                                color: '#555'
                            }}>
                                <span>DRY</span>
                                <span>WET</span>
                            </div>
                        </div>

                        {/* Info Text */}
                        <div style={{
                            padding: '15px',
                            background: '#111',
                            borderRadius: '6px',
                            border: '1px solid #222',
                            fontSize: '0.8rem',
                            lineHeight: '1.5',
                            color: '#888'
                        }}>
                            <div style={{ color: '#d4af37', marginBottom: '8px', fontWeight: 'bold' }}>💡 Studio Tip</div>
                            Reverb adds spatial depth to your drum sound. Start at 20-30% for subtle room ambience, or go 60%+ for a massive hall sound.
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div style={{ padding: '15px', background: '#111', borderTop: '1px solid #333' }}>
                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#d4af37',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#000',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
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

export default EffectsModal;
