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
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const Container = styled.div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const AddButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: #5a6fd8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: top;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DeviceIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const DeviceDetails = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const DeviceType = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const IPAddress = styled.div`
  font-family: monospace;
  font-size: 0.9rem;
  color: #333;
`;

const MACAddress = styled.div`
  font-family: monospace;
  font-size: 0.8rem;
  color: #666;
`;

const SpeedBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
`;

const VlanBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background: ${props => props.color || '#3498db'};
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background: ${props => props.online ? '#28a745' : '#dc3545'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  margin-right: 0.5rem;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  ${props => props.variant === 'danger' && `
    &:hover {
      background: #f8d7da;
      color: #721c24;
    }
  `}
`;

const ConnectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const ConnectionLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const deviceTypes = {
  pc: { icon: Monitor, color: '#3498db', name: 'PC' },
  handy: { icon: Smartphone, color: '#e74c3c', name: 'Handy' },
  server: { icon: Server, color: '#2ecc71', name: 'Server' },
  router: { icon: Router, color: '#f39c12', name: 'Router' },
  modem: { icon: Wifi, color: '#9b59b6', name: 'Modem' },
  firewall: { icon: Shield, color: '#e67e22', name: 'Firewall' },
  cluster: { icon: Database, color: '#1abc9c', name: 'Cluster' },
  vm: { icon: Layers, color: '#34495e', name: 'VM' },
  nas: { icon: HardDrive, color: '#95a5a6', name: 'NAS' },
  switch_managed: { icon: Switch, color: '#16a085', name: 'Switch (Managed)' },
  switch_unmanaged: { icon: Switch, color: '#7f8c8d', name: 'Switch (Unmanaged)' }
};

function TableView({ devices, connections, vlans, subnets }) {
  const [activeTab, setActiveTab] = useState('devices');

  const getDeviceTypeInfo = (type) => {
    return deviceTypes[type] || { icon: Monitor, color: '#666', name: type };
  };

  const getDeviceById = (id) => {
    return devices.find(d => d.id === id);
  };

  const formatSpeed = (speed) => {
    if (speed >= 1000) {
      return `${speed / 1000} Gbps`;
    }
    return `${speed} Mbps`;
  };

  const getVlanColor = (vlanId) => {
    const vlan = vlans.find(v => v.vlan_id === vlanId);
    return vlan ? vlan.color : '#3498db';
  };

  return (
    <Container>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('devices')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'devices' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'devices' ? 'white' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Geräte ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'connections' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'connections' ? 'white' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Verbindungen ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('vlans')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'vlans' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'vlans' ? 'white' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          VLANs ({vlans.length})
        </button>
        <button
          onClick={() => setActiveTab('subnets')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'subnets' ? '#667eea' : '#f0f0f0',
            color: activeTab === 'subnets' ? 'white' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Subnetze ({subnets.length})
        </button>
      </div>

      {activeTab === 'devices' && (
        <Section>
          <SectionHeader>
            <SectionTitle>Geräte</SectionTitle>
            <AddButton>
              <Plus size={16} />
              Gerät hinzufügen
            </AddButton>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <TableHeader>Gerät</TableHeader>
                <TableHeader>IP-Adresse</TableHeader>
                <TableHeader>MAC-Adresse</TableHeader>
                <TableHeader>VLAN</TableHeader>
                <TableHeader>Geschwindigkeit</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Aktionen</TableHeader>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const typeInfo = getDeviceTypeInfo(device.type);
                const IconComponent = typeInfo.icon;
                
                return (
                  <TableRow key={device.id}>
                    <TableCell>
                      <DeviceInfo>
                        <DeviceIcon color={typeInfo.color}>
                          <IconComponent size={16} />
                        </DeviceIcon>
                        <DeviceDetails>
                          <DeviceName>{device.name}</DeviceName>
                          <DeviceType>{typeInfo.name}</DeviceType>
                        </DeviceDetails>
                      </DeviceInfo>
                    </TableCell>
                    <TableCell>
                      <IPAddress>{device.ip_address || '-'}</IPAddress>
                    </TableCell>
                    <TableCell>
                      <MACAddress>{device.mac_address || '-'}</MACAddress>
                    </TableCell>
                    <TableCell>
                      {device.vlan_id ? (
                        <VlanBadge color={getVlanColor(device.vlan_id)}>
                          VLAN {device.vlan_id}
                        </VlanBadge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <SpeedBadge>{formatSpeed(device.speed)}</SpeedBadge>
                    </TableCell>
                    <TableCell>
                      <StatusIndicator online={true} />
                      Online
                    </TableCell>
                    <TableCell>
                      <ActionButton>
                        <Edit size={16} />
                      </ActionButton>
                      <ActionButton variant="danger">
                        <Trash2 size={16} />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </Section>
      )}

      {activeTab === 'connections' && (
        <Section>
          <SectionHeader>
            <SectionTitle>Verbindungen</SectionTitle>
            <AddButton>
              <Plus size={16} />
              Verbindung hinzufügen
            </AddButton>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <TableHeader>Von</TableHeader>
                <TableHeader>Zu</TableHeader>
                <TableHeader>Ports</TableHeader>
                <TableHeader>Geschwindigkeit</TableHeader>
                <TableHeader>VLAN</TableHeader>
                <TableHeader>Aktionen</TableHeader>
              </tr>
            </thead>
            <tbody>
              {connections.map((connection) => {
                const fromDevice = getDeviceById(connection.from_device_id);
                const toDevice = getDeviceById(connection.to_device_id);
                
                return (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <ConnectionInfo>
                        {fromDevice ? (
                          <>
                            <DeviceIcon color={getDeviceTypeInfo(fromDevice.type).color}>
                              {React.createElement(getDeviceTypeInfo(fromDevice.type).icon, { size: 16 })}
                            </DeviceIcon>
                            {fromDevice.name}
                          </>
                        ) : 'Unbekanntes Gerät'}
                      </ConnectionInfo>
                    </TableCell>
                    <TableCell>
                      <ConnectionInfo>
                        {toDevice ? (
                          <>
                            <DeviceIcon color={getDeviceTypeInfo(toDevice.type).color}>
                              {React.createElement(getDeviceTypeInfo(toDevice.type).icon, { size: 16 })}
                            </DeviceIcon>
                            {toDevice.name}
                          </>
                        ) : 'Unbekanntes Gerät'}
                      </ConnectionInfo>
                    </TableCell>
                    <TableCell>
                      <ConnectionLine>
                        {connection.from_port && `Port ${connection.from_port}`}
                        {connection.from_port && connection.to_port && ' → '}
                        {connection.to_port && `Port ${connection.to_port}`}
                        {!connection.from_port && !connection.to_port && '-'}
                      </ConnectionLine>
                    </TableCell>
                    <TableCell>
                      <SpeedBadge>{formatSpeed(connection.speed)}</SpeedBadge>
                    </TableCell>
                    <TableCell>
                      {connection.vlan_id ? (
                        <VlanBadge color={getVlanColor(connection.vlan_id)}>
                          VLAN {connection.vlan_id}
                        </VlanBadge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <ActionButton>
                        <Edit size={16} />
                      </ActionButton>
                      <ActionButton variant="danger">
                        <Trash2 size={16} />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </Section>
      )}

      {activeTab === 'vlans' && (
        <Section>
          <SectionHeader>
            <SectionTitle>VLANs</SectionTitle>
            <AddButton>
              <Plus size={16} />
              VLAN hinzufügen
            </AddButton>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>VLAN ID</TableHeader>
                <TableHeader>Subnet</TableHeader>
                <TableHeader>Farbe</TableHeader>
                <TableHeader>Beschreibung</TableHeader>
                <TableHeader>Aktionen</TableHeader>
              </tr>
            </thead>
            <tbody>
              {vlans.map((vlan) => (
                <TableRow key={vlan.id}>
                  <TableCell>
                    <DeviceName>{vlan.name}</DeviceName>
                  </TableCell>
                  <TableCell>
                    <VlanBadge color={vlan.color}>
                      {vlan.vlan_id}
                    </VlanBadge>
                  </TableCell>
                  <TableCell>
                    <IPAddress>{vlan.subnet}</IPAddress>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: vlan.color
                        }}
                      />
                      {vlan.color}
                    </div>
                  </TableCell>
                  <TableCell>{vlan.description || '-'}</TableCell>
                  <TableCell>
                    <ActionButton>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton variant="danger">
                      <Trash2 size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      {activeTab === 'subnets' && (
        <Section>
          <SectionHeader>
            <SectionTitle>Subnetze</SectionTitle>
            <AddButton>
              <Plus size={16} />
              Subnetz hinzufügen
            </AddButton>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Netzwerk</TableHeader>
                <TableHeader>Subnetzmaske</TableHeader>
                <TableHeader>Gateway</TableHeader>
                <TableHeader>DNS-Server</TableHeader>
                <TableHeader>VLAN</TableHeader>
                <TableHeader>Aktionen</TableHeader>
              </tr>
            </thead>
            <tbody>
              {subnets.map((subnet) => (
                <TableRow key={subnet.id}>
                  <TableCell>
                    <DeviceName>{subnet.name}</DeviceName>
                  </TableCell>
                  <TableCell>
                    <IPAddress>{subnet.network}</IPAddress>
                  </TableCell>
                  <TableCell>
                    <IPAddress>{subnet.subnet_mask}</IPAddress>
                  </TableCell>
                  <TableCell>
                    <IPAddress>{subnet.gateway || '-'}</IPAddress>
                  </TableCell>
                  <TableCell>
                    <IPAddress>{subnet.dns_servers || '-'}</IPAddress>
                  </TableCell>
                  <TableCell>
                    {subnet.vlan_id ? (
                      <VlanBadge color={getVlanColor(subnet.vlan_id)}>
                        VLAN {subnet.vlan_id}
                      </VlanBadge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <ActionButton>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton variant="danger">
                      <Trash2 size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Section>
      )}
    </Container>
  );
}

export default TableView;
