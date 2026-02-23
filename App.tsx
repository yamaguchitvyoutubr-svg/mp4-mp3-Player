
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VideoFile } from './types';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import Clock from './components/Clock';
import { PlusIcon, MenuIcon, CloseIcon } from './components/Icons';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const currentVideo = currentIndex >= 0 ? videos[currentIndex] : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      
      const newVideos: VideoFile[] = selectedFiles
        .filter(file => {
          const type = file.type;
          return type === 'video/mp4' || type === 'video/quicktime' || type === 'audio/mpeg';
        })
        .map(file => ({
          id: Math.random().toString(36).substring(7),
          file: file,
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'audio'
        }));

      setVideos(prev => {
        const updated = [...prev, ...newVideos];
        if (prev.length === 0 && updated.length > 0) {
          setCurrentIndex(0);
        }
        return updated;
      });
    }
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      setVideos(prev => {
        prev.forEach(v => URL.revokeObjectURL(v.url));
        return [];
      });
    };
  }, []);

  const handleNext = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % videos.length);
  }, [videos.length]);

  const handlePrevious = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  const handleRemove = (id: string) => {
    setVideos(prev => {
      const videoToRemove = prev.find(v => v.id === id);
      if (videoToRemove) URL.revokeObjectURL(videoToRemove.url);
      
      const removedIndex = prev.findIndex(v => v.id === id);
      const updated = prev.filter(v => v.id !== id);

      if (updated.length === 0) {
        setCurrentIndex(-1);
      } else if (removedIndex <= currentIndex) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
      return updated;
    });
  };

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  const handleGlobalMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (!isSidebarOpen) setShowControls(false);
    }, 2500);
  }, [isSidebarOpen]);

  return (
    <div 
      className="fixed inset-0 bg-black text-slate-100 overflow-hidden font-sans select-none"
      onMouseMove={handleGlobalMouseMove}
    >
      <div className="absolute inset-0 z-0">
        <VideoPlayer
          currentVideo={currentVideo}
          onEnded={handleNext}
          onNext={handleNext}
          onPrevious={handlePrevious}
          showControls={showControls}
        />
      </div>

      <div className={`absolute top-0 left-0 h-full w-full sm:w-[360px] z-20 transition-all duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
              </div>
              <h1 className="text-lg font-bold">メディアリスト</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <Playlist 
              videos={videos} 
              currentIndex={currentIndex} 
              onSelect={handleSelect} 
              onRemove={handleRemove} 
            />
          </div>

          <div className="p-4 bg-black/20 border-t border-white/10">
            <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 w-full py-3.5 rounded-xl cursor-pointer transition-all shadow-lg text-sm font-bold active:scale-95">
              <PlusIcon />
              <span>ファイルを追加する</span>
              <input
                type="file"
                multiple
                accept="video/mp4,video/quicktime,audio/mpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-6 left-6 z-30 p-4 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isSidebarOpen || !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MenuIcon />
      </button>

      <div className={`fixed top-6 right-6 z-30 transition-all duration-300 ${!showControls && !isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Clock />
      </div>

      {!isSidebarOpen && videos.length > 0 && showControls && (
        <div className="fixed bottom-6 left-6 z-30 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 text-xs font-medium text-white/90 shadow-xl flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>再生中: {currentIndex + 1} / {videos.length}</span>
        </div>
      )}
    </div>
  );
};

export default App;
