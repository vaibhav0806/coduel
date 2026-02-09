import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SoundName = "countdown" | "correct" | "incorrect" | "victory" | "defeat" | "draw";

const SOUND_FILES: Record<SoundName, any> = {
  countdown: require("@/assets/sounds/countdown.mp3"),
  correct: require("@/assets/sounds/correct.mp3"),
  incorrect: require("@/assets/sounds/incorrect.mp3"),
  victory: require("@/assets/sounds/victory.mp3"),
  defeat: require("@/assets/sounds/defeat.mp3"),
  draw: require("@/assets/sounds/draw.mp3"),
};

let sounds: Partial<Record<SoundName, Audio.Sound>> = {};
let soundEnabled = true;
let loaded = false;

export async function preloadSounds() {
  if (loaded) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
    });

    // Load cached preference
    const stored = await AsyncStorage.getItem("setting_sound");
    if (stored !== null) soundEnabled = stored === "true";

    const names = Object.keys(SOUND_FILES) as SoundName[];
    await Promise.all(
      names.map(async (name) => {
        try {
          const { sound } = await Audio.Sound.createAsync(SOUND_FILES[name]);
          sounds[name] = sound;
        } catch {
          // Individual sound load failure is non-fatal
        }
      })
    );
    loaded = true;
  } catch {
    // Audio init failure is non-fatal
  }
}

export async function playSound(name: SoundName) {
  if (!soundEnabled) return;
  try {
    const sound = sounds[name];
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch {
    // Never crash gameplay for audio
  }
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}
