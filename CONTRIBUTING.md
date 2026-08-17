# Contributing

欢迎为 dsh-plugins 贡献！本仓库包含 4 个独立插件，每个插件一个 npm 包。

## 开发流程

1. **选一个插件**：`packages/dsh-<name>`
2. **改代码**：编辑 `lib/client.js`（浏览器半区）或 `lib/index.js`（宿主半区）
3. **语法检查**：
   ```bash
   node --check lib/client.js
   node --check lib/index.js
   ```
4. **本地测试**（可选）：
   ```bash
   dsh plugin --profile web add ./packages/dsh-<name>
   ```
5. **提交 + 推送**，开 PR 到 `main`

## 发布新版本

```bash
cd packages/dsh-<name>
npm version patch          # 或 minor / major
npm publish --registry=https://registry.npmjs.org/
```

> npm 官方源需要登录（本机全局源是镜像时，用仓库根目录的 `.npmrc` 或 `--registry` 参数）。

## 约定

- 一个功能一个插件，不要往现有插件里堆不相关功能
- 官方包（`@deepseek-ai/*`）一律放 `peerDependencies`，不放 `dependencies`
- 新增插件先在 npm 查包名是否被占（`Invoke-WebRequest https://registry.npmjs.org/<name>`，404 = 可用）
- 不要提交任何密钥/token 到仓库

## License

MIT