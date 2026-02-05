# SSR
	- nextjs
	- nuxt
	- vite + tanstack
	- waku

SSR目的
- SEO
- 性能


## 自定义SSR
### 原因
1. 7年前老项目 CRA的 SPA，要做成SSR的
	- 线上绝对稳定
	- 每天都有需求迭代上线
2. 安全
	- nextjs 23年到现在 7个高危漏洞
3. 性能问题：
	nextjs12+ 100ms渲染完成
	大型项目冷启动： 4S
4. 稳定性
	服务降级，4xx 5xx => CSR, htmlplugin, error_page 500 /static/index.html
5. 扩展性
	- 微前端，module federation
	- SRI
	- middleware 上下文不全

### SSR核心
- 路由：路由表、文件系统约定路由
- 数据预取 / prefetch

### 原理
1. 应用构建（服务端 和 客户端
2. 运行时 http服务
	koa、hono
2. serverlesss