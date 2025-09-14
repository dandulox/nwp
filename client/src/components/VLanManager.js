import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useProject } from '../context/ProjectContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
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

const VlanList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VlanItem = styled.div`
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

const VlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const VlanName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 1rem;
`;

const VlanActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;

  ${VlanItem}:hover & {
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

const VlanDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const VlanDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VlanBadge = styled.span`
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
  max-width: 500px;
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

function VLanManager({ projectId }) {
  const { vlans, api } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [editingVlan, setEditingVlan] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vlan_id: '',
    subnet: '',
    color: '#3498db',
    description: ''
  });

  useEffect(() => {
    if (projectId) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        vlan_id: parseInt(formData.vlan_id)
      };

      if (editingVlan) {
        // TODO: Implement update functionality
        console.log('Update VLAN:', submitData);
      } else {
        await api.createVlan(projectId, submitData);
      }

      setShowModal(false);
      setEditingVlan(null);
      setFormData({
        name: '',
        vlan_id: '',
        subnet: '',
        color: '#3498db',
        description: ''
      });
    } catch (error) {
      console.error('Fehler beim Speichern des VLANs:', error);
    }
  };

  const handleEdit = (vlan) => {
    setEditingVlan(vlan);
    setFormData({
      name: vlan.name,
      vlan_id: vlan.vlan_id.toString(),
      subnet: vlan.subnet,
      color: vlan.color,
      description: vlan.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (vlanId) => {
    if (window.confirm('Möchten Sie dieses VLAN wirklich löschen?')) {
      // TODO: Implement delete functionality
      console.log('Delete VLAN:', vlanId);
    }
  };

  const openModal = () => {
    setEditingVlan(null);
    setFormData({
      name: '',
      vlan_id: '',
      subnet: '',
      color: '#3498db',
      description: ''
    });
    setShowModal(true);
  };

  return (
    <Container>
      <Header>
        <Title>VLANs</Title>
        <AddButton onClick={openModal}>
          <Plus size={16} />
          VLAN hinzufügen
        </AddButton>
      </Header>

      {vlans.length === 0 ? (
        <EmptyState>
          <p>Noch keine VLANs definiert</p>
          <p>Erstellen Sie Ihr erstes VLAN, um loszulegen.</p>
        </EmptyState>
      ) : (
        <VlanList>
          {vlans.map((vlan) => (
            <VlanItem key={vlan.id}>
              <VlanHeader>
                <VlanName>{vlan.name}</VlanName>
                <VlanActions>
                  <ActionButton onClick={() => handleEdit(vlan)}>
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => handleDelete(vlan.id)}>
                    <Trash2 size={16} />
                  </ActionButton>
                </VlanActions>
              </VlanHeader>
              <VlanDetails>
                <VlanDetail>
                  <strong>VLAN ID:</strong>
                  <VlanBadge color={vlan.color}>
                    {vlan.vlan_id}
                  </VlanBadge>
                </VlanDetail>
                <VlanDetail>
                  <strong>Subnet:</strong>
                  <span>{vlan.subnet}</span>
                </VlanDetail>
                <VlanDetail>
                  <strong>Farbe:</strong>
                  <ColorIndicator color={vlan.color} />
                  <span>{vlan.color}</span>
                </VlanDetail>
                <VlanDetail>
                  <strong>Beschreibung:</strong>
                  <span>{vlan.description || '-'}</span>
                </VlanDetail>
              </VlanDetails>
            </VlanItem>
          ))}
        </VlanList>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingVlan ? 'VLAN bearbeiten' : 'Neues VLAN erstellen'}
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
                <Label htmlFor="vlan_id">VLAN ID</Label>
                <Input
                  id="vlan_id"
                  name="vlan_id"
                  type="number"
                  min="1"
                  max="4094"
                  value={formData.vlan_id}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subnet">Subnet</Label>
                <Input
                  id="subnet"
                  name="subnet"
                  type="text"
                  value={formData.subnet}
                  onChange={handleInputChange}
                  placeholder="192.168.1.0/24"
                  required
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

              <ModalActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Abbrechen
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

export default VLanManager;
