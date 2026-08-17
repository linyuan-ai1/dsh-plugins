# dsh-event-sounds

Event notification sounds for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), synthesized with **WebAudio** (no audio assets): play a cue when a task completes, a question is asked, or an approval is requested.

## Features

- Task-done / question / approval cues
- Master switch + per-event toggle and tone picker (6 tones)
- No audio files — all synthesized in-browser
- Persists across restarts (localStorage)

## Install

```bash
dsh plugin --profile web add dsh-event-sounds
```

Then open **Settings → General → Event Sounds**.

## Development

```bash
npm run check
npm publish --registry https://registry.npmjs.org
```

## License

MIT
