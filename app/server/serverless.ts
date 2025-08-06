import serverless from "serverless-http";
import app, { router } from "./index";

app.use(router.routes()).use(router.allowedMethods());

export const handler = serverless(app);
