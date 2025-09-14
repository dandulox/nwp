#!/bin/bash

# Netzwerkplaner Installation Script
# Dieses Script installiert alle Abhängigkeiten und startet die Anwendung

echo "🌐 Netzwerkplaner Installation"
echo "================================"

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

# Prüfen ob sudo verfügbar ist
if ! command -v sudo &> /dev/null; then
    print_warning "sudo ist nicht verfügbar. Einige Installationen könnten fehlschlagen."
    print_status "Falls Sie Root-Rechte haben, führen Sie das Script als Root aus."
fi

# System-Informationen anzeigen
print_status "System-Informationen:"
echo "  - Betriebssystem: $(uname -s)"
echo "  - Architektur: $(uname -m)"
echo "  - Kernel: $(uname -r)"
echo "  - Benutzer: $(whoami)"
echo "  - Arbeitsverzeichnis: $(pwd)"
echo ""

# Repository URL
REPO_URL="https://github.com/dandulox/nwp.git"
NWP_DIR="nwp"

# Prüfen ob wir bereits im nwp Verzeichnis sind
if [ -f "package.json" ] && [ -d "server" ] && [ -d "client" ]; then
    print_success "Bereits im Netzwerkplaner-Verzeichnis"
    NWP_DIR="."
else
    # Prüfen ob nwp Verzeichnis bereits existiert
    if [ -d "$NWP_DIR" ]; then
        print_status "nwp Verzeichnis existiert bereits. Wechsle hinein..."
        cd "$NWP_DIR"
    else
        print_status "Klone das Netzwerkplaner Repository..."
        
        # Git installieren falls nicht vorhanden
        if ! command -v git &> /dev/null; then
            print_status "Installiere Git..."
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y git
            elif command -v yum &> /dev/null; then
                sudo yum install -y git
            elif command -v brew &> /dev/null; then
                brew install git
            else
                print_error "Git ist nicht installiert und kann nicht automatisch installiert werden."
                exit 1
            fi
        fi
        
        # Repository klonen
        if git clone "$REPO_URL" "$NWP_DIR"; then
            print_success "Repository erfolgreich geklont"
            cd "$NWP_DIR"
        else
            print_error "Fehler beim Klonen des Repositories"
            exit 1
        fi
    fi
fi

# Prüfen ob wir jetzt im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    print_error "package.json nicht gefunden. Ist dies ein gültiges Netzwerkplaner-Repository?"
    exit 1
fi

print_success "Arbeite im Verzeichnis: $(pwd)"

# Funktion zum automatischen Installieren von Paketen
install_package() {
    local package=$1
    local package_name=$2
    
    if ! command -v "$package" &> /dev/null; then
        print_warning "$package_name ist nicht installiert. Versuche automatische Installation..."
        
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            print_status "Installiere $package_name mit apt-get..."
            if sudo apt-get update && sudo apt-get install -y "$package_name"; then
                print_success "$package_name erfolgreich installiert"
            else
                print_error "Fehler beim Installieren von $package_name"
                return 1
            fi
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            print_status "Installiere $package_name mit yum..."
            if sudo yum install -y "$package_name"; then
                print_success "$package_name erfolgreich installiert"
            else
                print_error "Fehler beim Installieren von $package_name"
                return 1
            fi
        # macOS
        elif command -v brew &> /dev/null; then
            print_status "Installiere $package_name mit brew..."
            if brew install "$package_name"; then
                print_success "$package_name erfolgreich installiert"
            else
                print_error "Fehler beim Installieren von $package_name"
                return 1
            fi
        else
            print_error "Kein Paketmanager gefunden. Bitte installieren Sie $package_name manuell."
            return 1
        fi
    else
        print_success "$package_name ist bereits installiert"
    fi
}

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert. Versuche automatische Installation..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        print_status "Installiere Node.js mit apt-get..."
        if sudo apt-get update && sudo apt-get install -y curl; then
            print_status "Lade Node.js Repository..."
            if curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -; then
                if sudo apt-get install -y nodejs; then
                    print_success "Node.js erfolgreich installiert"
                else
                    print_error "Fehler beim Installieren von Node.js"
                    exit 1
                fi
            else
                print_error "Fehler beim Laden des Node.js Repositories"
                exit 1
            fi
        else
            print_error "Fehler beim Installieren von curl"
            exit 1
        fi
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        print_status "Installiere Node.js mit yum..."
        if sudo yum install -y curl; then
            print_status "Lade Node.js Repository..."
            if curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -; then
                if sudo yum install -y nodejs; then
                    print_success "Node.js erfolgreich installiert"
                else
                    print_error "Fehler beim Installieren von Node.js"
                    exit 1
                fi
            else
                print_error "Fehler beim Laden des Node.js Repositories"
                exit 1
            fi
        else
            print_error "Fehler beim Installieren von curl"
            exit 1
        fi
    # macOS
    elif command -v brew &> /dev/null; then
        print_status "Installiere Node.js mit brew..."
        if brew install node; then
            print_success "Node.js erfolgreich installiert"
        else
            print_error "Fehler beim Installieren von Node.js"
            exit 1
        fi
    else
        print_error "Kein Paketmanager gefunden. Bitte installieren Sie Node.js manuell von https://nodejs.org/"
        exit 1
    fi
fi

