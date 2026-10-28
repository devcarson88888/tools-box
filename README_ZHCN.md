[English](README.md) | 简体中文 | [繁體中文](README_ZHTW.md)

# 实用工具箱

实用工具箱是托管在 Cloudflare Workers 静态资源上的静态网站。身份验证与发布者审核使用 Supabase；已发布的工具通过 `github-publish` 边缘函数存入本仓库的 `create/` 目录。

## 将网站部署到 Cloudflare Workers

该 Worker 直接为本仓库的静态文件提供访问；`.assetsignore` 文件用于防止项目配置与 Supabase 源码作为公开资源被发布。

1. 安装 Node.js，然后执行 `npx wrangler login` 完成 Wrangler 身份认证。
2. 在仓库根目录执行 `npx wrangler deploy`。Wrangler 会输出部署后的 `workers.dev` 链接。在修改生产环境配置前，请确认首页、`/signup/`、`/search/`、`/create/`、`/my-tools/`、`/banned/` 以及 `/tools/Time-zone-converter/` 均可正常访问。
3. `wrangler.json` 里的 `name` 必须和 Cloudflare 中的 Worker 名称保持一致，部署后的 Worker 名称为 `tools-box`。
4. 在 Supabase 边缘函数密钥中，将 `TOOLS_BOX_APP_ORIGIN` 设置为 `[https://tools-box.carson88888.workers.dev](https://tools-box.carson88888.workers.dev)`。迁移期间，请保留原 Pages 访问地址可用。GitHub OAuth 回调地址依旧使用 Supabase 函数链接，不会迁移到 Workers。
5. 在 Supabase 身份验证网址配置中，把 Workers 域名加入允许的重定向地址，准备就绪后更新站点网址。注册确认重定向会使用网站域名。
6. 在 Workers 环境中验证注册确认流程、Supabase 请求以及 GitHub 发布/管理的 OAuth 流程。在全部校验通过前，请保留 Pages 部署版本正常运行。

部署 Workers 需要 Cloudflare 账号权限，GitHub 推送代码不会自动执行部署。重新运行 `npx wrangler deploy` 会发布当前工作区文件。

## 管理后台

私有管理后台地址：`/admin/`。对应的边缘函数会校验已登录的 Supabase 用户，必须配置密钥 `ADMIN_EMAILS` 和/或 `ADMIN_USER_IDS`；**不会信任用户自行传入的名称或浏览器携带的角色信息**。在 Supabase 边缘函数密钥里填写管理员邮箱到 `ADMIN_EMAILS`，多个邮箱用英文逗号分隔。不要把服务密钥提交或粘贴到静态网站中。

将 `supabase/functions/admin/index.ts` 部署为名为 `admin` 的边缘函数，并执行 `supabase/migrations/` 下所有数据库迁移脚本；之后使用已加入白名单的账号登录网站，访问 `/admin/`。后台可以查看邮箱、显示名称、出生日期、注册时间、邮箱验证状态、最近登录时间；支持暂停/恢复登录权限，在二次输入邮箱确认后，可以永久删除非管理员账号。管理员账号无法通过该后台被暂停或删除。密码不会返回展示。出生日期属于敏感个人信息，仅对白名单内管理员可见。在 `20261004174400_store_birth_dates_for_admin.sql` 脚本执行前创建的账号没有留存出生日期，相关数据已清除、无法恢复。账号必须能够正常登录，才可以使用管理后台。

## 注册年龄校验与发布者审核

部署新版边缘函数前：

1. 在生产环境 Supabase 项目里，通过 Supabase SQL 编辑器或者 Supabase CLI 执行 `supabase/migrations/20261004143000_age_gate_and_publisher_bans.sql`。脚本会新增身份验证触发器：拒绝 18 岁以下新账号，丢弃提交的出生日期，仅留存管理员可见的核验时间戳；同时新建私有发布者封禁数据表。
2. 确认边缘函数配置了密钥 `SUPABASE_SERVICE_ROLE_KEY`。**严禁把这个密钥放到静态网站或者提交到代码仓库**。Supabase 托管函数一般会自动获取项目服务角色密钥；如果缺失，在项目边缘函数密钥面板手动配置。
3. 部署 `supabase/functions/github-publish` 函数，该函数会在发布者执行操作前检查封禁状态，并记录永久封禁信息。

年龄限制会在新建身份账号时生效，包括直接调用身份验证接口的请求，不只是网站注册表单。最初的年龄校验迁移脚本只保存年龄核验时间戳；后续出生日期迁移脚本会把完整生日存入私有表供管理员查看，同时从身份用户元数据中移除生日字段。已有存量账号不会回溯做年龄核验。

成人内容审核会扫描提交的 HTML、CSS、JavaScript 和工具描述文本，匹配已知违规关键词。一旦命中，会永久封禁该 GitHub 发布者 ID 并记录封禁时间。自动文本审核存在误判，并且无法可靠识别图片、编码/混淆载荷、远程加载内容，**不能当作完备的内容审核方案**。封禁提示页面会展示封禁时间戳，并提供申诉入口；申诉不会自动恢复发布权限。

## 注册邮箱验证码

注册页面支持 6 位邮箱验证码。测试该流程不需要自定义 SMTP：Supabase 默认发件服务可以给项目授权成员邮箱发送邮件，但有严格频率限制，不适合面向公网用户投递。

1. 打开 Supabase 控制台 → **身份验证 > 邮件模板 > 注册确认**。
2. 修改邮件正文，加入 `{{ .Token }}`（不能只依赖 `{{ .ConfirmationURL }}`），示例：

```
<h2>验证你的邮箱</h2>
<p>你的实用工具箱验证码是：</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
<p>在注册页面输入该验证码。如果你没有发起注册，可以忽略这封邮件。</p>
```
3. 保存模板，使用 Supabase 项目授权邮箱测试注册、验证码校验以及重发验证码功能。

如果要向外部普通邮箱发信，前往 **身份验证 > SMTP 设置** 配置自定义 SMTP 服务商。需要准备邮件服务商提供的凭证，以及服务商允许使用的发件地址/域名；不要填写占位假凭证。修改 Supabase 邮件模板**不需要重新部署静态网站**。

---

我保留了所有代码路径、变量名、脚本文件名、模板占位符、命令行指令原样不翻译，只翻译说明文字，符合你要的效果 ✅
