import type React from "react";
import baseLoadable from "@loadable/component";

const loadable = <T,>(
  dynamicImport: () => Promise<{
    default: React.FunctionComponent<T>;
  }>,
  loading = <div>loading</div>,
  ssr: boolean = true
) => baseLoadable(dynamicImport, { fallback: loading, ssr });

export default loadable;
