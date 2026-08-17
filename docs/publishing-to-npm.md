# 发布到 npm

本仓库的 4 个插件都发布到 npm 官方源。发布流程如下。

## 前置：npm 登录

本机全局 npm 源可能是镜像（`registry.npmmirror.com`，只读不能发布）。发布必须走官方源：

```bash
# 方法一：用仓库根目录的 .npmrc（已指向官方源）
cd dsh-plugins
npm whoami

# 方法二：显式指定
npm publish --registry=https://registry.npmjs.org/
```

推荐用 **Granular Access Token** 发布（免密码/OTP）：

1. 打开 https://www.npmjs.com/settings/<你的用户名>/tokens
2. Generate new token → **Granular Access Token**
3. 权限：Packages and Scopes = **Read and write**（列出要发布的包名）
4. **勾选 bypass 2FA**（关键，否则发布要验证码）
5. 生成后，发布时用环境变量注入（用完即删，**绝不写进仓库**）

## 发布

```bash
cd packages/dsh-<name>
npm version patch          # 0.1.0 → 0.1.1（或 minor / major）
npm publish --registry=https://registry.npmjs.org/
```

成功标志：输出 `+ 包名@版本`。

## 验证

```bash
# 检查最新版本
Invoke-RestMethod -Uri "https://registry.npmjs.org/dsh-xxx" | % { $_.'dist-tags'.latest }
```

## 常见错误

| 报错 | 原因 | 解决 |
|---|---|---|
| `ENEEDAUTH` | 没登录，或源是镜像 | 用官方源 + token |
| `403 Forbidden` / `two-factor authentication required` | 账号开 2FA，token 没 bypass | 生成 token 时勾 bypass 2FA |
| `409 Conflict` | 版本已存在 | `npm version patch` 升版本 |
| `E403` package name 被占 | 包名已被别人用 | 换名字（`dsh-<其他功能>`） |