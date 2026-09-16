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
```

静态站点会生成在 `dist/client`，其中包含可直接托管的 `index.html`。

## 上传 GitHub

在 GitHub Desktop 中选择 **File → Add Local Repository**，添加当前 `jongmusic` 文件夹。依赖、构建产物和本地测试文件已经通过 `.gitignore` 排除，不应提交 `node_modules`、`dist` 或 `work`。

## Render 部署

仓库根目录包含 `render.yaml`。在 Render 中选择 **New → Blueprint** 连接仓库，或手动创建 **Static Site**。

默认配置：

- 服务名称：`jongmusic`
- 类型：Static Site
- 构建命令：`pnpm install --frozen-lockfile && pnpm build`
- 发布目录：`dist/client`

Render 的默认网址由服务名称决定。如果 `jongmusic` 尚未被占用，网址通常为 `https://jongmusic.onrender.com`；若名称已被占用，Render 会要求使用其他唯一名称。

## 阿里云 OSS / CDN 部署

仓库已包含一套默认不会发布的 GitHub Actions 流程，可构建并校验网站，也可在配置完成后同步到阿里云 OSS 并刷新 CDN。现有 Render 配置不受影响。

- 手动运行时默认只构建检查；选择 `deploy` 并准确输入目标 Bucket 名才会发布。
- 完成目标二次确认后，将仓库变量 `ALIYUN_DEPLOY_ENABLED` 设为 `true`，推送到 `main` 才会自动发布。
- 网站使用根绝对资源路径，必须部署到专用 Bucket 的根目录，不能使用子目录。
- 普通发布会保留旧的内容哈希文件，避免切换版本时短暂 404；删除旧文件是默认关闭的独立选项。

完整的控制台配置、变量、密钥、权限和双版本切换方法见 [docs/aliyun-deployment.md](docs/aliyun-deployment.md)。
