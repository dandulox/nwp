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
