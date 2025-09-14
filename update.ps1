# Netzwerkplaner Update Script für Windows PowerShell
# Dieses Script aktualisiert das Repository und startet die Anwendung

Write-Host ""
Write-Host "🌐 Netzwerkplaner Update & Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Funktion für farbige Ausgabe
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Prüfen ob Git installiert ist
try {
    $gitVersion = git --version
    Write-Success "Git gefunden: $gitVersion"
} catch {
    Write-Error "Git ist nicht installiert. Bitte installieren Sie Git."
    Read-Host "Drücken Sie Enter zum Beenden"
    exit 1
}

# Prüfen ob Node.js installiert ist
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Success "Node.js Version: $nodeVersion"
    Write-Success "npm Version: $npmVersion"
} catch {
    Write-Error "Node.js ist nicht installiert. Bitte installieren Sie Node.js von https://nodejs.org/"
    Read-Host "Drücken Sie Enter zum Beenden"
    exit 1
}

# Repository URL
$REPO_URL = "https://github.com/dandulox/nwp.git"

# Prüfen ob wir in einem Git-Repository sind
if (-not (Test-Path ".git")) {
    Write-Warning "Kein Git-Repository gefunden. Klone das Repository..."
    
    # Aktuelles Verzeichnis sichern
    $CURRENT_DIR = Get-Location
    
    # Ein Verzeichnis höher gehen und Repository klonen
    Set-Location ..
    git clone $REPO_URL nwp
    Set-Location nwp
    
    Write-Success "Repository geklont in: $(Get-Location)"
} else {
    Write-Status "Git-Repository gefunden. Aktualisiere..."
    
    # Alle lokalen Änderungen verwerfen
    Write-Status "Verwerfe lokale Änderungen..."
    git fetch origin
    git reset --hard origin/main
    
    # Repository aktualisieren
    Write-Status "Pulle neueste Änderungen..."
    git pull origin main
    
    Write-Success "Repository aktualisiert"
}

# Prüfen ob package.json existiert
if (-not (Test-Path "package.json")) {
    Write-Error "package.json nicht gefunden. Ist dies ein gültiges Netzwerkplaner-Repository?"
    Read-Host "Drücken Sie Enter zum Beenden"
    exit 1
}

# Alle laufenden Node.js Prozesse beenden (falls vorhanden)
Write-Status "Beende eventuell laufende Prozesse..."
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
} catch {
    # Ignorieren wenn keine Prozesse gefunden werden
}

# Kurz warten
Start-Sleep -Seconds 2

# Root-Abhängigkeiten installieren/aktualisieren
Write-Status "Installiere/aktualisiere Root-Abhängigkeiten..."
npm install

# Server-Abhängigkeiten installieren/aktualisieren
Write-Status "Installiere/aktualisiere Server-Abhängigkeiten..."
Set-Location server
npm install
Set-Location ..

# Client-Abhängigkeiten installieren/aktualisieren
Write-Status "Installiere/aktualisiere Client-Abhängigkeiten..."
Set-Location client
npm install
Set-Location ..

# Umgebungsvariablen für Port 80 setzen
$env:PORT = "80"
$env:REACT_APP_API_URL = "http://localhost:80"

Write-Success "Alle Abhängigkeiten installiert/aktualisiert!"
Write-Host ""
Write-Status "Starte Netzwerkplaner auf Port 80..."
Write-Host ""
Write-Host "🌐 Die Anwendung wird gestartet:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:80" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:80/api" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Hinweis: Port 80 erfordert möglicherweise Administrator-Rechte" -ForegroundColor Yellow
Write-Host "   Falls Fehler auftreten, führen Sie PowerShell als Administrator aus" -ForegroundColor Yellow
Write-Host ""
Write-Host "Drücken Sie Ctrl+C zum Beenden" -ForegroundColor Gray
Write-Host ""

# Anwendung starten
Write-Status "Starte Anwendung..."
npm run dev
