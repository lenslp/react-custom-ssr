import { Outlet, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { locales } = useParams();

  return (
    <>
      <Helmet
        title="React custom ssr" // 直接使用属性设置标题，解决 TS 无法识别 <title> 标签的问题
        htmlAttributes={{
          lang: locales || "en",
          dir: "ltr",
        }}
        bodyAttributes={{
          className: 'dark'
        }}
      >
        <meta name="description" content="React custom ssr" />
      </Helmet>
      <Outlet />
    </>
  );
};

export default Index;
