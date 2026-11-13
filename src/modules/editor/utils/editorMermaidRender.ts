import type { Mermaid } from 'mermaid';

let mermaidPromise: Promise<Mermaid> | null = null;
let initializedTheme: string | null = null;
let renderSeq = 0;

async function getMermaid(dark: boolean): Promise<Mermaid> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => module.default);
  }
  const mermaid = await mermaidPromise;

  const theme = dark ? 'dark' : 'default';
  if (initializedTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme,
    });
    initializedTheme = theme;
  }
  return mermaid;
}

export async function renderMermaidSvg(
  code: string,
  dark: boolean,
): Promise<string> {
  const mermaid = await getMermaid(dark);

  await mermaid.parse(code);

  const id = `mermaid-render-${++renderSeq}`;
  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } finally {
    document.getElementById(id)?.remove();
    document.getElementById(`d${id}`)?.remove();
  }
}
