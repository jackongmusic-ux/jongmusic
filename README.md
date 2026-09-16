# JONG MUSIC

翁梓铭个人音乐与视觉作品集网站。

## 本地运行

需要 Node.js 24 和 pnpm 11。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

本地开发地址会显示在终端中。

## 生产构建

```bash
pnpm build
pnpm start
```

生产服务器会自动读取 `PORT` 环境变量，并监听 `0.0.0.0`，可直接用于 Render Web Service。

## 上传 GitHub

在 GitHub Desktop 中选择 **File → Add Local Repository**，添加当前 `jongmusic` 文件夹。依赖、构建产物和本地测试文件已经通过 `.gitignore` 排除，不应提交 `node_modules`、`dist` 或 `work`。

## Render 部署

仓库根目录包含 `render.yaml`。在 Render 中选择 **New → Blueprint**，连接 `jongmusic` GitHub 仓库并部署即可。

默认配置：

- 服务名称：`jongmusic`
- 类型：Node Web Service
- 构建命令：`pnpm install --frozen-lockfile && pnpm build`
- 启动命令：`node dist/standalone/server.js`
- 健康检查：`/`

Render 的默认网址由服务名称决定。如果 `jongmusic` 尚未被占用，网址通常为 `https://jongmusic.onrender.com`；若名称已被占用，Render 会要求使用其他唯一名称。
