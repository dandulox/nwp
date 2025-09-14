#!/bin/bash

# Netzwerkplaner Update Script
# Dieses Script aktualisiert das Repository und startet die Anwendung

echo "🌐 Netzwerkplaner Update & Start"
echo "================================="

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Script ausführbar machen
chmod +x "$0"

# Prüfen ob das Script ausführbar ist
if [ ! -x "$0" ]; then
    print_warning "Script ist nicht ausführbar. Versuche Rechte zu setzen..."
    chmod +x "$0"
fi

# Prüfen ob Git installiert ist
if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert. Bitte installieren Sie Git."
    exit 1
fi

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert. Bitte installieren Sie Node.js (Version 16 oder höher) von https://nodejs.org/"
    exit 1
fi

# Node.js Version prüfen
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js Version 16 oder höher ist erforderlich. Aktuelle Version: $(node -v)"
    exit 1
fi

print_success "Node.js Version: $(node -v)"
print_success "npm Version: $(npm -v)"

# Repository URL
REPO_URL="https://github.com/dandulox/nwp.git"

# Prüfen ob wir in einem Git-Repository sind
if [ ! -d ".git" ]; then
    print_warning "Kein Git-Repository gefunden. Klone das Repository..."
    
    # Aktuelles Verzeichnis sichern
    CURRENT_DIR=$(pwd)
    
    # Ein Verzeichnis höher gehen und Repository klonen
    cd ..
    git clone $REPO_URL nwp
    cd nwp
    
    print_success "Repository geklont in: $(pwd)"
else
    print_status "Git-Repository gefunden. Aktualisiere..."
    
    # Alle lokalen Änderungen verwerfen
    print_status "Verwerfe lokale Änderungen..."
    git fetch origin
    git reset --hard origin/main
    
    # Repository aktualisieren
    print_status "Pulle neueste Änderungen..."
    git pull origin main
    
    # Lokale Fixes anwenden (falls Repository noch alte Versionen hat)
    print_status "Wende lokale Fixes an..."
    
    # Server package.json korrigieren (ip-cidr entfernen)
    if grep -q "ip-cidr" server/package.json; then
        print_status "Korrigiere server/package.json..."
        sed -i '/ip-cidr/d' server/package.json
    fi
    
    # Client package.json korrigieren (reactflow Version)
    if grep -q "react-flow" client/package.json; then
        print_status "Korrigiere client/package.json..."
        sed -i 's/"react-flow-renderer": "[^"]*",//' client/package.json
        sed -i 's/"react-flow": "[^"]*",/"reactflow": "^11.10.4",/' client/package.json
    fi
    
    # Server index.js korrigieren (ip-cidr entfernen)
    if grep -q "require('ip-cidr')" server/index.js; then
        print_status "Korrigiere server/index.js..."
        # Erstelle eine temporäre Datei mit den Korrekturen
        cat > server/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// ip-cidr ist jetzt ein ES Module, verwenden wir eine alternative Implementierung
// const ipCidr = require('ip-cidr');
const Joi = require('joi');

// Einfache Subnet-Berechnung ohne externe Abhängigkeiten
function calculateSubnet(network, prefixLength) {
  try {
    const [ip, mask] = network.split('/');
    const prefix = parseInt(mask || prefixLength);
    
    if (prefix < 0 || prefix > 32) {
      throw new Error('Ungültige Präfix-Länge');
    }
    
    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(part => part < 0 || part > 255)) {
      throw new Error('Ungültige IP-Adresse');
    }
    
    const hostBits = 32 - prefix;
    const hostCount = Math.pow(2, hostBits) - 2; // -2 für Netzwerk und Broadcast
    
    // Netzwerk-Adresse berechnen
    const networkMask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const networkParts = [
      (ipParts[0] & (networkMask >>> 24)) >>> 0,
      (ipParts[1] & (networkMask >>> 16)) & 0xFF,
      (ipParts[2] & (networkMask >>> 8)) & 0xFF,
      (ipParts[3] & networkMask) & 0xFF
    ];
    
    // Broadcast-Adresse berechnen
    const broadcastParts = [
      networkParts[0] | ((~networkMask >>> 24) & 0xFF),
      networkParts[1] | ((~networkMask >>> 16) & 0xFF),
      networkParts[2] | ((~networkMask >>> 8) & 0xFF),
      networkParts[3] | (~networkMask & 0xFF)
    ];
    
    // Erste und letzte Host-Adresse
    const firstHost = [...networkParts];
    firstHost[3] = (firstHost[3] + 1) % 256;
    
    const lastHost = [...broadcastParts];
    lastHost[3] = (lastHost[3] - 1 + 256) % 256;
    
    // Subnetzmaske
    const subnetMask = [
      (networkMask >>> 24) & 0xFF,
      (networkMask >>> 16) & 0xFF,
      (networkMask >>> 8) & 0xFF,
      networkMask & 0xFF
    ];
    
    return {
      network: networkParts.join('.'),
      broadcast: broadcastParts.join('.'),
      firstHost: firstHost.join('.'),
      lastHost: lastHost.join('.'),
      hostCount: hostCount,
      subnetMask: subnetMask.join('.')
    };
  } catch (error) {
    throw new Error('Ungültiges Netzwerk: ' + error.message);
  }
}

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(express.json());

