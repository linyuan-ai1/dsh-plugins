# dsh-usage-monitor

Floating **usage dashboard** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a collapsible panel showing your Go / DeepSeek / New API usage in the corner of the app.

## Features

- Floating collapsible panel (toggle button top-right)
- Shows the embedded usage dashboard iframe
- Availability: needs the **DeepSeek Harness desktop shell** (Electron) to provide the dashboard URL; in a plain browser it shows a "desktop only" hint

## Install

```bash
dsh plugin --profile web add dsh-usage-monitor
```

## Screenshots

![Usage Monitor](docs/screenshots/screenshot-1.png)

![Usage Monitor 2](docs/screenshots/screenshot-2.png)

![Usage Monitor 3](docs/screenshots/screenshot-3.png)

![Usage Monitor 4](docs/screenshots/screenshot-4.png)

![Usage Monitor 5](docs/screenshots/screenshot-5.png)

## Development

```bash
npm run check
npm publish --registry https://registry.npmjs.org
```

## License

MIT

## Publish

```bash
npm version patch
npm publish --registry=https://registry.npmjs.org/
```
