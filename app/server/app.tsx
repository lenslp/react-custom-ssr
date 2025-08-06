import { Context } from "koa";
import { createContext } from "react";
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
  const dehydratedState = dehydrate(queryClient);

  return { dehydratedState };
};

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
