import { type Config } from "prettier";

const config: Config = {
  arrowParens: "avoid",
  bracketSameLine: true,
  jsxSingleQuote: true,
  quoteProps: "consistent",
  resolveGlobalModules: true,
  semi: false,
  singleQuote: true,
  trailingComma: "none",
  useEditorConfig: false,
  useTabs: true,
};

export default config;
