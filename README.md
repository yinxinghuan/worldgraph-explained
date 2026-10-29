# Worldgraph：一起读懂这个世界

面向项目协作者的中文交互讲解网站，从一次木箱加工出发，解释物品实例、API／DSL、统一事务、时间、地图和多人共享状态。

网站演示使用假设配方与数值，只在浏览器当前页面运行，不调用模型、不写入真实游戏，也不代表 Worldgraph 已实现到相同程度。

## 公开网站

https://yinxinghuan.github.io/worldgraph-explained/

附带结构介绍 Markdown v0.2 下载。法律、案件与复杂观察机制按当前讨论列为后续方向。

## 本地构建

无需安装第三方依赖，使用 Node.js 22 或更新版本：

```sh
npm run build
python3 -m http.server 8764 --directory docs
```

`src/` 是页面源码，`public/downloads/` 保存原版 Markdown；构建同时生成 `dist/` 与供 GitHub Pages 发布的 `docs/`。Pages 从 `main` 分支的 `/docs` 发布。

所有页面链接和静态资源采用相对路径。字体使用系统字体，插图与图标为本项目自行绘制的 HTML/CSS/SVG。
