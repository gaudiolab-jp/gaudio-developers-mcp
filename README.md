# @gaudiolab/mcp-developers

MCP server for [Gaudio Lab](https://www.gaudiolab.com) Audio AI API. Separate vocals, instruments, dialogue, music, effects from any audio/video — or sync lyrics to timestamps — all through natural language in your AI tools.

Works with Claude, ChatGPT, Cursor, VS Code, GitHub Copilot, and any MCP-compatible client.

## Get Your API Key

1. Sign up at [Gaudio Developers](https://developers.gaudiolab.io)
2. Create a project and get your API key from the dashboard

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "gaudio": {
      "command": "npx",
      "args": ["-y", "@gaudiolab/mcp-developers"],
      "env": {
        "GAUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then just ask in natural language:

- *"Separate the vocals from this file"*
- *"Extract the dialogue from this video"*
- *"Sync these lyrics to this song"*
- *"What models are available?"*
- *"How many credits do I have left?"*

## Tools

| Tool | Description |
|------|-------------|
| `gaudio_get_key_info` | Get API key info: credits, project, permitted models |
| `gaudio_list_models` | List available AI models by category |
| `gaudio_upload_file` | Upload audio/video/text file (multipart, auto-chunked) |
| `gaudio_create_job` | Create a processing job |
| `gaudio_get_job` | Check job status and get download URLs |
| `gaudio_separate_audio` | All-in-one: upload → process → download URLs |
| `gaudio_sync_lyrics` | All-in-one lyrics sync with timestamps |

## Models

### Stem Separation

| Model | Description | Type Options |
|-------|-------------|-------------|
| `gsep_music_hq_v1` | Multi-instrument separation | vocal, drum, bass, electric_guitar, acoustic_piano |
| `gsep_music_shq_v1` | Super HQ vocal + accompaniment | vocal |
| `gsep_speech_hq_v1` | Speech / noise removal | speech |

Max: 1GB / 20 min per file. Types can be combined (e.g. `vocal,drum`).

### DME Separation (Dialogue, Music, Effects)

| Model | Description |
|-------|-------------|
| `gsep_dme_dtrack_v1` | Dialogue extraction |
| `gsep_dme_d2track_v1` | Dialogue + vocals |
| `gsep_dme_metrack_v1` | Music + effects |
| `gsep_dme_me2track_v1` | Music + effects v1 |
| `gsep_dme_me2track_v2` | Music + effects v2 (high quality) |
| `gsep_dme_mtrack_v1` | Music only |
| `gsep_dme_etrack_v1` | Effects only |

Max: 10GB / 200 min per file.

### AI Text Sync

| Model | Description | Languages |
|-------|-------------|-----------|
| `gts_lyrics_line_v1` | Lyrics line sync | en, ko, ja, zh-cn |

Max: 1GB / 10 min. Text: `.txt` (UTF-8), min 2 lines, max 60 chars/line.

Output: CSV (timestamp, lyric_text, confidence_score) + JSON report.

## Supported Formats

| Type | Formats |
|------|---------|
| Audio | WAV, FLAC, MP3, M4A |
| Video | MOV, MP4 (audio auto-extracted) |
| Text | TXT (UTF-8) |

Output: MP3 (48kHz/320kbps) + WAV (same as input). Download URLs valid for 48 hours.

## How It Works

```
Upload file → Create job → Poll status → Get download URLs
```

The high-level tools (`gaudio_separate_audio`, `gaudio_sync_lyrics`) handle this entire flow automatically. Upload IDs are valid for 72 hours and can be reused across multiple jobs.

## Links

- [Gaudio Developers](https://developers.gaudiolab.io) — API dashboard & key management
- [Documentation](https://www.gaudiolab.com/docs) — Full API reference
- [Gaudio Lab](https://www.gaudiolab.com) — Company homepage

## License

MIT
