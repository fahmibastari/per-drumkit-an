import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import DrumPad from './DrumPad';
import SoundSelector from './SoundSelector';
import PadSettingsModal from './PadSettingsModal';
import AddPadWizard from './AddPadWizard';
import PresetManagerModal from './PresetManagerModal';
import SideMenu from './SideMenu';
import { IconMenu, IconCheck, IconPlus } from './Icons';

const PAD_COLORS = {
    kick: '#ff0055',    // Pink
    snare: '#00ffff',   // Cyan
    hat_close: '#ffe600', // Yellow
    hat_open: '#ffaa00', // Orange-Yellow
    tom: '#00ff99',     // Green
    tom1: '#00ff99',    // Green
    tom2: '#00ccff',    // Blue-Green
    tom3: '#0066ff',    // Blue
    crash: '#ff3300',   // Red-Orange
    crash1: '#ff3300',  // Red-Orange
    crash2: '#ff6600',  // Orange
    ride: '#bd00ff',    // Purple
    clap: '#ff00ff'     // Magenta
};

const DrumMachine = () => {
    const {
        sounds, playSound, updatePadSettings, addPad, removePad,
        clearKit, resetToDefault, isLoaded,
        presets, savePreset, loadPreset, deletePreset
    } = useAudio();
    const [editMode, setEditMode] = useState(false);
    const [positions, setPositions] = useState({});
    const [padSizes, setPadSizes] = useState({});

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Modals
    const [selectorPadId, setSelectorPadId] = useState(null);
    const [settingsPadId, setSettingsPadId] = useState(null);
    const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const padRefs = useRef({});

    // Initialize positions
    useEffect(() => {
        const initLayout = () => {
            const savedPos = localStorage.getItem('padPositions');
            if (savedPos) setPositions(JSON.parse(savedPos));

            const savedSizes = localStorage.getItem('padSizes');
            if (savedSizes) setPadSizes(JSON.parse(savedSizes));
        };
        initLayout();
    }, []);

    // Effect to ensure new pads have positions
    useEffect(() => {
        if (sounds.length > 0) {
            setPositions(prev => {
                const newPos = { ...prev };
                let changed = false;
                sounds.forEach(s => {
                    if (!newPos[s.id]) {
                        // Place new pads in center
                        newPos[s.id] = { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 };
                        changed = true;
                    }
                });
                if (changed) {
                    // Update storage immediately to prevent jump
                    localStorage.setItem('padPositions', JSON.stringify(newPos));
                    return newPos;
                }
                return prev;
            });
        }
    }, [sounds]);

    const handleKeydown = (e) => {
        if (editMode || selectorPadId || settingsPadId || isAddWizardOpen) return;

        // Find sound mapped to key
        const sound = sounds.find(s => {
            if (!s.defaultKey) return false;
            const key = e.key.toLowerCase();
            return s.defaultKey === key || (s.defaultKey === ' ' && e.code === 'Space');
        });

        if (sound) {
            if (padRefs.current[sound.id]) {
                padRefs.current[sound.id].trigger();
            } else {
                playSound(sound.id); // Fallback if ref missing
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [editMode, sounds, selectorPadId, settingsPadId, isAddWizardOpen]);

    const updatePosition = (id, pos) => {
        const newPositions = { ...positions, [id]: pos };
        setPositions(newPositions);
        localStorage.setItem('padPositions', JSON.stringify(newPositions));
    };

    const updatePadSize = (id, size) => {
        const newSizes = { ...padSizes, [id]: size };
        setPadSizes(newSizes);
        localStorage.setItem('padSizes', JSON.stringify(newSizes));
    };

    const handleReset = () => {
        if (confirm('Reset to default kit? This will remove all custom pads.')) {
            resetToDefault();
            localStorage.removeItem('padPositions');
            window.location.reload();
        }
    };

    const handleClear = () => {
        if (confirm('Remove ALL pads?')) {
            clearKit();
            setPositions({});
            setPadSizes({});
            localStorage.removeItem('padPositions');
            localStorage.removeItem('padSizes');
        }
    }

    const handleSoundSelect = (path, filename) => {
        if (selectorPadId) {
            // Check if we came from settings or direct (direct support kept for legacy/refactor ease)
            updatePadSettings(selectorPadId, { src: path, fileName: filename });
            setSelectorPadId(null);
        }
    };

    const handleAddPad = (type, path, fileName) => {
        addPad(type, path, fileName);
    };

    // Helper to get category
    const getCategoryForPad = (id) => {
        if (!id) return null;
        if (id.includes('kick')) return 'KICKS';
        if (id.includes('snare')) return 'SNARES';
        if (id.includes('hat')) return 'HATS';
        if (id.includes('tom')) return 'TOMS';
        if (id.includes('crash')) return 'CRASHES';
        if (id.includes('ride')) return 'RIDES';
        if (id.includes('clap')) return 'CLAPS';
        return null;
    }

    // Simplified color logic - mostly relying on DrumPad component for styling now
    // But passing base color for accents might still be useful
    const getPadColor = (sound) => {
        if (PAD_COLORS[sound.id]) return PAD_COLORS[sound.id];
        const type = Object.keys(PAD_COLORS).find(key => sound.id.startsWith(key));
        return type ? PAD_COLORS[type] : '#ffffff';
    }

    if (!isLoaded) return <div style={{ color: '#888', textAlign: 'center', paddingTop: '50vh', fontFamily: 'Inter', letterSpacing: '2px' }}>LOADING STUDIO...</div>;

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: '#111', // Matte Black
            touchAction: 'none'
        }}>
            {/* Header / Toolbar */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: isMobile ? '60px' : '80px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '0 15px' : '0 40px',
                borderBottom: '1px solid #222',
                background: 'rgba(17, 17, 17, 0.95)',
                transition: 'all 0.3s'
            }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Hamburger Button (Always Visible or Hidden in Edit Mode? kept visible for menu access) */}
                    {isMobile && (
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: '#d4af37', fontSize: '1.5rem', cursor: 'pointer',
                                padding: '5px', display: 'flex'
                            }}
                        >
                            <IconMenu size={28} />
                        </button>
                    )}

                    {!isMobile && (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>D</div>
                    )}

                    {!isMobile && (
                        <h1 style={{ color: '#eee', margin: 0, fontSize: '1.2rem', fontFamily: 'Inter, sans-serif', fontWeight: '300', letterSpacing: '4px' }}>
                            PERPAHMI<strong style={{ fontWeight: '700', color: '#d4af37' }}>DRUM</strong> <span style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>PRO STUDIO</span>
                        </h1>
                    )}
                    {isMobile && !editMode && (
                        <h1 style={{ color: '#eee', margin: 0, fontSize: '1rem', fontFamily: 'Inter, sans-serif', fontWeight: '300', letterSpacing: '2px' }}>
                            PERDRUMKITAN
                        </h1>
                    )}
                    {isMobile && editMode && (
                        <h1 style={{ color: '#d4af37', margin: 0, fontSize: '1rem', fontFamily: 'Inter, sans-serif', fontWeight: '700', letterSpacing: '2px' }}>
                            EDITING
                        </h1>
                    )}
                </div>

                {/* Mobile Edit Toolbar */}
                {isMobile && editMode && (
                    <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
                        <button
                            onClick={() => setIsAddWizardOpen(true)}
                            style={{
                                background: '#333', border: '1px solid #444',
                                color: '#d4af37', borderRadius: '50%', width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <IconPlus size={20} />
                        </button>
                        <button
                            onClick={() => setEditMode(false)}
                            style={{
                                background: '#d4af37', border: 'none',
                                color: '#000', borderRadius: '4px',
                                padding: '5px 15px', fontWeight: 'bold', fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                        >
                            <IconCheck size={18} /> DONE
                        </button>
                    </div>
                )}

                {/* Desktop Menu - Hidden on Mobile */}
                {!isMobile && (
                    <div style={{ display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
                        {!editMode ? (
                            <>
                                <button
                                    onClick={() => setIsPresetModalOpen(true)}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#aaa',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.color = '#d4af37'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa'; }}
                                >
                                    PRESETS
                                </button>
                                <button
                                    onClick={() => setEditMode(true)}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#aaa',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.color = '#d4af37'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa'; }}
                                >
                                    CUSTOMIZE LAYOUT
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsAddWizardOpen(true)}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#d4af37',
                                        border: 'none',
                                        color: '#000',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    + ADD PAD
                                </button>
                                <button
                                    onClick={handleClear}
                                    style={{
                                        padding: '10px 15px',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#888',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem'
                                    }}
                                    title="Clear All"
                                    onMouseOver={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}
                                >
                                    🗑️
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#888',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}
                                >
                                    RESET
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        padding: '10px 24px',
                                        background: '#fff',
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
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Hint */}
            <div style={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#444',
                pointerEvents: 'none',
                textAlign: 'center',
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>
                {editMode ? 'Drag to Organize • Configure via Icons' : 'Studio Mode Active'}
            </div>

            {/* Pads */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {sounds.map(sound => (
                    positions[sound.id] ? (
                        <DrumPad
                            key={sound.id}
                            ref={el => padRefs.current[sound.id] = el}
                            sound={sound}
                            play={playSound}
                            mappedKey={sound.defaultKey}
                            editMode={editMode}
                            position={positions[sound.id]}
                            onPositionChange={updatePosition}
                            size={padSizes[sound.id] || 120}
                            color={getPadColor(sound)}
                            onEditSound={() => setSettingsPadId(sound.id)}
                        />
                    ) : null
                ))}
            </div>

            {/* Subtle Grid in Edit Mode */}
            {editMode && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.3
                }} />
            )}

            <SoundSelector
                isOpen={!!selectorPadId}
                onClose={() => setSelectorPadId(null)}
                onSelect={handleSoundSelect}
                currentCategory={selectorPadId ? getCategoryForPad(selectorPadId) : null}
            />

            <PadSettingsModal
                isOpen={!!settingsPadId}
                pad={sounds.find(s => s.id === settingsPadId)}
                onClose={() => setSettingsPadId(null)}
                onUpdate={updatePadSettings}
                onDelete={(id) => {
                    removePad(id);
                    setSettingsPadId(null);
                }}
                onOpenSoundSelector={(id) => {
                    // Let's close settings, open selector.
                    setSettingsPadId(null);
                }}
                onUpdateSize={updatePadSize}
                currentSize={settingsPadId ? (padSizes[settingsPadId] || 120) : 120}
            />

            <AddPadWizard
                isOpen={isAddWizardOpen}
                onClose={() => setIsAddWizardOpen(false)}
                onAdd={handleAddPad}
            />

            <PresetManagerModal
                isOpen={isPresetModalOpen}
                onClose={() => setIsPresetModalOpen(false)}
                presets={presets}
                onSave={savePreset}
                onLoad={loadPreset}
                onDelete={deletePreset}
            />

            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                editMode={editMode}
                setEditMode={setEditMode}
                onOpenPresets={() => setIsPresetModalOpen(true)}
                onOpenAddPad={() => setIsAddWizardOpen(true)}
                onClear={handleClear}
                onReset={handleReset}
            />
        </div>
    );
};

export default DrumMachine;
