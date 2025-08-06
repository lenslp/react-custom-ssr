import path from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import { QueryClient } from "@tanstack/react-query";
import { ChunkExtractor } from "@loadable/server";
import { renderApp, prefetch } from "./app";
import { response } from "./stream/response";
import { start } from "./htmlTemplate";

const app = new Koa();
export const router = new Router();

const statsFile = path.resolve(__dirname, "./loadable-stats.json");

router.get("(.*)", async (ctx: Koa.Context) => {
  const extractor = new ChunkExtractor({
    statsFile,
    entrypoints: ["client"],
  });

  const queryClient = new QueryClient();
  ctx.set("Content-Type", "text/html");
  ctx.status = 200;
  ctx.res.write(start);

  const { dehydratedState } = await prefetch(ctx, queryClient);

  const { jsx, helmetContext } = renderApp(
    ctx,
    queryClient,
    extractor,
    dehydratedState
  );

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
  queryClient?.clear();
});

export default app;
