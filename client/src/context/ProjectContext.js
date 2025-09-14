import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const ProjectContext = createContext();

const initialState = {
  projects: [],
  currentProject: null,
  devices: [],
  connections: [],
  vlans: [],
  subnets: [],
  loading: false,
  error: null
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map(device =>
          device.id === action.payload.id ? action.payload : device
        )
      };
    case 'DELETE_DEVICE':
      return {
        ...state,
        devices: state.devices.filter(device => device.id !== action.payload)
      };
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload };
    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.payload] };
    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload)
      };
    case 'SET_VLANS':
      return { ...state, vlans: action.payload };
    case 'ADD_VLAN':
      return { ...state, vlans: [...state.vlans, action.payload] };
    case 'SET_SUBNETS':
      return { ...state, subnets: action.payload };
    case 'ADD_SUBNET':
      return { ...state, subnets: [...state.subnets, action.payload] };
    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // API-Funktionen
  const api = {
    // Projekte
    getProjects: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('/api/projects');
        dispatch({ type: 'SET_PROJECTS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createProject: async (projectData) => {
      try {
        const response = await axios.post('/api/projects', projectData);
        await api.getProjects(); // Refresh project list
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // Geräte
    getDevices: async (projectId) => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/devices`);
        dispatch({ type: 'SET_DEVICES', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createDevice: async (projectId, deviceData) => {
      try {
        const response = await axios.post(`/api/projects/${projectId}/devices`, deviceData);
        dispatch({ type: 'ADD_DEVICE', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateDevice: async (deviceId, deviceData) => {
      try {
        const response = await axios.put(`/api/devices/${deviceId}`, deviceData);
        dispatch({ type: 'UPDATE_DEVICE', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteDevice: async (deviceId) => {
      try {
        await axios.delete(`/api/devices/${deviceId}`);
        dispatch({ type: 'DELETE_DEVICE', payload: deviceId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // Verbindungen
    getConnections: async (projectId) => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/connections`);
        dispatch({ type: 'SET_CONNECTIONS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createConnection: async (projectId, connectionData) => {
      try {
        const response = await axios.post(`/api/projects/${projectId}/connections`, connectionData);
        dispatch({ type: 'ADD_CONNECTION', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    deleteConnection: async (connectionId) => {
      try {
        await axios.delete(`/api/connections/${connectionId}`);
        dispatch({ type: 'DELETE_CONNECTION', payload: connectionId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // VLANs
    getVlans: async (projectId) => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/vlans`);
        dispatch({ type: 'SET_VLANS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createVlan: async (projectId, vlanData) => {
      try {
        const response = await axios.post(`/api/projects/${projectId}/vlans`, vlanData);
        dispatch({ type: 'ADD_VLAN', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // Subnetze
    getSubnets: async (projectId) => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/subnets`);
        dispatch({ type: 'SET_SUBNETS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },

    createSubnet: async (projectId, subnetData) => {
      try {
        const response = await axios.post(`/api/projects/${projectId}/subnets`, subnetData);
        dispatch({ type: 'ADD_SUBNET', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    // Subnetting-Tools
    calculateSubnet: async (network, prefixLength) => {
      try {
        const response = await axios.post('/api/tools/subnet-calculator', {
          network,
          prefixLength
        });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    }
  };

  const value = {
    ...state,
    api,
    dispatch
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject muss innerhalb eines ProjectProvider verwendet werden');
  }
  return context;
};
