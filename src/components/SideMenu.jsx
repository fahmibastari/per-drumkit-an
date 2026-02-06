import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconFolder, IconSettings, IconPlus, IconRefresh,
    IconTrash, IconCheck, IconClose
} from './Icons';

const SideMenu = ({
    isOpen, onClose, editMode, setEditMode,
    onOpenPresets, onOpenAddPad, onClear, onReset
}) => {

    // Helper for menu items
    const MenuItem = ({ onClick, label, icon, color = '#eee', danger = false }) => (
        <button
            onClick={() => { onClick(); onClose(); }}
            style={{
                width: '100%',
                padding: '15px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #222',
                color: danger ? '#ff4444' : color,
                textAlign: 'left',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                textTransform: 'uppercase'
            }}
        >
            <span style={{ width: '25px', display: 'flex', justifyContent: 'center' }}>{icon}</span>
            <span style={{ fontWeight: '500' }}>{label}</span>
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            zIndex: 4000,
                            backdropFilter: 'blur(3px)'
                        }}
                    />

                    {/* Menu Pane */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed', top: 0, bottom: 0, left: 0,
                            width: '280px',
                            background: '#1a1a1a',
                            borderRight: '1px solid #333',
                            zIndex: 4001,
                            boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Menu Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #333',
                            background: '#111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontFamily: 'Inter', letterSpacing: '2px' }}>
                                DRUM <strong style={{ color: '#d4af37' }}>MENU</strong>
                            </h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
                                <IconClose size={24} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {!editMode ? (
                                <>
                                    <MenuItem onClick={onOpenPresets} label="Presets" icon={<IconFolder size={20} color="#d4af37" />} color="#d4af37" />
                                    <MenuItem onClick={() => setEditMode(true)} label="Edit Layout" icon={<IconSettings size={20} />} />
                                </>
                            ) : (
                                <>
                                    <div style={{ padding: '15px 20px', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Edit Actions
                                    </div>
                                    <MenuItem onClick={onOpenAddPad} label="Add New Pad" icon={<IconPlus size={20} color='#d4af37' />} color="#d4af37" />
                                    <MenuItem onClick={onReset} label="Reset Kit" icon={<IconRefresh size={20} />} />
                                    <MenuItem onClick={onClear} label="Clear All" icon={<IconTrash size={20} color='#ff4444' />} danger />
                                    <div style={{ borderTop: '1px solid #333', marginTop: '10px' }}></div>
                                    <MenuItem onClick={() => setEditMode(false)} label="Finish Editing" icon={<IconCheck size={20} color='#00ff99' />} color="#00ff99" />
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px', borderTop: '1px solid #333', color: '#444', fontSize: '0.7rem', textAlign: 'center', fontFamily: 'Inter' }}>
                            CYBERDRUM v2.0
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SideMenu;
