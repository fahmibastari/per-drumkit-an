import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion } from 'framer-motion';

const DrumPad = forwardRef(({ sound, play, mappedKey, editMode, onPositionChange, position, color, onEditSound, size = 120 }, ref) => {
    const [isActive, setIsActive] = useState(false);
    const lastTouchTime = useRef(0);

    const trigger = () => {
        if (play) play(sound.id);
        setIsActive(true);
        setTimeout(() => setIsActive(false), 100);
    };

    useImperativeHandle(ref, () => ({
        trigger
    }));

    const padStyle = {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isActive ? '#d4af37' : '#1e1e1e', // Gold when active, Matte Dark Grey default
        border: isActive ? '1px solid #d4af37' : '1px solid #333',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: editMode ? 'grab' : 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: isActive ? 100 : 10,
        boxShadow: isActive
            ? '0 0 20px rgba(212, 175, 55, 0.4)'
            : '0 4px 6px rgba(0,0,0,0.3)',
        transition: 'all 0.1s ease-out'
    };

    const content = (
        <motion.div
            className="drum-pad-visual"
            style={padStyle}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => {
                // e.preventDefault(); // Might be passive, so we use timestamp lock
                lastTouchTime.current = Date.now();
                if (!editMode) trigger();
            }}
            onMouseDown={(e) => {
                // Ignore mouse down if touch happened recently (ghost click)
                if (Date.now() - lastTouchTime.current < 350) return;
                if (!editMode) trigger();
            }}
            animate={{
                scale: isActive ? 0.95 : 1,
            }}
            transition={{ type: "tween", duration: 0.1 }}
        >
            <div style={{
                width: '80%',
                height: '80%',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {/* Top Indicator Light */}
                <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isActive ? '#fff' : '#333',
                    marginBottom: '15px',
                    boxShadow: isActive ? '0 0 5px #fff' : 'none',
                    transition: 'background 0.05s'
                }} />

                <span style={{
                    color: isActive ? '#000' : '#eee',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    marginBottom: '4px',
                    letterSpacing: '1px',
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                }}>
                    {sound.label}
                </span>

                {sound.fileName && (
                    <span style={{
                        fontSize: '0.6rem',
                        color: isActive ? '#333' : '#666',
                        marginBottom: '4px',
                        maxWidth: '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {sound.fileName.replace('[HR] ', '').replace('.wav', '')}
                    </span>
                )}

                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    fontSize: '0.7rem',
                    color: isActive ? '#000' : '#444',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    opacity: 0.7
                }}>
                    {mappedKey === ' ' ? 'SPACE' : mappedKey ? mappedKey.toUpperCase() : ''}
                </div>
            </div>

            {editMode && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // prevent drag start if possible, though Draggable usually handles handle
                        onEditSound(sound);
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        onEditSound(sound);
                    }}
                    style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#d4af37',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        zIndex: 200,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                    }}
                >
                    ⚙
                </button>
            )}
        </motion.div>
    );

    const nodeRef = useRef(null);



    if (editMode) {
        return (
            <Draggable
                nodeRef={nodeRef}
                position={position}
                onStop={(e, data) => onPositionChange(sound.id, { x: data.x, y: data.y })}
                bounds="parent"
            >
                <div ref={nodeRef} style={{ position: 'absolute' }}>{content}</div>
            </Draggable>
        );
    }

    return (
        <div style={{ position: 'absolute', left: position.x, top: position.y, touchAction: 'none' }}>
            {content}
        </div>
    );
});

DrumPad.displayName = "DrumPad";

export default DrumPad;
