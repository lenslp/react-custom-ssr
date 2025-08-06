import { renderToPipeableStream } from "react-dom/server";
import {
  getStartTemplate,
  getEndTemplate,
  StartTemplateProps,
  EndTemplateProps,
} from "../htmlTemplate";
import type { Context } from "koa";

export const response = (
  ctx: Context,
  jsx: React.ReactElement,
  startTemplate: StartTemplateProps,
  endTemplate: EndTemplateProps
) => {
  return new Promise((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(jsx, {
      onShellReady() {
        ctx.status = 200;
        ctx.res.write(getStartTemplate(startTemplate));
      },
      onAllReady() {
        pipe(ctx.res);
        ctx.res.end(getEndTemplate(endTemplate));
        resolve(true);
      },
      onShellError(error) {
        console.error("Shell rendering error:", error);
        ctx.status = 500;
        reject(false);
      },
      onError(error) {
        console.error("Stream rendering error:", error);
        ctx.status = 500;
        reject(false);
      },
    });
  });
};
