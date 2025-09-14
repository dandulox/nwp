import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useProject } from '../context/ProjectContext';
import VisualEditor from './VisualEditor';
import TableView from './TableView';
import DevicePalette from './DevicePalette';
import PropertiesPanel from './PropertiesPanel';
import VLanManager from './VLanManager';
import SubnetManager from './SubnetManager';
import { ArrowLeft, Eye, Table, Settings, Network } from 'lucide-react';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const ProjectTitle = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  flex: 1;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: ${props => props.active ? '#333' : '#666'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #333;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const SidebarTab = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? 'white' : '#f8f9fa'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  color: ${props => props.active ? '#333' : '#666'};
  border-bottom: ${props => props.active ? '2px solid #667eea' : '2px solid transparent'};
  transition: all 0.2s;

  &:hover {
    background: white;
    color: #333;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
`;

const Error = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin: 1rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
`;

function NetworkEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { 
    currentProject, 
    devices, 
    connections, 
    vlans, 
    subnets, 
    loading, 
    error, 
    api 
  } = useProject();
  
  const [view, setView] = useState('visual'); // 'visual' oder 'table'
  const [activeSidebarTab, setActiveSidebarTab] = useState('devices');
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      await Promise.all([
        api.getDevices(projectId),
        api.getConnections(projectId),
        api.getVlans(projectId),
        api.getSubnets(projectId)
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Projektdaten:', error);
    }
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };

  const handleDeviceUpdate = async (deviceData) => {
    try {
      await api.updateDevice(selectedDevice.id, deviceData);
      setSelectedDevice(null);
      await loadProjectData();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Geräts:', error);
    }
  };

  const handleDeviceCreate = async (deviceData) => {
    try {
      await api.createDevice(projectId, deviceData);
      await loadProjectData();
    } catch (error) {
      console.error('Fehler beim Erstellen des Geräts:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>Lade Projekt...</Loading>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Error>Fehler: {error}</Error>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/projects')}>
          <ArrowLeft size={20} />
          Zurück
        </BackButton>
        <ProjectTitle>
          {currentProject?.name || 'Netzwerkprojekt'}
        </ProjectTitle>
        <ViewToggle>
          <ViewButton
            active={view === 'visual'}
            onClick={() => setView('visual')}
          >
            <Eye size={16} />
            Visuell
          </ViewButton>
          <ViewButton
            active={view === 'table'}
            onClick={() => setView('table')}
          >
            <Table size={16} />
            Tabelle
          </ViewButton>
        </ViewToggle>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarTabs>
            <SidebarTab
              active={activeSidebarTab === 'devices'}
              onClick={() => setActiveSidebarTab('devices')}
            >
              <Network size={16} />
              Geräte
            </SidebarTab>
            <SidebarTab
              active={activeSidebarTab === 'vlans'}
              onClick={() => setActiveSidebarTab('vlans')}
            >
              <Settings size={16} />
              VLANs
            </SidebarTab>
          </SidebarTabs>
          
          <SidebarContent>
            {activeSidebarTab === 'devices' && (
              <DevicePalette
                onDeviceCreate={handleDeviceCreate}
                onDeviceSelect={handleDeviceSelect}
                selectedDevice={selectedDevice}
              />
            )}
            {activeSidebarTab === 'vlans' && (
              <VLanManager projectId={projectId} />
            )}
          </SidebarContent>
        </Sidebar>

        <ContentArea>
          {view === 'visual' ? (
            <VisualEditor
              devices={devices}
              connections={connections}
              onDeviceSelect={handleDeviceSelect}
              selectedDevice={selectedDevice}
            />
          ) : (
            <TableView
              devices={devices}
              connections={connections}
              vlans={vlans}
              subnets={subnets}
            />
          )}
        </ContentArea>

        {selectedDevice && (
          <PropertiesPanel
            device={selectedDevice}
            onUpdate={handleDeviceUpdate}
            onClose={() => setSelectedDevice(null)}
          />
        )}
      </MainContent>
    </Container>
  );
}

export default NetworkEditor;
