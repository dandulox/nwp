import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useProject } from '../context/ProjectContext';
import { Plus, Folder, Calendar, Edit, Trash2 } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const CreateButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const ProjectIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.5rem;
`;

const ProjectName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const ProjectDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;

  ${ProjectCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : '#5a6268'};
  }
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
`;

const ModalTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: #333;
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
  font-size: 1rem;

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
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
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

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

function ProjectList() {
  const navigate = useNavigate();
  const { projects, loading, api } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    api.getProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const project = await api.createProject(newProject);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Projekts:', error);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <Loading>Lade Projekte...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Meine Netzwerkprojekte</Title>
        <CreateButton onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Neues Projekt
        </CreateButton>
      </Header>

      {projects.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🌐</EmptyIcon>
          <h3>Noch keine Projekte</h3>
          <p>Erstellen Sie Ihr erstes Netzwerkprojekt, um loszulegen.</p>
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {projects.map((project) => (
            <ProjectCard key={project.id} onClick={() => handleProjectClick(project.id)}>
              <ProjectIcon>
                <Folder size={24} />
              </ProjectIcon>
              <ProjectName>{project.name}</ProjectName>
              <ProjectDescription>{project.description || 'Keine Beschreibung'}</ProjectDescription>
              <ProjectMeta>
                <span>
                  <Calendar size={16} />
                  {formatDate(project.created_at)}
                </span>
              </ProjectMeta>
              <ProjectActions>
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Edit functionality
                  }}
                >
                  <Edit size={16} />
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Delete functionality
                  }}
                >
                  <Trash2 size={16} />
                </ActionButton>
              </ProjectActions>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      )}

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Neues Projekt erstellen</ModalTitle>
            <form onSubmit={handleCreateProject}>
              <FormGroup>
                <Label htmlFor="name">Projektname</Label>
                <Input
                  id="name"
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="description">Beschreibung</Label>
                <TextArea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </FormGroup>
              <ModalActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" variant="primary">
                  Erstellen
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ProjectList;
