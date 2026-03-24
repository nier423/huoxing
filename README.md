### 📄 贡献者协作指南

> 欢迎为本项目贡献代码！为确保协作顺畅，请遵循以下流程：

---

#### 🔁 1. 开发前：同步主干
每次开始新功能前，请先更新 `main` 分支：
```bash
git checkout main
git pull origin main
```

#### 🌿 2. 创建功能分支
基于最新 `main` 创建你的分支（命名清晰）：
```bash
git checkout -b feature/your-feature-name
```

#### 💻 3. 开发与提交
- 小步提交，信息清晰（如 `feat: add login button`）
- 避免在 `main` 分支上直接开发

#### 🔄 4. 提交 PR 前：同步最新主干（关键！）
在推送 PR 前，务必 rebase 最新 `main`：
```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main          # 解决可能出现的冲突
git push --force-with-lease origin your-feature-branch
```

> ✅ 这能确保你的 PR 基于最新代码，避免合并冲突。

#### 📥 5. 提交 Pull Request
- 目标分支：`main`
- 描述清楚改动内容和目的
- 关联相关 Issue（如有）

#### ⚠️ 注意事项
- **不要**对 `main` 分支执行 `git push -f`
- **不要**直接在 `main` 上提交代码
- 如果 PR 被标记 “out of date”，请重复第 4 步

---

> 🙏 感谢你的贡献！保持代码整洁，协作更愉快！
