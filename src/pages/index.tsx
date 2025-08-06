import { Outlet, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { locales } = useParams();

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang: locales,
          dir: "ltr",
        }}
        bodyAttributes={{
          class: 'dark'
        }}
      >
        <title>React custom ssr</title>
      </Helmet>
      <Outlet />
    </>
  );
};

export default Index;
