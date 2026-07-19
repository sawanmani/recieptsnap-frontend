'use client';
import { useRef } from 'react';

export default function CursorScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const progress = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = progress * video.duration;
  };

  return (
    <div onMouseMove={handleMouseMove} className="absolute inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster="/images/poster.jpg"
        className="w-full h-full object-cover"
      >
        <source src="/videos/bg-optimized.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay so hero text stays readable over the video */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}