export interface ModelInfo {
  name: string;
  category: "stem" | "dme" | "text_sync";
  description: string;
  typeOptions?: string[];
  typeRequired: boolean;
  maxFileSize: string;
  maxDuration: string;
  outputFormat: string;
}

export const MODEL_REGISTRY: ModelInfo[] = [
  // Stem Separation
  {
    name: "gsep_music_hq_v1",
    category: "stem",
    description: "High-quality multi-instrument separation. Separates vocals, drums, bass, electric guitar, and acoustic piano.",
    typeOptions: ["vocal", "drum", "bass", "electric_guitar", "acoustic_piano"],
    typeRequired: true,
    maxFileSize: "1GB",
    maxDuration: "20 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_music_shq_v1",
    category: "stem",
    description: "Super high-quality vocal + accompaniment separation.",
    typeOptions: ["vocal"],
    typeRequired: true,
    maxFileSize: "1GB",
    maxDuration: "20 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_speech_hq_v1",
    category: "stem",
    description: "Speech separation / noise removal.",
    typeOptions: ["speech"],
    typeRequired: true,
    maxFileSize: "1GB",
    maxDuration: "20 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  // DME Separation
  {
    name: "gsep_dme_dtrack_v1",
    category: "dme",
    description: "Extract dialogue track from audio/video.",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_d2track_v1",
    category: "dme",
    description: "Extract dialogue + vocals track from audio/video.",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_metrack_v1",
    category: "dme",
    description: "Extract music + effects track (paired with dtrack).",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_me2track_v1",
    category: "dme",
    description: "Extract music + effects track v1 (paired with d2track).",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_me2track_v2",
    category: "dme",
    description: "Extract music + effects track v2 (high quality, paired with d2track).",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_mtrack_v1",
    category: "dme",
    description: "Extract music-only track from audio/video.",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  {
    name: "gsep_dme_etrack_v1",
    category: "dme",
    description: "Extract effects-only track from audio/video.",
    typeRequired: false,
    maxFileSize: "10GB",
    maxDuration: "200 minutes",
    outputFormat: "mp3 (48kHz/320kbps) + wav (same as input)",
  },
  // AI Text Sync
  {
    name: "gts_lyrics_line_v1",
    category: "text_sync",
    description: "AI lyrics line sync. Aligns lyrics text to audio timestamps. Outputs CSV (timestamp, lyric_text, confidence_score) + JSON report.",
    typeRequired: false,
    maxFileSize: "1GB",
    maxDuration: "10 minutes",
    outputFormat: "CSV (lyrics) + JSON (report)",
  },
];

export function getModel(name: string): ModelInfo | undefined {
  return MODEL_REGISTRY.find((m) => m.name === name);
}

export function getModelsByCategory(category?: string): ModelInfo[] {
  if (!category) return MODEL_REGISTRY;
  return MODEL_REGISTRY.filter((m) => m.category === category);
}
