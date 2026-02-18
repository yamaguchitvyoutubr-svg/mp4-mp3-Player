
import React, { useRef, useEffect, useState } from 'react';
import { VideoFile } from '../types';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, VolumeIcon, RewindIcon, FastForwardIcon, FullscreenIcon, MusicIcon } from './Icons';

interface VideoPlayerProps {
  currentVideo: VideoFile | null;
  onEnded: () => void;
  onNext: () => void;
  onPrevious: () => void;
  showControls: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  currentVideo, 
  onEnded, 
  onNext, 
  onPrevious, 
  showControls
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentVideo?.url && mediaRef.current) {
      mediaRef.current.load();
      mediaRef.current.play().catch(() => {});
    }
  }, [currentVideo?.url]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(() => {});
      }
    }
  };

  const jump = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, Math.min(mediaRef.current.duration, mediaRef.current.currentTime + seconds));
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
      setProgress(mediaRef.current.duration ? (mediaRef.current.currentTime / mediaRef.current.duration) * 100 : 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaRef.current && mediaRef.current.duration) {
      const seekTime = (Number(e.target.value) / 100) * mediaRef.current.duration;
      mediaRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentVideo) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <div className="mb-4 opacity-10">
           <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        </div>
        <p className="text-xl font-medium">再生するファイルがありません</p>
        <p className="text-sm mt-2">ファイルを追加してプレイリストを作成してください</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center group">
      {currentVideo.type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={currentVideo.url}
          key={currentVideo.id}
          className="w-full h-full object-contain cursor-pointer"
          onEnded={onEnded}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={currentVideo.url}
            key={currentVideo.id}
            onEnded={onEnded}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="relative mb-8">
            <div className={`w-32 h-32 md:w-48 h-48 bg-blue-600/20 rounded-full flex items-center justify-center border-2 border-blue-500/30 ${isPlaying ? 'animate-pulse' : ''}`}>
              <div className="text-blue-500 scale-[2.5]">
                <MusicIcon />
              </div>
            </div>
            {/* Simple audio visualizer effect */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 bg-blue-500/50 rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-[bounce_0.6s_infinite]' : 'h-1'}`}
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: isPlaying ? `${Math.random() * 100 + 20}%` : '4px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-500 flex flex-col justify-between p-4 md:p-8 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="pt-2 text-center">
           <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-md truncate max-w-[90%] mx-auto">
            {currentVideo.name}
          </h2>
        </div>

        <div className="w-full max-w-6xl mx-auto space-y-4">
          <div className="w-full group/progress relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-5">
              <button onClick={onPrevious} title="前のファイル" className="text-white hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/10">
                <SkipBackIcon />
              </button>

              <button onClick={() => jump(-10)} title="10秒戻る" className="hidden sm:block text-white/70 hover:text-white transition-colors p-2">
                <RewindIcon />
              </button>
              
              <button onClick={togglePlay} className="text-white hover:scale-105 transition-all p-3 md:p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>

              <button onClick={() => jump(10)} title="10秒進む" className="hidden sm:block text-white/70 hover:text-white transition-colors p-2">
                <FastForwardIcon />
              </button>

              <button onClick={onNext} title="次のファイル" className="text-white hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/10">
                <SkipForwardIcon />
              </button>
              
              <span className="text-xs md:text-sm font-mono text-white/80 ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <VolumeIcon />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 lg:w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {currentVideo.type === 'video' && (
                <button 
                  onClick={toggleFullscreen} 
                  title="全画面"
                  className="text-white hover:text-blue-400 p-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <FullscreenIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
