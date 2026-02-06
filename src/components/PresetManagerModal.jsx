import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PresetManagerModal = ({ isOpen, onClose, onSave, onLoad, onDelete, presets }) => {
    const [mode, setMode] = useState('LOAD'); // 'LOAD' or 'SAVE'
    const [saveName, setSaveName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!saveName.trim()) return;
        onSave(saveName);
        setSaveName('');
        setMode('LOAD');
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 3500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.8)'
            }}>
                <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        width: '400px',
                        maxHeight: '80vh', // Limit height
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 3600
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '20px', background: '#111', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Inter', letterSpacing: '2px', fontWeight: '300' }}>
                            KIT <strong style={{ color: '#d4af37', fontWeight: '700' }}>PRESETS</strong>
                        </h3>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                        <button
                            onClick={() => setMode('LOAD')}
                            style={{ flex: 1, padding: '15px', background: mode === 'LOAD' ? '#222' : 'transparent', color: mode === 'LOAD' ? '#d4af37' : '#666', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            LOAD
                        </button>
                        <button
                            onClick={() => setMode('SAVE')}
                            style={{ flex: 1, padding: '15px', background: mode === 'SAVE' ? '#222' : 'transparent', color: mode === 'SAVE' ? '#d4af37' : '#666', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            SAVE
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', overflowY: 'auto' }}>
                        {mode === 'SAVE' ? (
                            <div>
                                <h4 style={{ color: '#aaa', marginTop: 0 }}>Save Current Kit</h4>
                                <input
                                    type="text"
                                    placeholder="Enter Preset Name..."
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#111',
                                        border: '1px solid #333',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        marginBottom: '15px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    onClick={handleSave}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#d4af37',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    SAVE PRESET
                                </button>
                            </div>
                        ) : (
                            <div>
                                {(presets || []).length === 0 ? (
                                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No Saved Presets</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {presets.map(p => (
                                            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
                                                <div>
                                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{p.name}</div>
                                                    <div style={{ color: '#666', fontSize: '0.7rem' }}>{new Date(p.date).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => { onLoad(p.name); onClose(); }}
                                                        style={{ background: '#d4af37', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '2px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                                    >
                                                        LOAD
                                                    </button>
                                                    <button
                                                        onClick={() => { if (confirm('Delete preset?')) onDelete(p.name); }}
                                                        style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '5px 10px', borderRadius: '2px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        DEL
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PresetManagerModal;
