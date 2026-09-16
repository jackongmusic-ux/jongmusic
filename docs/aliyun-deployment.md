# JONG MUSIC 阿里云 OSS / CDN 部署准备

这套配置让同一份 GitHub 仓库同时保留两条互不冲突的发布路径：

- Render 继续读取 `render.yaml`，发布 `dist/client`。
- GitHub Actions 使用同一个静态产物，按需同步到阿里云 OSS，并可刷新 CDN。

工作流文件是 `.github/workflows/deploy-aliyun-oss.yml`。刚提交到 GitHub 时不会自动上传阿里云；只有手动明确确认，或把自动部署变量打开，才会发生云端写入。

## 当前版本已经满足的条件

- `next.config.ts` 使用 `output: "export"`。
- `pnpm build` 生成可直接托管的 `dist/client/index.html`。
- 图片、音频、视频和字体都在本站，不依赖 Google Fonts 或境外运行时素材。
- `pnpm run verify:static` 会检查必要文件、符号链接、敏感文件、外部静态素材地址，以及 HTML、CSS、JS、RSC 中的本站资源引用。

## 必须使用专用 Bucket 根目录

网页中的资源地址为 `/assets/...`、`/_next/...` 和 `/fonts/...`。因此必须把 `dist/client` 同步到：

```text
oss://你的-bucket/
```

不要同步到 `oss://你的-bucket/jongmusic/`。使用子目录会让图片、字体、音频和脚本返回 404。这个 Bucket 也不要混放其他项目；当你明确启用旧文件清理时，工作流会使用 `sync --delete` 使 OSS 与当前版本完全一致。

在第一次部署前：

1. 创建一个只服务这个网站的 OSS Bucket，并保持 ACL 为私有。
2. 在 OSS 中开启版本控制，给覆盖或误删保留恢复机会。
3. 在 CDN 中把源站设为这个 OSS Bucket，并在 **回源配置 → OSS 私有 Bucket 回源** 完成账号授权并开启开关，否则 CDN 回源会返回 403。
4. 私有 Bucket 回源不会触发 OSS 静态网站的默认首页。推荐不依赖 OSS 默认首页，而是在 CDN 配置 URI 重写：`^/$` → `/index.html`。若保留 OSS 静态网站配置，也必须配置这条重写以避免根路径 403。
5. 若确实要绕过 CDN 直接用 OSS 静态网站域名预览，则需要改为公共读并设置首页 `index.html`、错误页 `404.html`；这不是推荐的正式架构，也不要在 Bucket 中存放任何敏感文件。
6. 若使用中国内地节点，完成域名备案后再绑定域名和 CDN。
7. CDN 开启 HTTPS；音视频需要拖动播放时，开启 Range 回源。

## GitHub 中需要填写的配置

进入仓库的 **Settings → Secrets and variables → Actions**。

### Variables（普通配置）

| 名称 | 示例 | 作用 |
| --- | --- | --- |
| `ALIYUN_DEPLOY_ENABLED` | `false` | 是否在每次推送 `main` 后自动发布；准备完成前保持 `false` 或不创建 |
| `ALIYUN_OSS_BUCKET` | `jongmusic-site` | 专用 OSS Bucket 名称 |
| `ALIYUN_DEPLOY_TARGET_CONFIRM` | `jongmusic-site` | 自动发布的目标锁；必须与 Bucket 名完全一致，防止变量误填后覆盖其他 Bucket |
| `ALIYUN_OSS_REGION` | `cn-hangzhou` | Bucket 地域 ID |
| `ALIYUN_OSS_ENDPOINT` | `https://oss-cn-hangzhou.aliyuncs.com` | 公网 Endpoint；GitHub 托管运行器不能使用 `-internal` 地址 |
| `ALIYUN_CDN_DOMAIN` | `www.example.com` | 可选，只填域名，不带 `https://` 和路径；留空则不刷新 CDN |
| `ALIYUN_CDN_REFRESH_ASSETS` | `false` | 可选。切换两个版本且同名图片/音频内容不同时，可临时设为 `true` 刷新 `/assets/` 与 `/fonts/` |
| `ALIYUN_OSS_DELETE_ENABLED` | `false` | 可选。自动发布后是否清理旧文件；准备完成前保持 `false` |

不要创建 OSS 子目录变量；此网站只能发布到 Bucket 根目录。

### 身份凭证：优先使用 OIDC

推荐在阿里云 RAM 中建立 GitHub OIDC 身份提供商和只允许本仓库使用的 RAM Role，然后增加：

| 名称 | 作用 |
| --- | --- |
| `ALIYUN_OIDC_PROVIDER_ARN` | OIDC 身份提供商 ARN |
| `ALIYUN_ROLE_ARN` | 部署用 RAM Role ARN |
| `ALIYUN_OIDC_AUDIENCE` | 可选；默认 `sts.aliyuncs.com`，必须与阿里云 OIDC 设置完全一致 |

OIDC 会在每次运行时获取短期凭证，GitHub 中不保存长期 AccessKey。阿里云侧的信任策略应把 `iss`、`aud` 和 `sub` 限制到指定 GitHub 仓库及 `main` 分支或 `aliyun-production` Environment。

### 兼容方式：GitHub Secrets 中保存 RAM 用户 AccessKey

如果暂时还没有配置 OIDC，可创建以下 Secrets：

| 名称 | 作用 |
| --- | --- |
| `ALIYUN_ACCESS_KEY_ID` | 最小权限 RAM 用户的 AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | 对应的 AccessKey Secret |
| `ALIYUN_SECURITY_TOKEN` | 可选，仅使用 STS 临时凭证时填写 |

不要使用阿里云主账号 AccessKey，也不要把任何密钥写进代码、说明文件或 GitHub Variables。

## RAM 最小权限模板

