import React from 'react';
import { Github, Twitter, Linkedin, Terminal } from 'lucide-react';
import { WatermarkConfig } from '../../types/snap';

interface WatermarkProps {
  config: WatermarkConfig;
}

export const Watermark: React.FC<WatermarkProps> = ({ config }) => {
  if (!config.enabled || !config.handle) return null;

  const getPositionClasses = () => {
    switch (config.position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const renderIcon = () => {
    switch (config.platform) {
      case 'github':
        return <Github className="w-3.5 h-3.5 shrink-0" />;
      case 'x':
        return <Twitter className="w-3.5 h-3.5 shrink-0" />;
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5 shrink-0" />;
      case 'custom':
      default:
        return <Terminal className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white select-none pointer-events-none transition-opacity`}
      style={{ opacity: config.opacity }}
    >
      {renderIcon()}
      <span className="text-[11px] font-mono tracking-tight font-medium">
        {config.handle}
      </span>
    </div>
  );
};
