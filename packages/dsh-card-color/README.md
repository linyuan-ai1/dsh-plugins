# dsh-card-color

Assistant **reply-card color** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): choose a soft-pastel color preset for the AI reply cards, with auto-follow-theme (light uses the light pair, dark uses the dark pair).

## Features

- 5 soft-pastel presets: 米白 / 浅蓝 / 浅绿 / 浅紫 / 浅灰
- Auto-switch with the light/dark theme toggle
- Persists across restarts (localStorage)
- Sets CSS vars (`--dsh-card-bg-*` / `--dsh-card-border-*`) that reply cards consume

## Install

```bash
dsh plugin --profile web add dsh-card-color
```

Then open **Settings → General → Reply Card Color**.

## Development

```bash
npm run check
npm publish --registry https://registry.npmjs.org
```

## License

MIT
