import React from 'react';
import { Rocket, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSelectGame: () => void;
}

export const Lobby: React.FC<Props> = ({ onSelectGame }) => {
  const { user, setAuthModalOpen } = useAuth();

  const handlePlayClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      onSelectGame();
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-[#4ADE80] pl-4">
        Lobby Games
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Rocket Game Card */}
        <div 
          onClick={handlePlayClick}
          className="group relative bg-[#151A22] rounded-2xl border border-[#1F2531] overflow-hidden cursor-pointer hover:border-[#4ADE80]/50 hover:shadow-[0_0_30px_rgba(74,222,128,0.15)] transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="h-48 bg-gradient-to-br from-[#1F2531] to-[#0B0E14] flex items-center justify-center">
            <Rocket className="w-20 h-20 text-[#4ADE80] group-hover:animate-pulseGlow" />
          </div>

          <div className="p-4 border-t border-[#1F2531] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-white">Rocket Crash</h3>
              <p className="text-xs text-gray-500">Originals</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#1F2531] flex items-center justify-center group-hover:bg-[#4ADE80] transition-colors">
              <Play className="w-5 h-5 text-gray-400 group-hover:text-[#0B0E14] ml-1" />
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-6 py-2 bg-[#4ADE80] text-[#0B0E14] font-bold rounded-full transform scale-90 group-hover:scale-100 transition-transform">
              {user ? 'Play Now' : 'Login to Play'}
            </span>
          </div>
        </div>

        {/* Placeholder */}
        <div className="bg-[#151A22]/50 border border-[#1F2531] border-dashed rounded-2xl h-full min-h-[250px] flex items-center justify-center">
          <span className="text-gray-500 font-medium">
            More Games Coming Soon
          </span>
        </div>

      </div>
    </div>
  );
};