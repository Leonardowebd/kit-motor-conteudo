#!/usr/bin/env bash
# Prepara o ambiente do motor sem tocar no sistema: ffmpeg/ffprobe e Chromium
# vêm via npm; transcrição local via mlx-whisper num venv próprio (Apple Silicon).
set -euo pipefail
cd "$(dirname "$0")"
npm install --silent
npx playwright install chromium
python3 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet mlx-whisper
echo "ok: ffmpeg $(node -e 'console.log(require("ffmpeg-static"))' 2>/dev/null || echo via-import)"
