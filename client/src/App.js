import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import ProjectList from './components/ProjectList';
import NetworkEditor from './components/NetworkEditor';
import { ProjectProvider } from './context/ProjectContext';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: hidden;
`;

function App() {
  return (
    <ProjectProvider>
      <Router>
        <AppContainer>
          <Header>
            <HeaderTitle>🌐 Netzwerkplaner</HeaderTitle>
          </Header>
          <MainContent>
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/project/:projectId" element={<NetworkEditor />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </ProjectProvider>
  );
}

export default App;
