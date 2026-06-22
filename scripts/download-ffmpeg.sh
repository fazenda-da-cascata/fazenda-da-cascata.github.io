#!/usr/bin/env bash
# Baixa um ffmpeg estatico (macOS arm64) para uso local na conversao de midia.
# O binario fica em scripts/bin/ffmpeg e nao e versionado (ver .gitignore).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$DIR/bin"
mkdir -p "$BIN"

if [ -x "$BIN/ffmpeg" ]; then
  echo "ffmpeg ja presente em $BIN/ffmpeg"
  "$BIN/ffmpeg" -version | head -1
  exit 0
fi

URL="https://www.osxexperts.net/ffmpeg711arm.zip"
TMP="$(mktemp -d)"
echo "Baixando ffmpeg de $URL"
curl -L --fail --max-time 120 -o "$TMP/ffmpeg.zip" "$URL"
unzip -o -j "$TMP/ffmpeg.zip" -d "$BIN" >/dev/null
chmod +x "$BIN/ffmpeg"
rm -rf "$TMP"

echo "Instalado em $BIN/ffmpeg"
"$BIN/ffmpeg" -version | head -1
