import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { 
  Monitor, 
  Smartphone, 
  Server, 
  Router, 
  Wifi, 
  Shield, 
  Database, 
  HardDrive, 
  Layers,
  Network
} from 'lucide-react';

const FlowContainer = styled.div`
  flex: 1;
  background: #f8f9fa;
`;

const deviceTypes = {
  pc: { icon: Monitor, color: '#3498db' },
  handy: { icon: Smartphone, color: '#e74c3c' },
  server: { icon: Server, color: '#2ecc71' },
  router: { icon: Router, color: '#f39c12' },
  modem: { icon: Wifi, color: '#9b59b6' },
  firewall: { icon: Shield, color: '#e67e22' },
  cluster: { icon: Database, color: '#1abc9c' },
  vm: { icon: Layers, color: '#34495e' },
  nas: { icon: HardDrive, color: '#95a5a6' },
  switch_managed: { icon: Network, color: '#16a085' },
  switch_unmanaged: { icon: Network, color: '#7f8c8d' }
};

const DeviceNode = ({ data }) => {
  const typeInfo = deviceTypes[data.type] || { icon: Monitor, color: '#666' };
  const IconComponent = typeInfo.icon;

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${typeInfo.color}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '120px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <IconComponent size={16} color={typeInfo.color} />
        <div style={{ fontWeight: '500', fontSize: '12px', color: '#333' }}>
          {data.name}
        </div>
      </div>
      {data.ip_address && (
        <div style={{ fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
          {data.ip_address}
        </div>
      )}
      {data.vlan_id && (
        <div style={{ fontSize: '10px', color: '#999' }}>
          VLAN {data.vlan_id}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  device: DeviceNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
};

function VisualEditor({ devices, connections, onDeviceSelect, selectedDevice }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Geräte zu Nodes konvertieren
  useEffect(() => {
    const deviceNodes = devices.map(device => ({
      id: device.id,
      type: 'device',
      position: { x: device.x || Math.random() * 400, y: device.y || Math.random() * 400 },
      data: {
        ...device,
        label: device.name,
      },
      selected: selectedDevice?.id === device.id,
    }));

    setNodes(deviceNodes);
  }, [devices, selectedDevice]);

  // Verbindungen zu Edges konvertieren
  useEffect(() => {
    const connectionEdges = connections.map(conn => ({
      id: conn.id,
      source: conn.from_device_id,
      target: conn.to_device_id,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: conn.color || '#3498db',
        strokeWidth: 2,
      },
      label: conn.speed ? `${conn.speed} Mbps` : '',
      labelStyle: {
        fontSize: '10px',
        fill: '#666',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: conn.color || '#3498db',
      },
    }));

    setEdges(connectionEdges);
  }, [connections]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3498db', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    const device = devices.find(d => d.id === node.id);
    if (device) {
      onDeviceSelect(device);
    }
  }, [devices, onDeviceSelect]);

  const onNodeDragStop = useCallback((event, node) => {
    // Hier könnte man die Position in der Datenbank aktualisieren
    console.log('Node position updated:', node.id, node.position);
  }, []);

  const onPaneClick = useCallback(() => {
    onDeviceSelect(null);
  }, [onDeviceSelect]);

  return (
    <FlowContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'device') {
              const typeInfo = deviceTypes[n.data.type];
              return typeInfo ? typeInfo.color : '#666';
            }
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === 'device') {
              const typeInfo = deviceTypes[n.data.type];
              return typeInfo ? typeInfo.color : '#666';
            }
            return '#fff';
          }}
          nodeBorderRadius={2}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </FlowContainer>
  );
}

export default VisualEditor;
