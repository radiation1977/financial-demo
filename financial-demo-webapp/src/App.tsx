/** Main application component. */

import React, { useEffect } from 'react';
import { SwarmScene } from './three/SwarmScene';
import { TopBar } from './panels/TopBar';
import { NodeInspector } from './panels/NodeInspector';
import { AuditPanel } from './panels/AuditPanel';
import { WorkflowPanel } from './panels/WorkflowPanel';
import { ChaosPanel } from './panels/ChaosPanel';
import { connectDashboard, disconnectDashboard } from './api/websocket';

export function App() {
  // Connect to the WebSocket on mount.
  useEffect(() => {
    connectDashboard();
    return () => disconnectDashboard();
  }, []);

  return (
    <>
      {/* 3D Scene */}
      <SwarmScene />

      {/* UI Overlay */}
      <TopBar />
      <NodeInspector />
      <AuditPanel />
      <WorkflowPanel />
      <ChaosPanel />

      {/* Bottom status bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 15, 0.8)',
          borderTop: '1px solid #2a2a3f',
          fontSize: 10,
          color: '#606070',
          zIndex: 100,
        }}
      >
        Cambrian Swarm Financial Demo — Real-time distributed hedge fund visualization
      </div>
    </>
  );
}
