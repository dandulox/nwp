# 🌐 Netzwerkplaner

Ein umfassender visueller Netzwerkplaner mit Subnetting und VLAN-Management-Funktionen.

## ✨ Features

### 🎨 Visueller Editor
- **Drag & Drop Interface**: Ziehen Sie Geräte aus der Palette auf die Arbeitsfläche
- **Interaktive Verbindungen**: Erstellen Sie Verbindungen zwischen Geräten durch Ziehen
- **Echtzeit-Updates**: Änderungen werden sofort im visuellen Editor angezeigt
- **Zoom und Navigation**: Vollständige Kontrolle über die Ansicht

### 📊 Tabellenansicht
- **Übersichtliche Darstellung**: Alle Netzwerkdaten in strukturierten Tabellen
- **Filterbare Ansichten**: Geräte, Verbindungen, VLANs und Subnetze
- **Schnellbearbeitung**: Direkte Bearbeitung von Eigenschaften
- **Export-Funktionen**: Daten für weitere Verarbeitung exportieren

### 🔧 Gerätetypen
- **PC**: Desktop-Computer und Workstations
- **Handy**: Mobile Geräte und Smartphones
- **Server**: Server-Systeme und Rechenzentrum
- **Router**: Netzwerk-Router und Gateway-Geräte
- **Modem**: Internet-Modems und WAN-Verbindungen
- **Firewall**: Sicherheitsgeräte und Firewalls
- **Cluster**: Server-Cluster und Hochverfügbarkeit
- **VM**: Virtuelle Maschinen
- **NAS**: Network Attached Storage
- **Switch (Managed)**: Verwaltbare Netzwerk-Switches
- **Switch (Unmanaged)**: Einfache Netzwerk-Switches

### 🌐 Netzwerk-Features
- **Subnetting**: Automatische Berechnung von Subnetzen
- **VLAN-Management**: Vollständige VLAN-Konfiguration
- **Geschwindigkeits-Konfiguration**: Von 10 Mbps bis 100 Gbps
- **Farbkodierung**: Verschiedene Farben für Netzwerke und VLANs
- **IP-Adress-Management**: Automatische IP-Adress-Zuweisung

### 🎯 Erweiterte Funktionen
- **Projekt-Management**: Mehrere Netzwerkprojekte verwalten
- **Geräteeigenschaften**: Detaillierte Konfiguration jedes Geräts
- **Verbindungs-Management**: Port-Zuweisungen und Geschwindigkeiten
- **Subnetz-Berechner**: Integrierte Netzwerk-Berechnungstools
- **Responsive Design**: Funktioniert auf Desktop und Tablet

## 🚀 Installation

### Voraussetzungen
- Node.js (Version 16 oder höher)
- npm oder yarn

