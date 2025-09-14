#!/bin/bash

# Netzwerkplaner Installation Script
# Dieses Script installiert alle Abhängigkeiten und startet die Anwendung

echo "🌐 Netzwerkplaner Installation"
echo "================================"

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js (Version 16 oder höher) von https://nodejs.org/"
    exit 1
fi

# Node.js Version prüfen
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js Version 16 oder höher ist erforderlich. Aktuelle Version: $(node -v)"
    exit 1
fi

echo "✅ Node.js Version: $(node -v)"

# Prüfen ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert."
    exit 1
fi

echo "✅ npm Version: $(npm -v)"

# Root-Abhängigkeiten installieren
echo "📦 Installiere Root-Abhängigkeiten..."
npm install

# Server-Abhängigkeiten installieren
echo "📦 Installiere Server-Abhängigkeiten..."
cd server
npm install
cd ..

# Client-Abhängigkeiten installieren
echo "📦 Installiere Client-Abhängigkeiten..."
cd client
npm install
cd ..

echo ""
echo "✅ Installation abgeschlossen!"
echo ""
echo "🚀 Starte die Anwendung..."
echo ""
echo "Die Anwendung wird gestartet:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo ""
echo "Drücken Sie Ctrl+C zum Beenden"
echo ""

# Anwendung starten
npm run dev
