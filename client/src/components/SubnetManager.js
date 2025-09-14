import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useProject } from '../context/ProjectContext';
import { Plus, Edit, Trash2, Save, X, Calculator } from 'lucide-react';
import { ChromePicker } from 'react-color';

const Container = styled.div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
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

const SubnetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubnetItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const SubnetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SubnetName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 1rem;
`;

const SubnetActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;

  ${SubnetItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
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

  ${props => props.variant === 'danger' && `
    &:hover {
      background: #f8d7da;
      color: #721c24;
    }
  `}
`;

const SubnetDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const SubnetDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubnetBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background: ${props => props.color};
`;

const ColorIndicator = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 0 0 1px #ddd;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
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

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ColorPreview = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color};
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  z-index: 1001;
  top: 50px;
  left: 0;
`;

const CalculatorSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CalculatorTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const CalculatorResult = styled.div`
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e0e0e0;
`;

const ResultLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ResultValue = styled.div`
  font-family: monospace;
  font-weight: 500;
  color: #333;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' && `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

function SubnetManager({ projectId }) {
  const { subnets, vlans, api } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [editingSubnet, setEditingSubnet] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    network: '',
    subnet_mask: '',
    gateway: '',
    dns_servers: '',
    vlan_id: '',
    color: '#3498db',
    description: ''
  });

  useEffect(() => {
    if (projectId) {
      api.getSubnets(projectId);
      api.getVlans(projectId);
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color.hex
    }));
  };

  const calculateSubnet = async () => {
    if (!formData.network || !formData.subnet_mask) return;

    try {
      const result = await api.calculateSubnet(formData.network, formData.subnet_mask);
      setCalculatorResult(result);
      setShowCalculator(true);
    } catch (error) {
      console.error('Fehler beim Berechnen des Subnetzes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        vlan_id: formData.vlan_id ? parseInt(formData.vlan_id) : null
      };

      if (editingSubnet) {
        // TODO: Implement update functionality
        console.log('Update Subnet:', submitData);
      } else {
        await api.createSubnet(projectId, submitData);
      }

      setShowModal(false);
      setEditingSubnet(null);
      setFormData({
        name: '',
        network: '',
        subnet_mask: '',
        gateway: '',
        dns_servers: '',
        vlan_id: '',
        color: '#3498db',
        description: ''
      });
    } catch (error) {
      console.error('Fehler beim Speichern des Subnetzes:', error);
    }
  };

  const handleEdit = (subnet) => {
    setEditingSubnet(subnet);
    setFormData({
      name: subnet.name,
      network: subnet.network,
      subnet_mask: subnet.subnet_mask,
      gateway: subnet.gateway || '',
      dns_servers: subnet.dns_servers || '',
      vlan_id: subnet.vlan_id ? subnet.vlan_id.toString() : '',
      color: subnet.color,
      description: subnet.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (subnetId) => {
    if (window.confirm('Möchten Sie dieses Subnetz wirklich löschen?')) {
      // TODO: Implement delete functionality
      console.log('Delete Subnet:', subnetId);
    }
  };

  const openModal = () => {
    setEditingSubnet(null);
    setFormData({
      name: '',
      network: '',
      subnet_mask: '',
      gateway: '',
      dns_servers: '',
      vlan_id: '',
      color: '#3498db',
      description: ''
    });
    setShowModal(true);
  };

  const getVlanColor = (vlanId) => {
    const vlan = vlans.find(v => v.vlan_id === vlanId);
    return vlan ? vlan.color : '#3498db';
  };

  return (
    <Container>
      <Header>
        <Title>Subnetze</Title>
        <AddButton onClick={openModal}>
          <Plus size={16} />
          Subnetz hinzufügen
        </AddButton>
      </Header>

      {subnets.length === 0 ? (
        <EmptyState>
          <p>Noch keine Subnetze definiert</p>
          <p>Erstellen Sie Ihr erstes Subnetz, um loszulegen.</p>
        </EmptyState>
      ) : (
        <SubnetList>
          {subnets.map((subnet) => (
            <SubnetItem key={subnet.id}>
              <SubnetHeader>
                <SubnetName>{subnet.name}</SubnetName>
                <SubnetActions>
                  <ActionButton onClick={() => handleEdit(subnet)}>
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => handleDelete(subnet.id)}>
                    <Trash2 size={16} />
                  </ActionButton>
                </SubnetActions>
              </SubnetHeader>
              <SubnetDetails>
                <SubnetDetail>
                  <strong>Netzwerk:</strong>
                  <span style={{ fontFamily: 'monospace' }}>{subnet.network}</span>
                </SubnetDetail>
                <SubnetDetail>
                  <strong>Subnetzmaske:</strong>
                  <span style={{ fontFamily: 'monospace' }}>{subnet.subnet_mask}</span>
                </SubnetDetail>
                <SubnetDetail>
                  <strong>Gateway:</strong>
                  <span style={{ fontFamily: 'monospace' }}>{subnet.gateway || '-'}</span>
                </SubnetDetail>
                <SubnetDetail>
                  <strong>DNS-Server:</strong>
                  <span style={{ fontFamily: 'monospace' }}>{subnet.dns_servers || '-'}</span>
                </SubnetDetail>
                <SubnetDetail>
                  <strong>VLAN:</strong>
                  {subnet.vlan_id ? (
                    <SubnetBadge color={getVlanColor(subnet.vlan_id)}>
                      VLAN {subnet.vlan_id}
                    </SubnetBadge>
                  ) : (
                    <span>-</span>
                  )}
                </SubnetDetail>
                <SubnetDetail>
                  <strong>Farbe:</strong>
                  <ColorIndicator color={subnet.color} />
                  <span>{subnet.color}</span>
                </SubnetDetail>
                <SubnetDetail>
                  <strong>Beschreibung:</strong>
                  <span>{subnet.description || '-'}</span>
                </SubnetDetail>
              </SubnetDetails>
            </SubnetItem>
          ))}
        </SubnetList>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingSubnet ? 'Subnetz bearbeiten' : 'Neues Subnetz erstellen'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

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
                <Label htmlFor="network">Netzwerk</Label>
                <Input
                  id="network"
                  name="network"
                  type="text"
                  value={formData.network}
                  onChange={handleInputChange}
                  placeholder="192.168.1.0"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subnet_mask">Subnetzmaske</Label>
                <Input
                  id="subnet_mask"
                  name="subnet_mask"
                  type="text"
                  value={formData.subnet_mask}
                  onChange={handleInputChange}
                  placeholder="255.255.255.0 oder /24"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  name="gateway"
                  type="text"
                  value={formData.gateway}
                  onChange={handleInputChange}
                  placeholder="192.168.1.1"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="dns_servers">DNS-Server</Label>
                <Input
                  id="dns_servers"
                  name="dns_servers"
                  type="text"
                  value={formData.dns_servers}
                  onChange={handleInputChange}
                  placeholder="8.8.8.8, 8.8.4.4"
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
                <Label>Farbe</Label>
                <ColorPickerContainer>
                  <ColorPreview
                    color={formData.color}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    name="color"
                    readOnly
                  />
                  {showColorPicker && (
                    <ColorPickerWrapper>
                      <ChromePicker
                        color={formData.color}
                        onChange={handleColorChange}
                        disableAlpha
                      />
                    </ColorPickerWrapper>
                  )}
                </ColorPickerContainer>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Beschreibung</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {showCalculator && calculatorResult && (
                <CalculatorSection>
                  <CalculatorTitle>
                    <Calculator size={16} />
                    Subnetz-Berechnung
                  </CalculatorTitle>
                  <CalculatorGrid>
                    <CalculatorResult>
                      <ResultLabel>Netzwerk</ResultLabel>
                      <ResultValue>{calculatorResult.network}</ResultValue>
                    </CalculatorResult>
                    <CalculatorResult>
                      <ResultLabel>Broadcast</ResultLabel>
                      <ResultValue>{calculatorResult.broadcast}</ResultValue>
                    </CalculatorResult>
                    <CalculatorResult>
                      <ResultLabel>Erste IP</ResultLabel>
                      <ResultValue>{calculatorResult.firstHost}</ResultValue>
                    </CalculatorResult>
                    <CalculatorResult>
                      <ResultLabel>Letzte IP</ResultLabel>
                      <ResultValue>{calculatorResult.lastHost}</ResultValue>
                    </CalculatorResult>
                    <CalculatorResult>
                      <ResultLabel>Host-Anzahl</ResultLabel>
                      <ResultValue>{calculatorResult.hostCount}</ResultValue>
                    </CalculatorResult>
                    <CalculatorResult>
                      <ResultLabel>Subnetzmaske</ResultLabel>
                      <ResultValue>{calculatorResult.subnetMask}</ResultValue>
                    </CalculatorResult>
                  </CalculatorGrid>
                </CalculatorSection>
              )}

              <ModalActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={calculateSubnet}
                >
                  <Calculator size={16} />
                  Berechnen
                </Button>
                <Button type="submit" variant="primary">
                  <Save size={16} />
                  Speichern
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default SubnetManager;
