// --- 核心依赖导入 ---
import path from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import { QueryClient } from "@tanstack/react-query";
import { ChunkExtractor } from "@loadable/server";
import helmet from "koa-helmet";
// 导入自定义的业务逻辑：渲染函数、数据预取逻辑
import { renderApp, prefetch } from "./app";
// 导入响应处理逻辑（流式输出）
import { response } from "./stream/response";
// 导入静态 HTML 模板头部（Shell 部分）
import { start } from "./htmlTemplate";

// 初始化 Koa 实例
const app = new Koa();
// 使用 helmet 中间件自动设置安全响应头（防止 XSS 等攻击）
app.use(helmet());

// 导出路由实例，供 server.ts 或 serverless.ts 挂载
export const router = new Router();

// @loadable/webpack-plugin 插件在打包过程中自动生成的资源映射清单
// 它记录了异步组件入口与打包后的静态资源（JS/CSS）之间的对应关系
const statsFile = path.resolve(__dirname, "./loadable-stats.json");

// 通配符路由，处理所有 SSR 请求
router.get("(.*)", async (ctx: Koa.Context) => {
  // 1. 实例化资源提取器 (ChunkExtractor)
  // 用于根据渲染过程中用到的组件，精准提取当前页面所需的 JS/CSS 资源块
  const extractor = new ChunkExtractor({
    statsFile,
    entrypoints: ["client"], // 客户端入口
  });

  // 2. 为每个请求创建一个独立的 QueryClient
  // 核心：防止不同用户的请求之间发生数据污染（即 A 用户的数据被 B 用户看到）
  const queryClient = new QueryClient();

  // 设置响应头为 HTML
  ctx.set("Content-Type", "text/html");
  ctx.status = 200;

  // 3. 快速响应：首字节优化 (TTFB)
  // 先把 HTML 的静态头部（如 <!DOCTYPE html><html><head>...）写给浏览器
  // 减少 TTFB（首字节时间）
  ctx.res.write(start);

  // 4. 数据预取 (Data Prefetching)
  // 根据当前路由匹配对应的 loadData 函数，并在服务端填充 queryClient 的缓存
  const { dehydratedState } = await prefetch(ctx, queryClient);

  // 5. 渲染应用 (Render App to JSX)
  // 将 React 组件树转换为 JSX 结构，并获取 Helmet 信息（SEO 标签）
  const { jsx, helmetContext } = renderApp(
    ctx,
    queryClient,
    extractor,
    dehydratedState
  );

  // 6. 流式写入 HTML (Streaming)
  // 利用 React 19 的 renderToPipeableStream 将剩余的内容分段推送给浏览器
  // 包含：渲染出的内容、状态脱水数据（JSON）、以及 extractor 收集到的脚本链接
  await response(
    ctx,
    jsx,
    {
      helmetContext,
      extractor,
    },
    {
      dehydratedState: JSON.stringify(dehydratedState),
      extractor,
    }
  );

  // 7. 清理工作
  // 手动清理 queryClient 缓存，加速垃圾回收，防止长时间运行下的内存泄漏
  queryClient?.clear();
});

export default app;
