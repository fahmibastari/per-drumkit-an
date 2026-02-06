import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';

const PAD_TYPES = [
    { id: 'kick', label: 'Kick', color: '#ff0055' },
    { id: 'snare', label: 'Snare', color: '#00ffff' },
    { id: 'hat_close', label: 'Hat Closed', color: '#ffe600' },
    { id: 'hat_open', label: 'Hat Open', color: '#ffaa00' },
    { id: 'tom', label: 'Tom', color: '#00ff99' },
    { id: 'crash', label: 'Crash', color: '#ff3300' },
    { id: 'ride', label: 'Ride', color: '#bd00ff' },
    { id: 'clap', label: 'Clap', color: '#ff00ff' },
];

const AddPadWizard = ({ isOpen, onClose, onAdd }) => {
    const [step, setStep] = useState(1); // 1: Type Select, 2: Sound Select
    const [selectedType, setSelectedType] = useState(null);
    const [manifest, setManifest] = useState({});
    const [previewHowl, setPreviewHowl] = useState(null);
    const [playingFile, setPlayingFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setSelectedType(null);
            return;
        }

        fetch('/sounds-manifest.json')
            .then(res => res.json())
            .then(data => setManifest(data));
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

    const handleSelectType = (type) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleAdd = (file) => {
        // Map simplified IDs to Manifest Categories
        let category = '';
        if (selectedType.id === 'kick') category = 'KICKS';
        else if (selectedType.id === 'snare') category = 'SNARES';
        else if (selectedType.id === 'hat_close' || selectedType.id === 'hat_open') category = 'HATS';
        else if (selectedType.id === 'tom') category = 'TOMS';
        else if (selectedType.id === 'crash') category = 'CRASHES';
        else if (selectedType.id === 'ride') category = 'RIDES';
        else if (selectedType.id === 'clap') category = 'CLAPS';

        // If exact match not found (e.g. hat_close vs hat_open both mapped to HATS), its fine, user selects file

        const path = `/sounds/${category}/${file}`;
        onAdd(selectedType.id, path, file);
        onClose();
    };

    // Helper to get manifest category key from type
    const getManifestKey = (typeId) => {
        if (!typeId) return null;
        if (typeId === 'kick') return 'KICKS';
        if (typeId === 'snare') return 'SNARES';
        if (typeId.includes('hat')) return 'HATS';
        if (typeId === 'tom') return 'TOMS';
        if (typeId === 'crash') return 'CRASHES';
        if (typeId === 'ride') return 'RIDES';
        if (typeId === 'clap') return 'CLAPS';
        return 'KICKS'; // fallback
    };

    if (!isOpen) return null;

    const currentManifestKey = getManifestKey(selectedType?.id);
    const soundsList = currentManifestKey ? manifest[currentManifestKey] : [];

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                backdropFilter: 'blur(5px)'
            }}>
                <div style={{
                    width: '600px',
                    height: '70vh',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111'
                    }}>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontFamily: 'Inter, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Add New Pad <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '10px' }}>STEP {step} OF 2</span>
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent', border: 'none', color: '#666',
                                fontSize: '1.5rem', cursor: 'pointer',
                            }}
                            onMouseOver={e => e.currentTarget.style.color = '#fff'}
                            onMouseOut={e => e.currentTarget.style.color = '#666'}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                        {step === 1 ? (
                            <>
                                <h3 style={{ color: '#d4af37', marginTop: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Select Pad Type</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                    {['KICK', 'SNARE', 'HI-HAT', 'TOM', 'CRASH', 'RIDE', 'CLAP', 'PERC'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type);
                                                setStep(2);
                                                // Pre-select category based on type
                                                if (type === 'HI-HAT') setSelectedCategory('HATS');
                                                else if (type === 'PERC') setSelectedCategory('CLAPS'); // approximation
                                                else setSelectedCategory(type + 'S');
                                            }}
                                            style={{
                                                padding: '20px',
                                                background: '#222',
                                                border: '1px solid #333',
                                                color: '#fff',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                                transition: 'all 0.2s',
                                                letterSpacing: '1px'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.borderColor = '#d4af37';
                                                e.currentTarget.style.color = '#d4af37';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.borderColor = '#333';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ color: '#d4af37', margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Sound</h3>
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
                                    >
                                        BACK
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                                    {/* Categories */}
                                    <div style={{ width: '150px', borderRight: '1px solid #333', overflowY: 'auto' }}>
                                        {Object.keys(manifest).map(cat => (
                                            <div
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                style={{
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    color: selectedCategory === cat ? '#d4af37' : '#888',
                                                    fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {cat}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Files */}
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {selectedCategory && manifest[selectedCategory]?.map(file => (
                                            <div
                                                key={file}
                                                onClick={() => playPreview(`/sounds/${selectedCategory}/${file}`, file)}
                                                style={{
                                                    padding: '10px',
                                                    borderBottom: '1px solid #222',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: playingFile === file ? '#222' : 'transparent',
                                                    color: playingFile === file ? '#fff' : '#aaa'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                                    {file.replace('[HR] ', '').replace('.wav', '')}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAdd(selectedType, `/sounds/${selectedCategory}/${file}`, file);
                                                        onClose();
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#d4af37',
                                                        color: '#000',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.75rem',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    ADD
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default AddPadWizard;
