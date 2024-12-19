'use client';
import { useState, useEffect, useRef } from 'react';

// Event name constant for emote changes
const EMOTE_CHANGE_EVENT = 'emoteChange';

export default function EmoteOverlay({ character }) {
  const [currentEmote, setCurrentEmote] = useState('neutral');
  const [videoIndex, setVideoIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [dragStart, setDragStart] = useState(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const videoWidth = 200;
    const videoHeight = 200;

    // Calculate new position relative to the container
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Calculate bounds relative to the container and window
    const minX = -parentRect.left; // Allow dragging to the left edge of the window
    const maxX = parentRect.width - videoWidth;
    const minY = 0;
    const maxY = parentRect.height - videoHeight;

    // Constrain to bounds
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    // When emote changes, try to load the next video in sequence
    const tryNextVideo = async () => {
      const nextIndex = (videoIndex + 1) % 3; // Try up to 3 videos (0.mp4, 1.mp4, 2.mp4)
      try {
        const response = await fetch(`/videos/${character}/${currentEmote}/${nextIndex}.mp4`, { method: 'HEAD' });
        if (response.ok) {
          setVideoIndex(nextIndex);
        } else {
          setVideoIndex(0); // Fallback to first video if next doesn't exist
        }
      } catch {
        setVideoIndex(0);
      }
    };
    
    tryNextVideo();
  }, [currentEmote]);

  // Subscribe to emote events from ParsedText
  useEffect(() => {
    const handleEmoteChange = (event) => {
      if (event.detail?.emote) {
        setCurrentEmote(event.detail.emote);
        if (videoRef.current) {
          videoRef.current.play();
        }
      }
    };

    window.addEventListener(EMOTE_CHANGE_EVENT, handleEmoteChange);
    return () => window.removeEventListener(EMOTE_CHANGE_EVENT, handleEmoteChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="emote-overlay-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none' // Allow clicking through the container
      }}
    >
      <div 
        className="emote-overlay"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '4px',
          transition: isDragging ? 'none' : 'transform 0.1s ease',
          pointerEvents: 'auto', // Enable interactions with the overlay
          background: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
          borderRadius: '8px',
          backdropFilter: 'blur(2px)' // Add slight blur effect
        }}
      >
        <video
          ref={videoRef}
          src={`/videos/${character}/${currentEmote}/${videoIndex}.mp4`}
          style={{ 
            width: '200px', 
            height: '200px', 
            borderRadius: '8px',
            mixBlendMode: 'screen', // Make video more transparent
            opacity: 0.9 // Slightly transparent
          }}
          autoPlay
          loop
          muted
        />
      </div>
    </div>
  );
}
