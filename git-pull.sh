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

echo "🔄 Git Pull mit Überschreibung aller lokalen Änderungen"
echo "========================================================"

# Prüfe ob Git installiert ist
if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert. Bitte installieren Sie Git zuerst."
    exit 1
fi

# Prüfe ob wir im Git-Repository sind
if [ ! -d ".git" ]; then
    print_error "Kein Git-Repository gefunden. Bitte führen Sie dieses Script im Projektverzeichnis aus."
    exit 1
fi

print_status "Aktueller Branch: $(git branch --show-current)"
print_status "Aktueller Status:"
git status --short

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

if [ $? -eq 0 ]; then
    print_success "Git Pull erfolgreich abgeschlossen!"
    print_status "Neuer Status:"
    git status --short
    print_status "Letzte Commits:"
    git log --oneline -5
else
    print_error "Fehler beim Git Pull"
    exit 1
fi

# Setze Ausführungsrechte für alle .sh Dateien
print_status "Setze Ausführungsrechte für alle .sh Dateien..."
chmod +x *.sh

if [ $? -eq 0 ]; then
    print_success "Ausführungsrechte für alle .sh Dateien gesetzt!"
else
    print_warning "Fehler beim Setzen der Ausführungsrechte"
fi

echo ""
print_success "Git Pull und Rechtevergabe abgeschlossen!"
echo "Repository ist jetzt auf dem neuesten Stand."