# Node.js Version prüfen
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js Version 16 oder höher ist erforderlich. Aktuelle Version: $(node -v)"
    print_status "Bitte aktualisieren Sie Node.js von https://nodejs.org/"
    exit 1
fi

print_success "Node.js Version: $(node -v)"

# Prüfen ob npm installiert ist
if ! command -v npm &> /dev/null; then
    print_error "npm ist nicht installiert."
    exit 1
fi

print_success "npm Version: $(npm -v)"

# Alle notwendigen Pakete auf einmal installieren (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    print_status "Installiere alle notwendigen Pakete auf einmal..."
    if sudo apt-get update && sudo apt-get install -y \
        curl \
        wget \
        unzip \
        build-essential \
        python3 \
        python3-pip \
        python3-dev \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release; then
        print_success "Alle Pakete erfolgreich installiert"
    else
        print_warning "Einige Pakete konnten nicht installiert werden"
    fi
fi

echo ""

# npm Cache leeren
print_status "Leere npm Cache..."
npm cache clean --force 2>/dev/null || true

# npm auf neueste Version aktualisieren
print_status "Aktualisiere npm auf neueste Version..."
npm install -g npm@latest 2>/dev/null || print_warning "npm Update fehlgeschlagen (keine Admin-Rechte)"

# Root-Abhängigkeiten installieren
print_status "Installiere Root-Abhängigkeiten..."
if npm install; then
    print_success "Root-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Root-Abhängigkeiten"
    exit 1
fi

# Server-Abhängigkeiten installieren
print_status "Installiere Server-Abhängigkeiten..."
cd server
if npm install; then
    print_success "Server-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Server-Abhängigkeiten"
    exit 1
fi
cd ..

# Client-Abhängigkeiten installieren
print_status "Installiere Client-Abhängigkeiten..."
cd client
if npm install; then
    print_success "Client-Abhängigkeiten installiert"
else
    print_error "Fehler beim Installieren der Client-Abhängigkeiten"
    exit 1
fi
cd ..

# Alle Scripts ausführbar machen
print_status "Setze Ausführungsrechte für alle Scripts..."
chmod +x *.sh 2>/dev/null || true
chmod +x *.py 2>/dev/null || true

# Datenbank-Verzeichnis erstellen
print_status "Erstelle Datenbank-Verzeichnis..."
mkdir -p server/data 2>/dev/null || true

# Log-Verzeichnis erstellen
print_status "Erstelle Log-Verzeichnis..."
mkdir -p logs 2>/dev/null || true

# Umgebungsvariablen-Datei erstellen
print_status "Erstelle Umgebungsvariablen-Datei..."
cat > .env << EOF
# Netzwerkplaner Umgebungsvariablen
PORT=80
NODE_ENV=development
DB_PATH=./server/netzwerkplaner.db
LOG_LEVEL=info
EOF

# Backup-Verzeichnis erstellen
print_status "Erstelle Backup-Verzeichnis..."
mkdir -p backups 2>/dev/null || true

# Berechtigungen setzen
print_status "Setze Berechtigungen..."
chmod 755 server 2>/dev/null || true
chmod 755 client 2>/dev/null || true
chmod 644 .env 2>/dev/null || true

# System-Informationen sammeln
print_status "Sammle System-Informationen..."
echo "{
  \"system\": {
    \"os\": \"$(uname -s)\",
    \"arch\": \"$(uname -m)\",
    \"kernel\": \"$(uname -r)\",
    \"user\": \"$(whoami)\",
    \"node_version\": \"$(node -v)\",
    \"npm_version\": \"$(npm -v)\",
    \"git_version\": \"$(git --version)\",
    \"install_date\": \"$(date -Iseconds)\"
  }
}" > system-info.json

# Installation testen
print_status "Teste Installation..."
if [ -f "package.json" ] && [ -f "server/package.json" ] && [ -f "client/package.json" ]; then
    print_success "Alle package.json Dateien gefunden"
else
    print_error "Fehlende package.json Dateien"
    exit 1
fi

# Prüfen ob alle wichtigen Dateien existieren
REQUIRED_FILES=("server/index.js" "client/src/App.js" "README.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Datei gefunden: $file"
    else
        print_warning "Datei nicht gefunden: $file"
    fi
done

echo ""
print_success "✅ Installation abgeschlossen!"
echo ""
print_status "📋 Installations-Zusammenfassung:"
echo "  - Node.js: $(node -v)"
echo "  - npm: $(npm -v)"
echo "  - Git: $(git --version)"
echo "  - Betriebssystem: $(uname -s) $(uname -m)"
echo "  - Installationsdatum: $(date)"
echo ""

# Port-Konfiguration
export PORT=80
export REACT_APP_API_URL=http://localhost:80

print_status "🚀 Starte die Anwendung..."
echo ""
print_status "🌐 Die Anwendung wird gestartet:"
echo "  - Frontend: http://localhost:80"
echo "  - Backend API: http://localhost:80/api"
echo ""
print_warning "⚠️  Hinweis: Port 80 erfordert möglicherweise Administrator-Rechte"
echo "  Falls Fehler auftreten, versuchen Sie: sudo ./install.sh"
echo ""
print_status "Drücken Sie Ctrl+C zum Beenden"
echo ""

# Anwendung starten
print_status "Starte Anwendung..."
npm run dev