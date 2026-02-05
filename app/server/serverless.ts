// 导入 serverless-http 库，用于将标准的 Node.js Web 框架（如 Koa/Express）转换为云函数（如 AWS Lambda）可识别的处理函数
import serverless from "serverless-http";
// 从 index.ts 中导入 Koa 实例(app)和路由配置(router)
import app, { router } from "./index";

// 将路由中间件挂载到 Koa 实例上
// router.routes(): 注册定义的所有路由路径
// router.allowedMethods(): 处理 OPTIONS 请求以及 405 (Method Not Allowed) 状态
app.use(router.routes()).use(router.allowedMethods());

// 使用 serverless() 包装 Koa 实例并导出为名为 'handler' 的函数
// 这是云平台（如 AWS Lambda）调用该服务的标准入口点
export const handler = serverless(app);