### Schnellstart

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd netzwerkplaner
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm run install-all
   ```

3. **Anwendung starten**
   ```bash
   npm run dev
   ```

4. **Browser öffnen**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manuelle Installation

**Backend installieren:**
```bash
cd server
npm install
npm run dev
```

**Frontend installieren:**
```bash
cd client
npm install
npm start
```

## 📖 Verwendung

### 1. Projekt erstellen
- Klicken Sie auf "Neues Projekt"
- Geben Sie einen Namen und eine Beschreibung ein
- Das Projekt wird automatisch erstellt

### 2. Geräte hinzufügen
- Wählen Sie einen Gerätetyp aus der Palette
- Ziehen Sie das Gerät auf die Arbeitsfläche
- Konfigurieren Sie die Eigenschaften im Eigenschaften-Panel

### 3. Verbindungen erstellen
- Klicken Sie auf ein Gerät und ziehen Sie zu einem anderen
- Eine Verbindung wird automatisch erstellt
- Konfigurieren Sie Geschwindigkeit und VLAN-Zugehörigkeit

### 4. VLANs verwalten
- Wechseln Sie zum VLAN-Tab in der Seitenleiste
- Erstellen Sie neue VLANs mit Subnetzen
- Weisen Sie Geräte und Verbindungen VLANs zu

### 5. Subnetze planen
- Verwenden Sie den Subnetz-Manager
- Berechnen Sie automatisch Netzwerk-Bereiche
- Konfigurieren Sie Gateways und DNS-Server

## 🏗️ Architektur

### Backend (Node.js + Express)
- **REST API**: Vollständige CRUD-Operationen
- **SQLite Datenbank**: Lokale Datenspeicherung
- **Validierung**: Joi-Schema-Validierung
- **Subnetting-Tools**: Integrierte Netzwerk-Berechnungen

### Frontend (React)
- **React Flow**: Visueller Netzwerk-Editor
- **Styled Components**: Moderne UI-Komponenten
- **Context API**: Zustandsverwaltung
- **Responsive Design**: Mobile-freundliche Oberfläche

### Datenbank-Schema
- **Projekte**: Netzwerkprojekt-Verwaltung
- **Geräte**: Alle Netzwerkgeräte
- **Verbindungen**: Geräte-zu-Geräte-Verbindungen
- **VLANs**: Virtuelle LANs
- **Subnetze**: IP-Netzwerk-Bereiche

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# Server-Port (Standard: 5000)
PORT=5000

# Datenbank-Pfad (Standard: ./netzwerkplaner.db)
DB_PATH=./netzwerkplaner.db
```

### API-Endpunkte

#### Projekte
- `GET /api/projects` - Alle Projekte abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/:id` - Projekt abrufen

#### Geräte
- `GET /api/projects/:projectId/devices` - Geräte abrufen
- `POST /api/projects/:projectId/devices` - Gerät erstellen
- `PUT /api/devices/:id` - Gerät aktualisieren
- `DELETE /api/devices/:id` - Gerät löschen

#### Verbindungen
- `GET /api/projects/:projectId/connections` - Verbindungen abrufen
- `POST /api/projects/:projectId/connections` - Verbindung erstellen

#### VLANs
- `GET /api/projects/:projectId/vlans` - VLANs abrufen
- `POST /api/projects/:projectId/vlans` - VLAN erstellen

#### Subnetze
- `GET /api/projects/:projectId/subnets` - Subnetze abrufen
- `POST /api/projects/:projectId/subnets` - Subnetz erstellen

#### Tools
- `POST /api/tools/subnet-calculator` - Subnetz berechnen

## 🎨 Anpassung

### Farben ändern
Die Farben können in den CSS-Dateien angepasst werden:
- Primärfarbe: `#667eea`
- Sekundärfarbe: `#764ba2`
- Akzentfarben: Verschiedene Gerätetyp-Farben

### Neue Gerätetypen hinzufügen
1. Backend: Gerätetyp in `deviceSchema` hinzufügen
2. Frontend: Icon und Konfiguration in `deviceTypes` ergänzen

### Erweiterte Features
- **Export/Import**: JSON-basierte Projekt-Exporte
- **Kollaboration**: Mehrbenutzer-Unterstützung
- **Templates**: Vorgefertigte Netzwerk-Templates
- **Monitoring**: Netzwerk-Überwachung und -Status

## 🐛 Fehlerbehebung

### Häufige Probleme

**Port bereits belegt:**
```bash
# Anderen Port verwenden
PORT=3001 npm run dev
```

**Datenbank-Fehler:**
```bash
# Datenbank zurücksetzen
rm server/netzwerkplaner.db
npm run dev
```

**Abhängigkeiten-Problem:**
```bash
# Node-Module neu installieren
rm -rf node_modules
npm install
```

## 📝 Lizenz

MIT License - Siehe [LICENSE](LICENSE) für Details.

## 🤝 Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- Dokumentation durchsuchen
- Community-Forum besuchen

---

**Entwickelt mit ❤️ für Netzwerk-Administratoren und IT-Profis**
