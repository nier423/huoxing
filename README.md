### 📄 内部协作说明

> 欢迎为本项目贡献代码！为确保协作顺畅，请遵循以下流程：

这个仓库当前由我负责主线维护。

大家当前只负责前端相关开发，不负责数据库、Supabase 配置和服务端逻辑修改。请在现有接口和现有数据结构基础上进行开发；如果某个功能需要新增字段、修改接口、调整权限或变更 Supabase，请先和我确认，不要直接改。

---

### 1. 协作范围

当前允许协作处理的内容：

- 页面开发
- 组件开发
- 样式调整
- 交互优化
- 基于现有接口的数据展示与联调
- 不改后端前提下的前端功能新增

当前不要处理的内容：

- `Supabase` 表结构修改
- `RLS / Policy` 修改
- `Storage` 配置修改
- 环境变量新增或调整
- 服务端接口逻辑修改
- 邮件、权限、鉴权相关逻辑修改
- 直接修改线上数据

如果你判断一个需求做不动，原因是“现有接口不支持”，请来和我确认，不要自行扩展后端逻辑。

---

### 2. 开始开发前

先同步最新主干：

```bash
git checkout main
git pull origin main
```

再新建你的功能分支：

```bash
git checkout -b feature/your-feature-name
```

不要直接在 `main` 上开发。

---

### 3. 本地运行

项目使用 `npm`。

安装依赖：

```bash
npm ci
```

复制环境变量模板：

```bash
cp .env.local.example .env.local
```

如果你在 Windows PowerShell，可以手动复制 `.env.local.example` 为 `.env.local`。

启动项目：

```bash
npm run dev
```

如果本地无法跑通，先检查 `.env.local` 是否已经配置(群内我发的文档有key)。

---

### 4. 目录约定

请尽量按现有目录结构开发：

- `app/`：页面、路由、App Router 相关内容
- `components/`：通用组件和业务组件
- `lib/`：工具函数、前端复用逻辑
- `public/`：静态资源、图片、字体

不要提交这些内容：

- `.next/`
- `node_modules/`
- `.env.local`

---

### 5. 提交要求

请保持小步提交，提交信息写清楚。

示例：

```bash
feat: add category tabs to ops-room
fix: adjust article title spacing
refactor: simplify feed card layout
```

如果改了依赖，请一并提交 `package-lock.json`。

---

### 6. 提交前检查

发起 PR 前至少执行：

```bash
npm run lint
npm run build
```

确认页面没有明显报错、构建可以通过，再提交。

---

### 7. 提交 PR 前同步主干

提交前请同步最新 `main`：

```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main
git push --force-with-lease origin your-feature-branch
```

目标分支统一是：

- `main`

---

### 8. PR 说明怎么写

PR 里请写清楚：

- 改了什么
- 对应哪个页面或模块
- 是否只改前端
- 是否依赖我补接口
- 本地怎么验证

如果是 UI 改动，请附截图。

---

### 9. 内部协作约定

如果你遇到以下情况，请先来问我：

- 需要新接口
- 需要新增数据库字段
- 需要改 Supabase
- 需要改登录、权限、邮件或上传逻辑
- 不确定改动会不会影响现有线上功能

简单说：
能在现有接口上完成的，可以直接做；
需要动后端和数据层的，来和我确认。

---

### 10. 不要做的事

- 不要直接往 `main` 提交代码
- 不要对 `main` 执行 `git push -f`
- 不要修改数据库结构
- 不要改 Supabase 配置
- 不要提交密钥或本地环境变量
- 不要在没有确认的情况下改服务端逻辑

---

这是一个内部协作项目，目标是高效协作，不是扩大改动范围~

前端可以直接推进；涉及数据结构、接口能力或权限逻辑，请先和我对齐~

> 🙏 感谢你的贡献！保持代码整洁，协作更愉快！
