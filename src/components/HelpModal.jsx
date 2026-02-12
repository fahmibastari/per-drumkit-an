import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: "🥁 Playing",
            content: "Tap any pad to play sound. Use your keyboard keys (mapped on each pad) for desktop play."
        },
        {
            title: "✏️ Edit Mode",
            content: "Open the Menu and toggle 'Edit Mode' to unlock the studio. In this mode, you can drag pads to move them and resize them using the slider in settings."
        },
        {
            title: "⚙️ Pad Settings",
            content: "In Edit Mode, tap the Gear icon on any pad. Here you can change the sound file, volume, pitch, and keybind."
        },
        {
            title: "🥞 Layering (Stacking)",
            content: "Want to stack a Snare on top of a Kick? Use the 'Layer Order' controls in Pad Settings. Higher numbers sit on top of lower numbers."
        },
        {
            title: "✂️ Hi-Hat Choke (Mute Groups)",
            content: "To make a closed Hi-Hat cut off an open Hi-Hat, assign them both to the SAME 'Mute Group' number in Pad Settings (e.g. Group 1)."
        },
        {
            title: "💾 Presets",
            content: "Save your custom layouts and kits! Open the Menu -> Presets to save your current setup or load a previous one."
        },
        {
            title: "➕ Adding Pads",
            content: "In Edit Mode, use the floating '+' button to add new pads (Kicks, Snares, Cymbals, etc.) to your kit."
        }
    ];

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
                        maxWidth: '500px',
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
                            STUDIO GUIDE
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
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1,
                        color: '#eee',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {sections.map((section, index) => (
                            <div key={index} style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: index < sections.length - 1 ? '1px solid #222' : 'none' }}>
                                <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {section.title}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#aaa' }}>
                                    {section.content}
                                </p>
                            </div>
                        ))}

                        <div style={{ textAlign: 'center', marginTop: '20px', color: '#444', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Perdrumkitan PRO Studio v2.0
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
                            GOT IT!
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HelpModal;