把 `BUCKET_NAME`、`ACCOUNT_ID` 和 `CDN_DOMAIN` 替换成真实值。若暂不使用 CDN，可先删除最后一条 CDN Statement。

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["oss:ListObjects"],
      "Resource": ["acs:oss:*:*:BUCKET_NAME"]
    },
    {
      "Effect": "Allow",
      "Action": ["oss:GetObject", "oss:PutObject", "oss:DeleteObject"],
      "Resource": ["acs:oss:*:*:BUCKET_NAME/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["cdn:RefreshObjectCaches"],
      "Resource": ["acs:cdn:*:ACCOUNT_ID:domain/CDN_DOMAIN"]
    }
  ]
}
```

`oss:DeleteObject` 只用于可选的 `sync --delete` 清理步骤。若暂时不清理旧文件，可以先不授予这项权限；开启清理前务必确认 Bucket 专用且版本控制已经开启。

## 三种使用方式

### 1. 只构建检查，不上线

进入 GitHub 仓库的 **Actions → Build or deploy to Alibaba Cloud → Run workflow**：

1. `action` 保持 `build-only`。
2. 运行后会生成一个保留 3 天的静态网站 artifact。
3. 这个过程不读取阿里云密钥，也不会修改 OSS。

### 2. 手动上线某个版本

1. 确认 OSS、RAM、域名和上述 Variables/Secrets 已配置。
2. 在同一界面把 `action` 选为 `deploy`。
3. 在确认框准确输入 `ALIYUN_OSS_BUCKET` 的完整名称。名称不一致时，工作流会在任何云端写入前停止。
4. `delete_stale_files` 默认保持关闭；只有专用 Bucket 已开启版本控制、且你确实需要清理时才勾选。
5. 工作流先重新构建和校验，再发布这一版本。

即使 `ALIYUN_DEPLOY_ENABLED` 仍为 `false`，这次明确确认的手动发布也可以执行。

### 3. 让当前版本以后自动上线

先把 `ALIYUN_DEPLOY_TARGET_CONFIRM` 设置为与 `ALIYUN_OSS_BUCKET` 完全相同的值，再把这个仓库的 `ALIYUN_DEPLOY_ENABLED` 改为 `true`。以后每次推送到 `main` 都会自动构建、校验和发布。正常情况下让 `ALIYUN_OSS_DELETE_ENABLED` 保持 `false`。

如果两个网站版本位于两个仓库，并且都指向同一个 Bucket：

1. 任何时候只能让一个仓库的 `ALIYUN_DEPLOY_ENABLED` 为 `true`。
2. 切换前先关闭旧仓库的自动部署，并等待它正在运行的 workflow 完全结束；不同仓库的 GitHub concurrency 不会互相加锁。
3. 确认没有另一版本正在发布后，再手动部署新仓库一次；两个仓库绝不能同时向同一个 Bucket 发布。
4. 新版本稳定后，再决定是否打开新仓库的自动部署。
5. 最后一次成功部署的仓库版本就是线上版本；不需要重新配置域名、OSS 或 CDN。

## 发布顺序与缓存策略

工作流会执行以下操作：

1. 使用锁定版本的 Node、pnpm 和依赖进行静态构建。
2. 校验 `dist/client`，保存精确的构建 artifact。
3. 使用阿里云官方 `ossutil 2.4.0`，并核对官方 SHA-256 后才运行。
4. 先上传普通资源和所有新内容哈希文件，不动线上入口文件，也不删除旧哈希文件。
5. 只有手动勾选清理，或把 `ALIYUN_OSS_DELETE_ENABLED=true` 时，才运行 `sync --delete`。这会释放旧文件空间，但已打开的旧页面仍可能引用旧哈希，因此默认关闭。
6. 对带内容哈希的 `/_next/static/` 使用一年 `immutable` 缓存。
7. 最后上传 `index.html`、`index.rsc`、`404.html` 和客户端清单，并设置为不缓存；这时它们引用的新资源已经存在。
8. 如果配置了 CDN 域名，精准刷新入口页面；只有 `ALIYUN_CDN_REFRESH_ASSETS=true` 时才额外刷新固定文件名的图片、音频和字体目录。

## 官方资料

- [ossutil 2.0 安装、环境变量与校验和](https://help.aliyun.com/en/oss/developer-reference/ossutil-overview/)
- [ossutil sync 与 `--delete`](https://help.aliyun.com/en/oss/developer-reference/synchronize-local-files-to-oss)
- [OSS RAM 权限](https://help.aliyun.com/en/oss/user-guide/ram-policy/)
- [阿里云 CLI 环境变量](https://help.aliyun.com/en/cli/environment-variables)
- [CDN RefreshObjectCaches](https://help.aliyun.com/en/cdn/developer-reference/api-cdn-2018-05-10-refreshobjectcaches)
- [CDN 访问私有 OSS Bucket](https://help.aliyun.com/zh/cdn/user-guide/grant-alibaba-cloud-cdn-access-permissions-on-private-oss-buckets)
- [私有回源与默认首页冲突的处理](https://help.aliyun.com/zh/oss/why-am-i-unable-to-access-the-default-homepage-of-a-bucket-when-i-retrieve-an-object-from-a-private-bucket-by-using-cdn)
- [阿里云 GitHub OIDC 凭证 Action](https://github.com/aliyun/configure-aliyun-credentials-action)

## 当前不会发生的事情

- 提交这套文件不会自动创建、修改或删除任何阿里云资源。
- 未手动选择部署且 `ALIYUN_DEPLOY_ENABLED` 不是 `true` 时，OSS 发布 job 不会运行；目标 Bucket 二次确认不匹配时也不会写入。
- `render.yaml` 没有改变，现有 Render 网站仍按原来的 Static Site 流程部署。
