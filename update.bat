@echo off
setlocal enabledelayedexpansion

REM Netzwerkplaner Update Script für Windows
REM Dieses Script aktualisiert das Repository und startet die Anwendung

echo.
echo 🌐 Netzwerkplaner Update ^& Start
echo =================================
echo.

REM Prüfen ob Git installiert ist
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git ist nicht installiert. Bitte installieren Sie Git.
    pause
    exit /b 1
)

REM Prüfen ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js ist nicht installiert. Bitte installieren Sie Node.js von https://nodejs.org/
    pause
    exit /b 1
)

echo [SUCCESS] Node.js Version: 
node --version
echo [SUCCESS] npm Version: 
npm --version
echo.

REM Repository URL
set REPO_URL=https://github.com/dandulox/nwp.git

REM Prüfen ob wir in einem Git-Repository sind
if not exist ".git" (
    echo [WARNING] Kein Git-Repository gefunden. Klone das Repository...
    
    REM Aktuelles Verzeichnis sichern
    set CURRENT_DIR=%CD%
    
    REM Ein Verzeichnis höher gehen und Repository klonen
    cd ..
    git clone %REPO_URL% nwp
    cd nwp
    
    echo [SUCCESS] Repository geklont in: %CD%
) else (
    echo [INFO] Git-Repository gefunden. Aktualisiere...
    
    REM Alle lokalen Änderungen verwerfen
    echo [INFO] Verwerfe lokale Änderungen...
    git fetch origin
    git reset --hard origin/main
    
    REM Repository aktualisieren
    echo [INFO] Pulle neueste Änderungen...
    git pull origin main
    
    echo [SUCCESS] Repository aktualisiert
)

REM Prüfen ob package.json existiert
if not exist "package.json" (
    echo [ERROR] package.json nicht gefunden. Ist dies ein gültiges Netzwerkplaner-Repository?
    pause
    exit /b 1
)

REM Alle laufenden Node.js Prozesse beenden (falls vorhanden)
echo [INFO] Beende eventuell laufende Prozesse...
taskkill /f /im node.exe >nul 2>&1

REM Kurz warten
timeout /t 2 /nobreak >nul

REM Root-Abhängigkeiten installieren/aktualisieren
echo [INFO] Installiere/aktualisiere Root-Abhängigkeiten...
npm install

REM Server-Abhängigkeiten installieren/aktualisieren
echo [INFO] Installiere/aktualisiere Server-Abhängigkeiten...
cd server
npm install
cd ..

REM Client-Abhängigkeiten installieren/aktualisieren
echo [INFO] Installiere/aktualisiere Client-Abhängigkeiten...
cd client
npm install
cd ..

REM Umgebungsvariablen für Port 80 setzen
set PORT=80
set REACT_APP_API_URL=http://localhost:80

echo [SUCCESS] Alle Abhängigkeiten installiert/aktualisiert!
echo.
echo [INFO] Starte Netzwerkplaner auf Port 80...
echo.
echo 🌐 Die Anwendung wird gestartet:
echo    - Frontend: http://localhost:80
echo    - Backend API: http://localhost:80/api
echo.
echo ⚠️  Hinweis: Port 80 erfordert möglicherweise Administrator-Rechte
echo    Falls Fehler auftreten, führen Sie die Eingabeaufforderung als Administrator aus
echo.
echo Drücken Sie Ctrl+C zum Beenden
echo.

REM Anwendung starten
echo [INFO] Starte Anwendung...
npm run dev
