#!/bin/bash
# Downloads free-to-use sound effects for GitGud
# Sources: Mixkit (royalty-free, no attribution required)

set -e

SOUNDS_DIR="$(dirname "$0")/../assets/sounds"
mkdir -p "$SOUNDS_DIR"

echo "Downloading sound effects..."

# countdown.mp3 - short tick/click (~200ms)
curl -sL "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" -o "$SOUNDS_DIR/countdown.mp3"
echo "  countdown.mp3"

# correct.mp3 - bright success chime (~1s)
curl -sL "https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3" -o "$SOUNDS_DIR/correct.mp3"
echo "  correct.mp3"

# incorrect.mp3 - error buzz (~1s)
curl -sL "https://assets.mixkit.co/active_storage/sfx/955/955-preview.mp3" -o "$SOUNDS_DIR/incorrect.mp3"
echo "  incorrect.mp3"

# victory.mp3 - triumphant fanfare (~2s)
curl -sL "https://assets.mixkit.co/active_storage/sfx/1938/1938-preview.mp3" -o "$SOUNDS_DIR/victory.mp3"
echo "  victory.mp3"

# defeat.mp3 - sad descending tone (~1.5s)
curl -sL "https://assets.mixkit.co/active_storage/sfx/2027/2027-preview.mp3" -o "$SOUNDS_DIR/defeat.mp3"
echo "  defeat.mp3"

echo "Done! All sounds downloaded to assets/sounds/"
