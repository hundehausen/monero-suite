"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { CodeHighlightAdapterProvider, createHighlightJsAdapter } from '@mantine/code-highlight';
import hljs from 'highlight.js/lib/core';
import bashLang from 'highlight.js/lib/languages/bash';
import yamlLang from 'highlight.js/lib/languages/yaml';
import iniLang from 'highlight.js/lib/languages/ini';

hljs.registerLanguage('bash', bashLang);
hljs.registerLanguage('yaml', yamlLang);
hljs.registerLanguage('ini', iniLang);

const highlightJsAdapter = createHighlightJsAdapter(hljs);

const customTheme = createTheme({
  primaryColor: "monero-orange",
  colors: {
    "monero-orange": [
      "#fff1e2",
      "#ffe2cc",
      "#ffc39b",
      "#ffa264",
      "#fe8637",
      "#fe741a",
      "#ff6c09",
      "#e45a00",
      "#cb4f00",
      "#b14100",
    ],
  },
});

const Provider = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider defaultColorScheme="dark" theme={customTheme}>
    <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
    {children}
    </CodeHighlightAdapterProvider>
  </MantineProvider>
);

export default Provider;
