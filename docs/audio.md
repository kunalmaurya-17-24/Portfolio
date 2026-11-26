# Audio playlist

The portfolio now uses the two MP3 files supplied in `public/audio/`, in this order:

| Display title | Context label | Source file |
| --- | --- | --- |
| Life Will Change | Persona 5 | `Persona 5 - Life Will Change (中英歌詞).mp3` |
| Last Surprise | Persona 5 | `Persona 5 - Last Surprise.mp3` |

The original filenames, including the Unicode characters, are preserved. No recording was downloaded, converted or replaced. These are user-supplied recordings; their licensing provenance has not been verified, and the configuration makes no licensing claim. “Persona 5” is the display context, not an asserted performer credit.

## Visitor controls

The music player includes Play/Pause, Previous/Next, a track selector, Mute/Unmute, volume and track information. Each selected track loops. Previous/Next wraps around the two-track list.

- The page starts silently. No audio element or MP3 download is created before explicit Play.
- Selecting another track while paused changes its title and saves the choice. It stays paused and does not download the newly selected file.
- Selecting another track while playing starts it from the beginning and uses a short volume crossfade. Play is called within that selection interaction.
- Rapid changes invalidate obsolete play promises and retire obsolete media elements. At most one old fading track coexists with the active track.
- Pause preserves the current track's playback position. Changing tracks resets the selected recording to its beginning when played.
- Volume, mute and the selected track ID persist in `localStorage` under `km-audio-preferences`. Playback consent does not persist: reloading never starts music.
- Hiding the browser tab pauses playback immediately. Returning to it never resumes music automatically.
- A failed file produces a retryable status. Audio failures and unavailable preference storage do not block the portfolio.

## Configuration

`public/audio/track.json` controls the playlist:

```json
{
  "defaultTrack": "life-will-change",
  "tracks": [
    {
      "id": "life-will-change",
      "src": "audio/Persona 5 - Life Will Change (中英歌詞).mp3",
      "title": "Life Will Change",
      "artist": "Persona 5"
    },
    {
      "id": "last-surprise",
      "src": "audio/Persona 5 - Last Surprise.mp3",
      "title": "Last Surprise",
      "artist": "Persona 5"
    }
  ]
}
```

Use unique stable IDs so saved selections continue to work. Sources resolve relative to the application's base URL, and the browser encodes spaces and Unicode characters. Only HTTP(S) media URLs are accepted. Add or remove tracks through this JSON; no application code change is required. Rebuild after editing deployed configuration or assets.

The previous single-track `{ "src", "title", "artist" }` format remains supported. If the configuration is missing, invalid or contains no usable tracks, the player falls back to **After Hours / Original instrumental**, the existing sample-free procedural synth composition. A configured track with `src: null` also uses that engine. This fallback is optional; it is not included as a third selection in the supplied two-song playlist.

## UI integration

Call `initAudio()` after rendering the player. Its return value disposes listeners, pending configuration requests, scheduled notes, fading tracks and media resources.

| ID or attribute | Purpose |
| --- | --- |
| `audio-player` | Root; receives `data-playing`, `data-muted`, `data-source`, `data-track`, `data-loading` and `data-config-ready`. |
| `audio-toggle` | Play/Pause button; label, pressed/busy states and optional `[data-audio-icon]` / `[data-audio-label]` children update automatically. |
| `audio-prev`, `audio-next` | Optional track navigation buttons. |
| `audio-track-select` | Optional labelled native select. The module safely populates its options. |
| `audio-track-position` | Optional current position, such as `01 / 02`. |
| `audio-mute` | Mute button; optional `[data-mute-label]` updates visibly. |
| `audio-volume` | Labelled range input, 0–100. |
| `audio-title` | Selected title and context label, rendered as plain text. |
| `audio-status` | Playback status; use `aria-live="polite"`. |
| `audio-media` | Actual hidden active `HTMLAudioElement`, created only when Play is requested. A retiring crossfade element does not retain this ID. |

Mute uses the effective media volume rather than relying on the native `muted` property. A short gain ramp softens changes. Decorative equalizer motion follows `data-playing` and remains disabled by the reduced-motion stylesheet.

## Validation

Run `node scripts/test-playlist.mjs` against the development server, or set `BASE_URL` to a production preview URL. This focused browser suite complements the complete portfolio QA in `scripts/qa.mjs`.

On 26 November 2026, all **12 focused playlist checks passed** in real Microsoft Edge/Chromium 158:

- Both supplied files decoded with `readyState: 4`, no media error, and advancing playback time. Browser-reported durations were 262.153 seconds for Life Will Change and 235.892 seconds for Last Surprise.
- Initial loading and paused track changes made no MP3 requests.
- Playing selection changes, rapid changes, cancellation during a pending switch, mute, volume and preference persistence behaved correctly.
- Background pause, invalid-configuration fallback and invalid-file recovery passed.
- No uncaught page errors occurred.

Detailed evidence is in `docs/playlist-test-results.json`. Headless checks verify decoding and media-time progression; they do not constitute a human listening review or licensing verification. TypeScript validation also passed.
