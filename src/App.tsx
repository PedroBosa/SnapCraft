import React, { useEffect, useRef } from 'react';
import { Topbar } from './modules/workbench/Topbar';
import { Sidebar } from './modules/workbench/Sidebar';
import { StageViewport } from './modules/canvas/StageViewport';
import { useSnapStore } from './store/useSnapStore';

export const App: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const { loadStateFromUrl } = useSnapStore();

  useEffect(() => {
    // Zero-Backend URL Hydration: automatically loads ?snap=... if present
    loadStateFromUrl();
  }, [loadStateFromUrl]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-bg text-studio-text">
      {/* Topbar: Mode Switcher, Ratio, Share, Actions */}
      <Topbar stageRef={stageRef} />

      {/* Main Studio View: Workbench Left Sidebar + Central Infinite Stage */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <StageViewport stageRef={stageRef} />
      </div>
    </div>
  );
};

export default App;
