import React, { useState } from 'react';
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
  Switch,
  Plus
} from 'lucide-react';

const Container = styled.div`
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const DeviceTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DeviceType = styled.div`
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  text-align: center;
  transition: all 0.2s;
  background: white;
  position: relative;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:active {
    cursor: grabbing;
  }

  ${props => props.selected && `
    border-color: #667eea;
    background: #f8f9ff;
  `}
`;

const DeviceIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #667eea;
`;

const DeviceName = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8f9ff;
  }
`;

const DeviceList = styled.div`
  flex: 1;
  overflow-y: auto;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
`;

const DeviceItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }

  ${props => props.selected && `
    border-color: #667eea;
    background: #f8f9ff;
  `}
`;

const DeviceItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const DeviceItemName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const DeviceItemType = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const DeviceItemIP = styled.div`
  font-size: 0.8rem;
  color: #999;
  font-family: monospace;
`;

const deviceTypes = [
  { id: 'pc', name: 'PC', icon: Monitor, color: '#3498db' },
  { id: 'handy', name: 'Handy', icon: Smartphone, color: '#e74c3c' },
  { id: 'server', name: 'Server', icon: Server, color: '#2ecc71' },
  { id: 'router', name: 'Router', icon: Router, color: '#f39c12' },
  { id: 'modem', name: 'Modem', icon: Wifi, color: '#9b59b6' },
  { id: 'firewall', name: 'Firewall', icon: Shield, color: '#e67e22' },
  { id: 'cluster', name: 'Cluster', icon: Database, color: '#1abc9c' },
  { id: 'vm', name: 'VM', icon: Layers, color: '#34495e' },
  { id: 'nas', name: 'NAS', icon: HardDrive, color: '#95a5a6' },
  { id: 'switch_managed', name: 'Switch (Managed)', icon: Switch, color: '#16a085' },
  { id: 'switch_unmanaged', name: 'Switch (Unmanaged)', icon: Switch, color: '#7f8c8d' }
];

function DevicePalette({ onDeviceCreate, onDeviceSelect, selectedDevice, devices = [] }) {
  const [draggedDeviceType, setDraggedDeviceType] = useState(null);

  const handleDragStart = (e, deviceType) => {
    setDraggedDeviceType(deviceType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedDeviceType(null);
  };

  const handleDeviceClick = (device) => {
    onDeviceSelect(device);
  };

  const getDeviceTypeInfo = (type) => {
    return deviceTypes.find(dt => dt.id === type) || { name: type, icon: Monitor, color: '#666' };
  };

  return (
    <Container>
      <Title>Gerätetypen</Title>
      <DeviceTypes>
        {deviceTypes.map((deviceType) => {
          const IconComponent = deviceType.icon;
          return (
            <DeviceType
              key={deviceType.id}
              draggable
              onDragStart={(e) => handleDragStart(e, deviceType)}
              onDragEnd={handleDragEnd}
            >
              <DeviceIcon>
                <IconComponent size={24} />
              </DeviceIcon>
              <DeviceName>{deviceType.name}</DeviceName>
            </DeviceType>
          );
        })}
      </DeviceTypes>

      <AddButton onClick={() => onDeviceCreate({ type: 'pc', name: 'Neues Gerät' })}>
        <Plus size={16} />
        Gerät hinzufügen
      </AddButton>

      {devices.length > 0 && (
        <>
          <Title style={{ marginTop: '1rem' }}>Geräte im Projekt</Title>
          <DeviceList>
            {devices.map((device) => {
              const typeInfo = getDeviceTypeInfo(device.type);
              const IconComponent = typeInfo.icon;
              
              return (
                <DeviceItem
                  key={device.id}
                  selected={selectedDevice?.id === device.id}
                  onClick={() => handleDeviceClick(device)}
                >
                  <DeviceItemHeader>
                    <IconComponent size={16} color={typeInfo.color} />
                    <DeviceItemName>{device.name}</DeviceItemName>
                  </DeviceItemHeader>
                  <DeviceItemType>{typeInfo.name}</DeviceItemType>
                  {device.ip_address && (
                    <DeviceItemIP>{device.ip_address}</DeviceItemIP>
                  )}
                </DeviceItem>
              );
            })}
          </DeviceList>
        </>
      )}
    </Container>
  );
}

export default DevicePalette;