// Datenbank initialisieren
const db = new sqlite3.Database('./netzwerkplaner.db');

// Datenbankschema erstellen
db.serialize(() => {
  // Projekte
  db.run(\`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )\`);

  // Geräte
  db.run(\`CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    x INTEGER DEFAULT 0,
    y INTEGER DEFAULT 0,
    ip_address TEXT,
    mac_address TEXT,
    vlan_id INTEGER,
    speed INTEGER DEFAULT 1000,
    managed BOOLEAN DEFAULT false,
    properties TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
  )\`);

  // Verbindungen
  db.run(\`CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    from_device_id TEXT NOT NULL,
    to_device_id TEXT NOT NULL,
    from_port INTEGER,
    to_port INTEGER,
    speed INTEGER DEFAULT 1000,
    vlan_id INTEGER,
    color TEXT DEFAULT '#3498db',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (from_device_id) REFERENCES devices (id),
    FOREIGN KEY (to_device_id) REFERENCES devices (id)
  )\`);

  // VLANs
  db.run(\`CREATE TABLE IF NOT EXISTS vlans (
    id INTEGER PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    vlan_id INTEGER NOT NULL,
    subnet TEXT NOT NULL,
    color TEXT DEFAULT '#3498db',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
  )\`);

  // Subnetze
  db.run(\`CREATE TABLE IF NOT EXISTS subnets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    network TEXT NOT NULL,
    subnet_mask TEXT NOT NULL,
    gateway TEXT,
    dns_servers TEXT,
    vlan_id INTEGER,
    color TEXT DEFAULT '#3498db',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
  )\`);
});

// Validierungsschemas
const deviceSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('pc', 'handy', 'server', 'router', 'modem', 'firewall', 'cluster', 'vm', 'nas', 'switch_managed', 'switch_unmanaged').required(),
  x: Joi.number().integer().default(0),
  y: Joi.number().integer().default(0),
  ip_address: Joi.string().ip().allow(''),
  mac_address: Joi.string().pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).allow(''),
  vlan_id: Joi.number().integer().min(1).max(4094).allow(null),
  speed: Joi.number().integer().min(10).max(100000).default(1000),
  managed: Joi.boolean().default(false),
  properties: Joi.string().allow('')
});

const connectionSchema = Joi.object({
  from_device_id: Joi.string().required(),
  to_device_id: Joi.string().required(),
  from_port: Joi.number().integer().min(1).max(48).allow(null),
  to_port: Joi.number().integer().min(1).max(48).allow(null),
  speed: Joi.number().integer().min(10).max(100000).default(1000),
  vlan_id: Joi.number().integer().min(1).max(4094).allow(null),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3498db')
});

const vlanSchema = Joi.object({
  name: Joi.string().required(),
  vlan_id: Joi.number().integer().min(1).max(4094).required(),
  subnet: Joi.string().required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3498db'),
  description: Joi.string().allow('')
});

const subnetSchema = Joi.object({
  name: Joi.string().required(),
  network: Joi.string().required(),
  subnet_mask: Joi.string().required(),
  gateway: Joi.string().ip().allow(''),
  dns_servers: Joi.string().allow(''),
  vlan_id: Joi.number().integer().min(1).max(4094).allow(null),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3498db'),
  description: Joi.string().allow('')
});

// API Routes

// Projekte
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY updated_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO projects (id, name, description) VALUES (?, ?, ?)', 
    [id, name, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, description });
  });
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!project) {
      res.status(404).json({ error: 'Projekt nicht gefunden' });
      return;
    }
    res.json(project);
  });
});

// Geräte
app.get('/api/projects/:projectId/devices', (req, res) => {
  const { projectId } = req.params;
  
  db.all('SELECT * FROM devices WHERE project_id = ?', [projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/projects/:projectId/devices', (req, res) => {
  const { projectId } = req.params;
  const { error, value } = deviceSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const id = uuidv4();
  const { name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties } = value;
  
  db.run(\`INSERT INTO devices (id, project_id, name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, 
    [id, projectId, name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, project_id: projectId, name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties });
  });
});

app.put('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const { error, value } = deviceSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const { name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties } = value;
  
  db.run(\`UPDATE devices SET name = ?, type = ?, x = ?, y = ?, ip_address = ?, mac_address = ?, vlan_id = ?, speed = ?, managed = ?, properties = ?
          WHERE id = ?\`, 
    [name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, type, x, y, ip_address, mac_address, vlan_id, speed, managed, properties });
  });
});

app.delete('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM devices WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Gerät gelöscht' });
  });
});

// Verbindungen
app.get('/api/projects/:projectId/connections', (req, res) => {
  const { projectId } = req.params;
  
  db.all('SELECT * FROM connections WHERE project_id = ?', [projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/projects/:projectId/connections', (req, res) => {
  const { projectId } = req.params;
  const { error, value } = connectionSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const id = uuidv4();
  const { from_device_id, to_device_id, from_port, to_port, speed, vlan_id, color } = value;
  
  db.run(\`INSERT INTO connections (id, project_id, from_device_id, to_device_id, from_port, to_port, speed, vlan_id, color) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`, 
    [id, projectId, from_device_id, to_device_id, from_port, to_port, speed, vlan_id, color], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, project_id: projectId, from_device_id, to_device_id, from_port, to_port, speed, vlan_id, color });
  });
});

