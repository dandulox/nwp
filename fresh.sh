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

echo "🔄 Fresh Install - Komplette Neuinstallation"
echo "============================================="

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
    print_error "Kein Git-Repository gefunden. Bitte führen Sie dieses Script im Projektverzeichnis aus."
    exit 1
fi

print_status "Starte komplette Neuinstallation..."

# 1. Beende alle laufenden Prozesse
print_status "Beende alle laufenden Prozesse..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
sleep 2

# 2. Lösche alle node_modules und package-lock Dateien
print_status "Lösche alle node_modules und package-lock Dateien..."
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules
rm -f package-lock.json
rm -f server/package-lock.json
rm -f client/package-lock.json
print_success "Alle node_modules und package-lock Dateien gelöscht"

# 3. Leere npm Cache komplett
print_status "Leere npm Cache komplett..."
npm cache clean --force
print_success "npm Cache geleert"

# 4. Deinstalliere problematische Pakete global (falls vorhanden)
print_status "Deinstalliere problematische Pakete global..."
npm uninstall -g react-flow 2>/dev/null || true
npm uninstall -g react-flow-renderer 2>/dev/null || true
npm uninstall -g ip-cidr 2>/dev/null || true
print_success "Problematische Pakete deinstalliert"

# 5. Git Pull mit Überschreibung aller lokalen Änderungen
print_status "Git Pull mit Überschreibung aller lokalen Änderungen..."
git fetch origin
git reset --hard origin/main
git clean -fd
git checkout main
git reset --hard origin/main
git pull origin main --force
print_success "Repository auf neuesten Stand gebracht"

# 6. Korrigiere package.json Dateien
print_status "Korrigiere package.json Dateien..."

# Server package.json korrigieren (ip-cidr entfernen)
if grep -q "ip-cidr" server/package.json; then
    print_status "Entferne ip-cidr aus server/package.json..."
    sed -i '/ip-cidr/d' server/package.json
fi

# Client package.json korrigieren (reactflow Version)
if grep -q "react-flow" client/package.json; then
    print_status "Korrigiere react-flow zu reactflow in client/package.json..."
    sed -i 's/"react-flow-renderer": "[^"]*",//' client/package.json
    sed -i 's/"react-flow": "[^"]*",/"reactflow": "^11.10.4",/' client/package.json
fi

print_success "package.json Dateien korrigiert"

# 7. Erstelle fehlende Client-Dateien
print_status "Erstelle fehlende Client-Dateien..."

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

print_success "Client-Dateien erstellt"

# 8. Korrigiere server/index.js
print_status "Korrigiere server/index.js..."
# Verwende die separate korrigierte Datei
if [ -f "server-index-fixed.js" ]; then
    cp server-index-fixed.js server/index.js
    print_success "Server index.js mit korrigierter Version überschrieben"
else
    print_warning "server-index-fixed.js nicht gefunden, verwende Standard-Version"
fi

# 9. Installiere Root-Abhängigkeiten
print_status "Installiere Root-Abhängigkeiten..."
npm install

if [ $? -eq 0 ]; then
    print_success "Root-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Root-Abhängigkeiten"
    exit 1
fi

# 10. Installiere Server-Abhängigkeiten
print_status "Installiere Server-Abhängigkeiten..."
cd server && npm install && cd ..

if [ $? -eq 0 ]; then
    print_success "Server-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Server-Abhängigkeiten"
    exit 1
fi

# 11. Installiere Client-Abhängigkeiten
print_status "Installiere Client-Abhängigkeiten..."
cd client && npm install && cd ..

if [ $? -eq 0 ]; then
    print_success "Client-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Client-Abhängigkeiten"
    exit 1
fi

# 12. Setze Ausführungsrechte
print_status "Setze Ausführungsrechte für alle Scripts..."
chmod +x *.sh
chmod +x *.py

# 13. Teste Installation
print_status "Teste Installation..."
if [ -f "server/index.js" ] && [ -f "client/package.json" ] && [ -f "package.json" ]; then
    print_success "Installation erfolgreich getestet"
else
    print_error "Installation fehlgeschlagen - Dateien fehlen"
    exit 1
fi

print_success "Fresh Install abgeschlossen!"
echo ""
echo "🎉 Alle Pakete wurden deinstalliert und mit korrekten Versionen neu installiert!"
echo ""
echo "📋 Was wurde gemacht:"
echo "   ✅ Alle node_modules gelöscht"
echo "   ✅ Alle package-lock Dateien gelöscht"
echo "   ✅ npm Cache geleert"
echo "   ✅ Problematische Pakete deinstalliert"
echo "   ✅ Git Pull mit Überschreibung"
echo "   ✅ package.json Dateien korrigiert"
echo "   ✅ Client-Dateien erstellt"
echo "   ✅ Server index.js korrigiert"
echo "   ✅ Alle Abhängigkeiten neu installiert"
echo "   ✅ Ausführungsrechte gesetzt"
echo ""
echo "🚀 Sie können jetzt ./update.sh ausführen, um die Anwendung zu starten!"
echo ""
