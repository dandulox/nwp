import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, Trash2 } from 'lucide-react';

const Panel = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 350px;
  background: white;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
`;

const Actions = styled.div`
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  ${props => props.variant === 'primary' && `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  `}
`;

const deviceTypes = [
  { value: 'pc', label: 'PC' },
  { value: 'handy', label: 'Handy' },
  { value: 'server', label: 'Server' },
  { value: 'router', label: 'Router' },
  { value: 'modem', label: 'Modem' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'cluster', label: 'Cluster' },
  { value: 'vm', label: 'VM' },
  { value: 'nas', label: 'NAS' },
  { value: 'switch_managed', label: 'Switch (Managed)' },
  { value: 'switch_unmanaged', label: 'Switch (Unmanaged)' }
];

const speedOptions = [
  { value: 10, label: '10 Mbps' },
  { value: 100, label: '100 Mbps' },
  { value: 1000, label: '1 Gbps' },
  { value: 10000, label: '10 Gbps' },
  { value: 25000, label: '25 Gbps' },
  { value: 40000, label: '40 Gbps' },
  { value: 100000, label: '100 Gbps' }
];

function PropertiesPanel({ device, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'pc',
    ip_address: '',
    mac_address: '',
    vlan_id: '',
    speed: 1000,
    managed: false,
    properties: ''
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        type: device.type || 'pc',
        ip_address: device.ip_address || '',
        mac_address: device.mac_address || '',
        vlan_id: device.vlan_id || '',
        speed: device.speed || 1000,
        managed: device.managed || false,
        properties: device.properties || ''
      });
    }
  }, [device]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      vlan_id: formData.vlan_id ? parseInt(formData.vlan_id) : null,
      speed: parseInt(formData.speed)
    };
    onUpdate(submitData);
  };

  const handleDelete = () => {
    if (window.confirm('Möchten Sie dieses Gerät wirklich löschen?')) {
      // TODO: Implement delete functionality
      onClose();
    }
  };

  if (!device) return null;

  return (
    <Panel>
      <Header>
        <Title>Geräteeigenschaften</Title>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
      </Header>

      <Content>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="type">Gerätetyp</Label>
            <Select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              {deviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="ip_address">IP-Adresse</Label>
            <Input
              id="ip_address"
              name="ip_address"
              type="text"
              value={formData.ip_address}
              onChange={handleInputChange}
              placeholder="192.168.1.100"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="mac_address">MAC-Adresse</Label>
            <Input
              id="mac_address"
              name="mac_address"
              type="text"
              value={formData.mac_address}
              onChange={handleInputChange}
              placeholder="00:11:22:33:44:55"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="vlan_id">VLAN ID</Label>
            <Input
              id="vlan_id"
              name="vlan_id"
              type="number"
              min="1"
              max="4094"
              value={formData.vlan_id}
              onChange={handleInputChange}
              placeholder="1"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="speed">Geschwindigkeit</Label>
            <Select
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleInputChange}
            >
              {speedOptions.map(speed => (
                <option key={speed.value} value={speed.value}>
                  {speed.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                name="managed"
                checked={formData.managed}
                onChange={handleInputChange}
              />
              Managed Switch
            </CheckboxLabel>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="properties">Zusätzliche Eigenschaften</Label>
            <TextArea
              id="properties"
              name="properties"
              value={formData.properties}
              onChange={handleInputChange}
              placeholder="Zusätzliche Konfigurationsdaten (JSON-Format)"
            />
          </FormGroup>
        </form>
      </Content>

      <Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 size={16} />
          Löschen
        </Button>
        <Button type="submit" variant="primary" onClick={handleSubmit}>
          <Save size={16} />
          Speichern
        </Button>
      </Actions>
    </Panel>
  );
}

export default PropertiesPanel;
