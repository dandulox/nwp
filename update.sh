#!/bin/bash

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen für farbige Ausgabe
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

echo "🌐 Netzwerkplaner Update & Start"
echo "================================="

# Prüfe ob Git installiert ist
if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert. Bitte installieren Sie Git zuerst."
    exit 1
fi

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert. Bitte installieren Sie Node.js zuerst."
    exit 1
fi

print_success "Node.js Version: $(node --version)"
print_success "npm Version: $(npm --version)"

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -d ".git" ]; then
    print_status "Git-Repository nicht gefunden. Klone Repository..."
    
    # Prüfe ob nwp Ordner bereits existiert
    if [ -d "../nwp" ]; then
        print_status "nwp Ordner existiert bereits. Wechsle dorthin..."
        cd ../nwp
    else
        print_status "Klone Repository..."
        git clone https://github.com/dandulox/nwp.git ../nwp
        cd ../nwp
    fi
    
    print_success "Repository geklont in: $(pwd)"
else
    print_status "Git-Repository gefunden. Aktualisiere..."
    
    # Alle lokalen Änderungen verwerfen
    print_status "Verwerfe alle lokalen Änderungen..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
    git checkout main
    git reset --hard origin/main
    
    # Repository aktualisieren
    print_status "Pulle neueste Änderungen..."
    git pull origin main --force
    
    print_success "Repository aktualisiert"
fi

# Lokale Fixes anwenden
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

# Client public Ordner erstellen falls nicht vorhanden
if [ ! -d "client/public" ]; then
    print_status "Erstelle client/public Ordner..."
    mkdir -p client/public
fi

# Client index.html erstellen falls nicht vorhanden
if [ ! -f "client/public/index.html" ]; then
    print_status "Erstelle client/public/index.html..."
    cat > client/public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Netzwerkplaner - Visueller Netzwerkplaner mit Subnetting und VLAN-Management"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Netzwerkplaner</title>
  </head>
  <body>
    <noscript>Sie müssen JavaScript aktivieren, um diese App zu verwenden.</noscript>
    <div id="root"></div>
  </body>
</html>
HTML_EOF
fi

# Client manifest.json erstellen falls nicht vorhanden
if [ ! -f "client/public/manifest.json" ]; then
    print_status "Erstelle client/public/manifest.json..."
    cat > client/public/manifest.json << 'MANIFEST_EOF'
{
  "short_name": "Netzwerkplaner",
  "name": "Netzwerkplaner - Visueller Netzwerkplaner",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
MANIFEST_EOF
fi

# Client robots.txt erstellen falls nicht vorhanden
if [ ! -f "client/public/robots.txt" ]; then
    print_status "Erstelle client/public/robots.txt..."
    cat > client/public/robots.txt << 'ROBOTS_EOF'
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
ROBOTS_EOF
fi

# Server index.js korrigieren (immer überschreiben für korrekte Version)
print_status "Korrigiere server/index.js..."
# Kopiere die korrekte server/index.js Datei
cp server/index.js server/index.js.backup 2>/dev/null || true
# Verwende die separate korrigierte Datei
if [ -f "server-index-fixed.js" ]; then
    cp server-index-fixed.js server/index.js
    print_success "Server index.js mit korrigierter Version überschrieben"
else
    print_warning "server-index-fixed.js nicht gefunden, verwende Standard-Version"
fi

# Alle Scripts ausführbar machen
print_status "Setze Ausführungsrechte für alle Scripts..."
chmod +x *.sh
chmod +x *.py 2>/dev/null || true

# Beende eventuell laufende Prozesse
print_status "Beende eventuell laufende Prozesse..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# Lösche node_modules für saubere Installation
print_status "Lösche node_modules für saubere Installation..."
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules

# Lösche package-lock Dateien
print_status "Lösche package-lock Dateien..."
rm -f package-lock.json
rm -f server/package-lock.json
rm -f client/package-lock.json

# Leere npm Cache
print_status "Leere npm Cache..."
npm cache clean --force

# Installiere/aktualisiere Root-Abhängigkeiten
print_status "Installiere/aktualisiere Root-Abhängigkeiten..."
npm install

if [ $? -eq 0 ]; then
    print_success "Root-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Root-Abhängigkeiten"
    exit 1
fi

# Installiere/aktualisiere Server-Abhängigkeiten
print_status "Installiere/aktualisiere Server-Abhängigkeiten..."
cd server && npm install && cd ..

if [ $? -eq 0 ]; then
    print_success "Server-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Server-Abhängigkeiten"
    exit 1
fi

# Installiere/aktualisiere Client-Abhängigkeiten
print_status "Installiere/aktualisiere Client-Abhängigkeiten..."
cd client && npm install && cd ..

if [ $? -eq 0 ]; then
    print_success "Client-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Client-Abhängigkeiten"
    exit 1
fi

print_success "Alle Abhängigkeiten installiert/aktualisiert!"

# Starte Netzwerkplaner
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

# Starte Anwendung
print_status "Starte Anwendung..."
npm run dev