import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { loadableReady } from "@loadable/component";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import App from "index";

interface TradeFlagType {
  isSSR: boolean;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const getDehydratedState = () => {
  try {
    // 从 DOM 中获取包含“脱水”状态的 script 标签（它被作为 JSON 数据容器使用）
    const element = document.querySelector("#__REACT_QUERY_STATE__");
    if (!element?.textContent) return {};
    return JSON.parse(element.textContent);
  } catch (error) {
    console.error("Failed to parse dehydrated state:", error);
    return {};
  }
};

const getTradeFlag = (): TradeFlagType => {
  try {
    const element = document.querySelector("#__APP_FLAG__");
    if (!element?.textContent) return { isSSR: false };
    return JSON.parse(element.textContent);
  } catch (error) {
    console.error("Failed to parse trade flag:", error);
    return { isSSR: false };
  }
};

const dehydratedState = getDehydratedState();
const tradeFlag = getTradeFlag();

const ClientApp = () => (
  <BrowserRouter>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <App />
        </HydrationBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  </BrowserRouter>
);

const root = document.querySelector("#root");

if (!root) {
  throw new Error("Root element not found");
}

const renderApp = () => {
  if (tradeFlag.isSSR) {
    // loadableReady： 确保在客户端“注水”（Hydration）开始之前，所有必要的资源（JS 和 CSS）都已经加载完成
    loadableReady(() => {
      // hydrateRoot：React 提供的“注水”函数。
      // 它负责将服务器生成的静态 HTML 与客户端 JS 代码进行匹配，并绑定事件（如 onClick），让页面变得可交互。
      // 注意：在此过程中，嵌套在 ClientApp 里的 HydrationBoundary 会同步将数据填充到 queryClient 缓存中，
      // 从而保证组件激活时能直接拿到数据，避免二次请求和页面闪烁。
      hydrateRoot(root, <ClientApp />);
    });
  } else {
    // createRoot：标准的 CSR 渲染模式
    createRoot(root).render(<ClientApp />);
  }
};

renderApp();
