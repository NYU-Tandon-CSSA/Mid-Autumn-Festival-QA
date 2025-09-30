# Mid-Autumn-Festival-QA

这是一个小型静态 Web 应用，用于中秋节答题活动（包含选择题和灯谜两种模式）。

功能概览

- 两种模式：答题（选择题）和 灯谜（填空）。
- 每次从各自题库中随机抽取 7 道题。
- 答完后显示每题的正确答案，并统计答对数量。
- 简洁的中秋主题界面，适合直接部署到 GitHub Pages。

包含的文件

- `index.html`：主页面
- `style.css`：样式
- `questions.js`：题库（包含 14 道选择题和多道灯谜）
- `app.js`：交互逻辑

本地预览

1. 直接在文件管理器中打开 `index.html`（适合快速本地预览）。
2. 或者用一个静态服务器（推荐）：

```bash
# 在项目根目录运行（macOS / Linux / WSL）
python3 -m http.server 8000
# 然后打开 http://localhost:8000
```

部署到 GitHub Pages

1. 将仓库推送到 GitHub（例如仓库名为 `Mid-Autumn-Festival-QA`）。
2. 在 GitHub 仓库的 Settings -> Pages 中，将发布源设置为 `main` 分支的根目录。
3. 保存后等待几分钟即可通过 `https://<your-username>.github.io/Mid-Autumn-Festival-QA/` 访问站点。

后续改进建议

- 添加题库编辑页面或从 JSON 文件加载以便维护题目。
- 增加计时器 / 排行榜功能。
- 改善移动端的交互体验和动画效果。

祝活动顺利，祝大家中秋快乐！🌕

# Mid-Autumn-Festival-QA

中秋活动答题系统
