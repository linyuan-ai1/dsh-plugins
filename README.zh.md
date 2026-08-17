# dsh-plugins

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的独立插件合集 —— 每个功能一个插件，均已发布到 npm，可直接安装。

## 插件清单（全部已发布 ✅）

| 插件 | 功能 | npm | 安装 |
|---|---|---|---|
| [`dsh-wallpaper-plus`](packages/dsh-wallpaper-plus) | 🖼️ 全屏壁纸：图片/短视频，自动深色，视频原声开关 | [npm](https://www.npmjs.com/package/dsh-wallpaper-plus) | `dsh plugin --profile web add dsh-wallpaper-plus` |
| [`dsh-card-color`](packages/dsh-card-color) | 🎨 AI 回复卡片颜色：5 预设，自动随主题 | [npm](https://www.npmjs.com/package/dsh-card-color) | `dsh plugin --profile web add dsh-card-color` |
| [`dsh-event-sounds`](packages/dsh-event-sounds) | 🔔 事件声音：任务完成/提问/审批（WebAudio 合成） | [npm](https://www.npmjs.com/package/dsh-event-sounds) | `dsh plugin --profile web add dsh-event-sounds` |
| [`dsh-usage-monitor`](packages/dsh-usage-monitor) | 📊 用量面板：Go/DeepSeek/New API 悬浮用量卡 | [npm](https://www.npmjs.com/package/dsh-usage-monitor) | `dsh plugin --profile web add dsh-usage-monitor` |

## 安装

```bash
# 安装单个插件
dsh plugin --profile web add dsh-wallpaper-plus

# 或一次装全部
for p in dsh-wallpaper-plus dsh-card-color dsh-event-sounds dsh-usage-monitor; do
  dsh plugin --profile web add "$p"
done
```

## 结构

```
dsh-plugins/
├── packages/                # 独立插件，一个功能一个包
│   └── dsh-<name>/
│       ├── package.json     # dsh.bundle + dsh.client 声明
│       ├── cordis.patch.yml # 插件行（DSH 加载入口）
│       ├── lib/             # 免构建产物（index.js 宿主 + client.js 浏览器）
│       └── src/             # TypeScript 源码
├── LICENSE
└── README.md
```

## 发布新版本

```bash
cd packages/dsh-<name>
npm version patch        # 或 minor / major
npm publish --registry=https://registry.npmjs.org/
```

## License

MIT