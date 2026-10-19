#!/bin/sh
# One command to run the app: installs what is missing, builds the front-end,
# then starts the server on the local network so a phone can reach it.
set -e
cd "$(dirname "$0")"

if [ ! -x venv/bin/python ]; then
  # macOS ships an old python3 (3.9), so look for a newer one first.
  for py in python3.14 python3.13 python3.12 python3 ""; do
    [ -n "$py" ] && command -v "$py" >/dev/null &&
      "$py" -c 'import sys; sys.exit(sys.version_info < (3, 12))' && break
  done
  if [ -z "$py" ]; then
    echo "Python 3.12 ou plus récent est nécessaire : brew install python@3.12"
    exit 1
  fi
  echo "Création de l'environnement Python avec $py…"
  "$py" -m venv venv
fi

if ! command -v npm >/dev/null; then
  echo "Node.js est nécessaire : brew install node"
  exit 1
fi

echo "Installation des dépendances…"
venv/bin/pip install -q -r requirements.txt
npm --prefix frontend install --silent --no-audit --no-fund

echo "Construction de l'interface…"
npm --prefix frontend run build --silent >/dev/null

ip=$(ipconfig getifaddr en0 2>/dev/null || true)
echo
echo "Arc Tracker est lancé (Ctrl+C pour l'arrêter)"
echo "  Sur ce Mac :       http://localhost:8000"
[ -n "$ip" ] && echo "  Sur ton téléphone : http://$ip:8000 (même Wi-Fi)"
echo

exec venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --log-level warning
