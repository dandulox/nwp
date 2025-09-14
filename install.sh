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

# Prüfen ob Git installiert ist
if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert. Versuche automatische Installation..."
    install_package "git" "git"
    if ! command -v git &> /dev/null; then
        print_error "Git konnte nicht installiert werden. Bitte installieren Sie Git manuell."
        exit 1
    fi
fi

print_success "Git Version: $(git --version)"

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

# Prüfen ob Python installiert ist (für native Module)
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_warning "Python ist nicht installiert. Einige native Module könnten Probleme verursachen."
    print_status "Versuche automatische Installation von Python..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        print_status "Installiere Python mit apt-get..."
        if sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-dev; then
            print_success "Python erfolgreich installiert"
        else
            print_warning "Python konnte nicht installiert werden"
        fi
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        print_status "Installiere Python mit yum..."
        if sudo yum install -y python3 python3-pip python3-devel; then
            print_success "Python erfolgreich installiert"
        else
            print_warning "Python konnte nicht installiert werden"
        fi
    # macOS
    elif command -v brew &> /dev/null; then
        print_status "Installiere Python mit brew..."
        if brew install python3; then
            print_success "Python erfolgreich installiert"
        else
            print_warning "Python konnte nicht installiert werden"
        fi
    else
        print_warning "Kein Paketmanager gefunden. Python wird nicht installiert."
    fi
else
    if command -v python3 &> /dev/null; then
        print_success "Python3 Version: $(python3 --version)"
    else
        print_success "Python Version: $(python --version)"
    fi
fi

# Prüfen ob Build-Tools installiert sind
print_status "Prüfe Build-Tools..."

# Prüfen ob make installiert ist
if ! command -v make &> /dev/null; then
    print_warning "make ist nicht installiert. Build-Tools werden empfohlen."
    print_status "Versuche automatische Installation von Build-Tools..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        print_status "Installiere build-essential mit apt-get..."
        if sudo apt-get update && sudo apt-get install -y build-essential; then
            print_success "Build-Tools erfolgreich installiert"
        else
            print_warning "Build-Tools konnten nicht installiert werden"
        fi
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        print_status "Installiere Development Tools mit yum..."
        if sudo yum groupinstall -y 'Development Tools'; then
            print_success "Build-Tools erfolgreich installiert"
        else
            print_warning "Build-Tools konnten nicht installiert werden"
        fi
    # macOS
    elif command -v brew &> /dev/null; then
        print_status "Installiere Xcode Command Line Tools..."
        if xcode-select --install 2>/dev/null; then
            print_success "Xcode Command Line Tools installiert"
        else
            print_warning "Xcode Command Line Tools konnten nicht installiert werden"
        fi
    else
        print_warning "Kein Paketmanager gefunden. Build-Tools werden nicht installiert."
    fi
fi

# Prüfen ob gcc installiert ist
if ! command -v gcc &> /dev/null; then
    print_warning "gcc ist nicht installiert. Build-Tools werden empfohlen."
fi

# Prüfen ob curl installiert ist
if ! command -v curl &> /dev/null; then
    print_warning "curl ist nicht installiert. Wird für Downloads benötigt."
    install_package "curl" "curl"
fi

# Prüfen ob wget installiert ist
if ! command -v wget &> /dev/null; then
    print_warning "wget ist nicht installiert. Alternative zu curl."
    install_package "wget" "wget"
fi

# Prüfen ob unzip installiert ist
if ! command -v unzip &> /dev/null; then
    print_warning "unzip ist nicht installiert. Wird für Archive benötigt."
    install_package "unzip" "unzip"
fi

# Alle notwendigen Pakete auf einmal installieren (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    print_status "Installiere alle notwendigen Pakete auf einmal..."
    if sudo apt-get update && sudo apt-get install -y \
        git \
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
