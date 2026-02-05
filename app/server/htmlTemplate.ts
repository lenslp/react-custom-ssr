import { type FilledContext } from "react-helmet-async";
import { helmetTagNameList } from "@app/utils/constants";
import { type ChunkExtractor } from "@loadable/server";

export interface StartTemplateProps {
  extractor: ChunkExtractor;
  helmetContext: FilledContext;
}

export interface EndTemplateProps {
  extractor: ChunkExtractor;
  dehydratedState: string;
}

export const start = `<!DOCTYPE html>
<html `

export const getStartTemplate = ({
  helmetContext,
  extractor,
}: StartTemplateProps) => {
  return `${helmetContext?.helmet?.htmlAttributes.toString()}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${helmetTagNameList
      .map((tagName) => helmetContext?.helmet?.[tagName].toString())
      .join("")}
  ${extractor.getLinkTags()}
  ${extractor.getStyleTags()}
</head>
<body ${helmetContext?.helmet?.bodyAttributes.toString()}>
  <div id="root">`;
};

export const getEndTemplate = ({
  dehydratedState,
  extractor,
}: EndTemplateProps) => {
  return `</div>
  <script id="__APP_FLAG__" type="application/json">{"isSSR": true}</script>
  <script id="__REACT_QUERY_STATE__" type="application/json">${dehydratedState}</script>
  ${extractor.getScriptTags()}
  <noscript>
    <div style="text-align: center; padding: 20px;">
      <h1>JavaScript Required</h1>
      <p>This application requires JavaScript to be enabled.</p>
    </div>
  </noscript>
</body>
</html>`;
};