// VLANs
app.get('/api/projects/:projectId/vlans', (req, res) => {
  const { projectId } = req.params;
  
  db.all('SELECT * FROM vlans WHERE project_id = ? ORDER BY vlan_id', [projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/projects/:projectId/vlans', (req, res) => {
  const { projectId } = req.params;
  const { error, value } = vlanSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const { name, vlan_id, subnet, color, description } = value;
  
  db.run(\`INSERT INTO vlans (project_id, name, vlan_id, subnet, color, description) 
          VALUES (?, ?, ?, ?, ?, ?)\`, 
    [projectId, name, vlan_id, subnet, color, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, project_id: projectId, name, vlan_id, subnet, color, description });
  });
});

// Subnetze
app.get('/api/projects/:projectId/subnets', (req, res) => {
  const { projectId } = req.params;
  
  db.all('SELECT * FROM subnets WHERE project_id = ?', [projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/projects/:projectId/subnets', (req, res) => {
  const { projectId } = req.params;
  const { error, value } = subnetSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const id = uuidv4();
  const { name, network, subnet_mask, gateway, dns_servers, vlan_id, color, description } = value;
  
  db.run(\`INSERT INTO subnets (id, project_id, name, network, subnet_mask, gateway, dns_servers, vlan_id, color, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`, 
    [id, projectId, name, network, subnet_mask, gateway, dns_servers, vlan_id, color, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, project_id: projectId, name, network, subnet_mask, gateway, dns_servers, vlan_id, color, description });
  });
});

// Subnetting-Tools
app.post('/api/tools/subnet-calculator', (req, res) => {
  const { network, prefixLength } = req.body;
  
  try {
    const result = calculateSubnet(network, prefixLength);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Server läuft auf Port \${PORT}\`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Datenbankverbindung geschlossen.');
    process.exit(0);
  });
});
EOF
    fi
    
    print_success "Repository aktualisiert"
fi

# Alle Scripts ausführbar machen
print_status "Setze Ausführungsrechte für alle Scripts..."
chmod +x *.sh 2>/dev/null || true
chmod +x *.py 2>/dev/null || true

# Prüfen ob package.json existiert
if [ ! -f "package.json" ]; then
    print_error "package.json nicht gefunden. Ist dies ein gültiges Netzwerkplaner-Repository?"
    exit 1
fi

# Alle laufenden Prozesse beenden (falls vorhanden)
print_status "Beende eventuell laufende Prozesse..."
pkill -f "netzwerkplaner" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Kurz warten
sleep 2

# Node-Module löschen (für saubere Installation)
print_status "Lösche node_modules für saubere Installation..."
rm -rf node_modules 2>/dev/null || true
rm -rf server/node_modules 2>/dev/null || true
rm -rf client/node_modules 2>/dev/null || true

# Package-lock Dateien löschen
print_status "Lösche package-lock Dateien..."
rm -f package-lock.json 2>/dev/null || true
rm -f server/package-lock.json 2>/dev/null || true
rm -f client/package-lock.json 2>/dev/null || true

# npm Cache leeren
print_status "Leere npm Cache..."
npm cache clean --force 2>/dev/null || true

# Root-Abhängigkeiten installieren/aktualisieren
print_status "Installiere/aktualisiere Root-Abhängigkeiten..."
npm install

# Server-Abhängigkeiten installieren/aktualisieren
print_status "Installiere/aktualisiere Server-Abhängigkeiten..."
cd server
npm install
cd ..

# Client-Abhängigkeiten installieren/aktualisieren
print_status "Installiere/aktualisiere Client-Abhängigkeiten..."
cd client
npm install
cd ..

# Umgebungsvariablen für Port 80 setzen
export PORT=80
export REACT_APP_API_URL=http://localhost:80

print_success "Alle Abhängigkeiten installiert/aktualisiert!"
echo ""
print_status "Starte Netzwerkplaner auf Port 80..."
echo ""
echo "🌐 Die Anwendung wird gestartet:"
echo "   - Frontend: http://localhost:80"
echo "   - Backend API: http://localhost:80/api"
echo ""
echo "⚠️  Hinweis: Port 80 erfordert möglicherweise Administrator-Rechte"
echo "   Falls Fehler auftreten, versuchen Sie: sudo ./update.sh"
echo ""
echo "Drücken Sie Ctrl+C zum Beenden"
echo ""

# Anwendung starten
print_status "Starte Anwendung..."
npm run dev
