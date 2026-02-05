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
      // 1. 准备就绪：当 React 渲染到只包含骨架（Shell）的部分时触发
      // 此时可以先发送 HTML 的开头部分（<head> 和 <body> 标签）以及骨架内容
      onShellReady() {
        ctx.status = 200;
        ctx.res.write(getStartTemplate(startTemplate));
      },
      // 2. 全部就绪：当所有内容（包括异步数据）都渲染完成时触发
      // 此时可以发送 HTML 的剩余部分（包括异步组件和数据）
      onAllReady() {
        clearTimeout(timeoutHandle);
        pipe(ctx.res);
        ctx.res.end(getEndTemplate(endTemplate));
        resolve(true);
      },
      onShellError(error) {
        clearTimeout(timeoutHandle);
        console.error("Shell rendering error:", error);
        ctx.status = 500;
        reject(false);
      },
      onError(error) {
        clearTimeout(timeoutHandle);
        console.error("Stream rendering error:", error);
        if (!ctx.headerSent) {
          ctx.status = 500;
        }
        reject(false);
      },
    });

    // 设置 5 秒超时，防止恶意长耗时渲染
    const timeoutHandle = setTimeout(() => {
      abort();
      console.warn("Rendering aborted due to timeout");
      if (!ctx.headerSent) {
        ctx.status = 408; // Request Timeout
        ctx.body = "Rendering Timeout";
        resolve(true);
      }
    }, 5000);
  });
};
