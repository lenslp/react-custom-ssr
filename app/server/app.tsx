import { Context } from "koa";
import { matchRoutes, StaticRouter } from "react-router-dom";
import { HelmetProvider, FilledContext } from "react-helmet-async";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  DehydratedState,
} from "@tanstack/react-query";
import { type ChunkExtractor } from "@loadable/server";
import App from "index";
import routes from "routes";

// 预取数据
export const prefetch = async (ctx: Context, queryClient: QueryClient) => {
  const prefetchRoutes = matchRoutes(routes, ctx.req.url);
  if (prefetchRoutes) {
    const promiseRoutes = prefetchRoutes
      .map(({ route, params }) => {
        if (route?.queryKey && route?.loadData) {
          return queryClient.prefetchQuery({
            queryKey: route.queryKey,
            queryFn: () => route.loadData(params),
          });
        }
      })
      .filter((i) => i);

    await Promise.allSettled(promiseRoutes);
  }
  // 将 queryClient 中的数据脱水
  const dehydratedState = dehydrate(queryClient);
  return { dehydratedState };
};

// 渲染应用
// StaticRouter：专门为 服务端渲染 (SSR) 设计的路由容器
// HelmetProvider：用于管理文档头部（<title>, <meta> 等）的上下文
// QueryClientProvider：React Query 的 Provider，用于管理查询状态
// HydrationBoundary：拿到脱水后的数据，重新恢复成 QueryClient 里的内存对象
export const renderApp = (
  ctx: Context,
  queryClient: QueryClient,
  extractor: ChunkExtractor,
  dehydratedState: DehydratedState
) => {
  const helmetContext = {} as FilledContext;

  const jsx = extractor.collectChunks(
    <StaticRouter location={ctx.req.url}>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>
            <App context={ctx} />
          </HydrationBoundary>
        </QueryClientProvider>
      </HelmetProvider>
    </StaticRouter>
  );

  return {
    jsx,
    helmetContext,
  };
};
