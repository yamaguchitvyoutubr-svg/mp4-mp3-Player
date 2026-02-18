
import React from 'react';
import { VideoFile } from '../types';
import { TrashIcon, PlayIcon, VideoIcon, MusicIcon } from './Icons';

interface PlaylistProps {
  videos: VideoFile[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ videos, currentIndex, onSelect, onRemove }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-3">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 opacity-30">
            <VideoIcon />
            <p className="mt-4 text-sm font-medium">リストが空です</p>
          </div>
        ) : (
          videos.map((video, index) => (
            <div
              key={video.id}
              className={`group relative flex items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                index === currentIndex
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
              onClick={() => onSelect(index)}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center mr-3 overflow-hidden">
                {index === currentIndex ? (
                  <div className="flex items-end gap-1 h-3.5">
                    <div className="w-0.5 bg-blue-500 animate-[bounce_1s_infinite_0ms]" style={{height: '60%'}}></div>
                    <div className="w-0.5 bg-blue-400 animate-[bounce_1s_infinite_200ms]" style={{height: '100%'}}></div>
                    <div className="w-0.5 bg-blue-300 animate-[bounce_1s_infinite_400ms]" style={{height: '80%'}}></div>
                  </div>
                ) : (
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                    {video.type === 'video' ? <PlayIcon /> : <MusicIcon />}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <p className={`text-sm font-semibold truncate ${
                  index === currentIndex ? 'text-blue-400' : 'text-slate-200'
                }`}>
                  {video.name}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(video.id);
                }}
                className="absolute right-2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="削除"
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Playlist;
