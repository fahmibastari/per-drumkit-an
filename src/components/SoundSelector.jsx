import React, { useState, useEffect } from 'react';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';

const SoundSelector = ({ isOpen, onClose, onSelect, currentCategory }) => {
    const [manifest, setManifest] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [previewHowl, setPreviewHowl] = useState(null);
    const [playingFile, setPlayingFile] = useState(null);

    useEffect(() => {
        fetch('/sounds-manifest.json')
            .then(res => res.json())
            .then(data => {
                setManifest(data);
                if (currentCategory && data[currentCategory]) {
                    setSelectedCategory(currentCategory);
                } else {
                    setSelectedCategory(Object.keys(data)[0]);
                }
            })
            .catch(err => console.error("Failed to load sound manifest", err));
    }, [isOpen]);

    const playPreview = (path, fileName) => {
        if (previewHowl) previewHowl.unload();
        const sound = new Howl({
            src: [path],
            onend: () => setPlayingFile(null)
        });
        sound.play();
        setPreviewHowl(sound);
        setPlayingFile(fileName);
    };

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
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}
            >
                <div style={{
                    width: '90%',
                    maxWidth: '1200px',
                    height: '85vh',
                    background: '#1a1a1a', // Matte Dark
                    border: '1px solid #333',
                    borderRadius: '4px', // Less rounded
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111'
                    }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', letterSpacing: '2px', fontFamily: 'Inter, sans-serif', fontWeight: '300', textTransform: 'uppercase' }}>
                                Sound <strong style={{ fontWeight: '700', color: '#d4af37' }}>Library</strong>
                            </h2>
                            <span style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px', display: 'block', letterSpacing: '1px' }}>
                                SELECT SAMPLE FOR KIT
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#888',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.borderColor = '#d4af37';
                                e.currentTarget.style.color = '#d4af37';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.borderColor = '#444';
                                e.currentTarget.style.color = '#888';
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Sidebar */}
                        <div style={{
                            width: '240px',
                            background: '#151515',
                            borderRight: '1px solid #333',
                            padding: '1rem 0',
                            overflowY: 'auto'
                        }}>
                            <h3 style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '1.5rem', letterSpacing: '1px' }}>Categories</h3>
                            {Object.keys(manifest).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 24px',
                                        textAlign: 'left',
                                        background: selectedCategory === cat ? '#222' : 'transparent',
                                        color: selectedCategory === cat ? '#d4af37' : '#888',
                                        border: 'none',
                                        borderLeft: `3px solid ${selectedCategory === cat ? '#d4af37' : 'transparent'}`,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: selectedCategory === cat ? '600' : '400',
                                        transition: 'all 0.2s',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    {cat} <span style={{ float: 'right', fontSize: '0.8rem', opacity: 0.5 }}>{manifest[cat].length}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#1a1a1a' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {selectedCategory && manifest[selectedCategory]?.map((file) => {
                                    const isPlaying = playingFile === file;
                                    return (
                                        <motion.div
                                            key={file}
                                            layoutId={file}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => playPreview(`/sounds/${selectedCategory}/${file}`, file)}
                                            style={{
                                                background: '#202020',
                                                borderRadius: '8px',
                                                border: `1px solid ${isPlaying ? '#d4af37' : '#333'}`,
                                                padding: '1.2rem',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s'
                                            }}
                                            whileHover={{ y: -2, borderColor: '#555' }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: isPlaying ? '#d4af37' : '#111',
                                                marginBottom: '1rem',
                                                color: isPlaying ? '#000' : '#888',
                                                border: '1px solid #333'
                                            }}>
                                                {isPlaying ? '🔊' : '▶'}
                                            </div>

                                            <div style={{ fontSize: '0.85rem', color: '#ddd', fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Inter, sans-serif' }}>
                                                {file.replace('[HR] ', '').replace('.wav', '')}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'monospace' }}>
                                                WAV • 44.1kHz
                                            </div>

                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(`/sounds/${selectedCategory}/${file}`, file);
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: 'transparent',
                                                        color: '#d4af37',
                                                        border: '1px solid #d4af37',
                                                        borderRadius: '4px',
                                                        fontWeight: '600',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => {
                                                        e.currentTarget.style.background = '#d4af37';
                                                        e.currentTarget.style.color = '#000';
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = '#d4af37';
                                                    }}
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SoundSelector;
