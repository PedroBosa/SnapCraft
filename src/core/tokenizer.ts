import Prism from 'prismjs';

// Synchronously load all supported language grammars
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';

import { DiffLine, SupportedLanguage, SyntaxTheme } from '../types/snap';

export interface TokenItem {
  content: string;
  type?: string;
  color?: string;
  fontStyle?: string;
}

export interface TokenizedLine {
  lineNumber: number;
  tokens: TokenItem[];
  isHighlighted: boolean;
  diffType?: 'add' | 'remove';
}

export const SYNTAX_THEMES: SyntaxTheme[] = [
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    bg: '#1a1b26',
    fg: '#c0caf5',
    selection: '#33467c',
    comment: '#565f89',
    keyword: '#bb9af7',
    string: '#9ece6a',
    function: '#7aa2f7',
    number: '#ff9e64',
    punctuation: '#89ddff',
    operator: '#89ddff',
    classType: '#2ac3de',
    variable: '#c0caf5',
    tag: '#f7768e',
    attr: '#e0af68',
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    bg: '#1e1e2e',
    fg: '#cdd6f4',
    selection: '#45475a',
    comment: '#6c7086',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    function: '#89b4fa',
    number: '#fab387',
    punctuation: '#9399b2',
    operator: '#89dceb',
    classType: '#f9e2af',
    variable: '#f5e0dc',
    tag: '#f38ba8',
    attr: '#eba0ac',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    bg: '#0d1117',
    fg: '#e6edf3',
    selection: '#264f78',
    comment: '#8b949e',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    function: '#d2a8ff',
    number: '#79c0ff',
    punctuation: '#c9d1d9',
    operator: '#79c0ff',
    classType: '#ffa657',
    variable: '#ffa657',
    tag: '#7ee787',
    attr: '#79c0ff',
  },
  {
    id: 'vs-code-dark',
    name: 'VS Code Dark+',
    bg: '#1e1e1e',
    fg: '#d4d4d4',
    selection: '#264f78',
    comment: '#6a9955',
    keyword: '#569cd6',
    string: '#ce9178',
    function: '#dcdcaa',
    number: '#b5cea8',
    punctuation: '#d4d4d4',
    operator: '#d4d4d4',
    classType: '#4ec9b0',
    variable: '#9cdcfe',
    tag: '#569cd6',
    attr: '#9cdcfe',
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    bg: '#282c34',
    fg: '#abb2bf',
    selection: '#3e4451',
    comment: '#5c6370',
    keyword: '#c678dd',
    string: '#98c379',
    function: '#61afef',
    number: '#d19a66',
    punctuation: '#abb2bf',
    operator: '#56b6c2',
    classType: '#e5c07b',
    variable: '#e06c75',
    tag: '#e06c75',
    attr: '#d19a66',
  },
  {
    id: 'synthwave-84',
    name: 'Synthwave \'84',
    bg: '#262335',
    fg: '#f92aad',
    selection: '#34294f',
    comment: '#848bbd',
    keyword: '#fede5d',
    string: '#ff7edb',
    function: '#36f9f6',
    number: '#f97e72',
    punctuation: '#b6b1b1',
    operator: '#fe4450',
    classType: '#fe4450',
    variable: '#ff7edb',
    tag: '#72f1b8',
    attr: '#fede5d',
  },
];

export const SUPPORTED_LANGUAGES: { id: SupportedLanguage; label: string; prismGrammar: string }[] = [
  { id: 'typescript', label: 'TypeScript', prismGrammar: 'typescript' },
  { id: 'javascript', label: 'JavaScript', prismGrammar: 'javascript' },
  { id: 'python', label: 'Python', prismGrammar: 'python' },
  { id: 'rust', label: 'Rust', prismGrammar: 'rust' },
  { id: 'go', label: 'Go', prismGrammar: 'go' },
  { id: 'sql', label: 'SQL', prismGrammar: 'sql' },
  { id: 'html', label: 'HTML', prismGrammar: 'html' },
  { id: 'css', label: 'CSS', prismGrammar: 'css' },
  { id: 'json', label: 'JSON', prismGrammar: 'json' },
  { id: 'bash', label: 'Bash / Shell', prismGrammar: 'bash' },
];

export function getTheme(themeId: string): SyntaxTheme {
  const found = SYNTAX_THEMES.find((t) => t.id === themeId);
  return found || SYNTAX_THEMES[0];
}

/**
 * Maps a Prism token type to the active theme's exact color token.
 */
function resolveTokenColor(type: string | undefined, theme: SyntaxTheme): { color: string; fontStyle?: string } {
  if (!type) {
    return { color: theme.fg };
  }

  switch (type) {
    case 'comment':
    case 'prolog':
    case 'doctype':
    case 'cdata':
      return { color: theme.comment, fontStyle: 'italic' };

    case 'keyword':
    case 'atrule':
    case 'rule':
      return { color: theme.keyword };

    case 'string':
    case 'char':
    case 'url':
    case 'attr-value':
      return { color: theme.string };

    case 'function':
    case 'builtin':
      return { color: theme.function };

    case 'number':
    case 'boolean':
    case 'constant':
      return { color: theme.number };

    case 'punctuation':
      return { color: theme.punctuation };

    case 'operator':
    case 'entity':
      return { color: theme.operator };

    case 'class-name':
    case 'maybe-class-name':
    case 'type':
      return { color: theme.classType };

    case 'variable':
    case 'property':
      return { color: theme.variable };

    case 'tag':
    case 'selector':
      return { color: theme.tag };

    case 'attr-name':
      return { color: theme.attr };

    default:
      return { color: theme.fg };
  }
}

/**
 * Flattens a Prism token tree into an array of atomic token items.
 */
function flattenTokens(tokenOrString: string | Prism.Token, parentType?: string): { content: string; type?: string }[] {
  if (typeof tokenOrString === 'string') {
    return [{ content: tokenOrString, type: parentType }];
  }

  const currentType = tokenOrString.type || parentType;

  if (Array.isArray(tokenOrString.content)) {
    return tokenOrString.content.flatMap((child) =>
      flattenTokens(child as string | Prism.Token, currentType)
    );
  }

  if (typeof tokenOrString.content === 'object' && tokenOrString.content !== null) {
    return flattenTokens(tokenOrString.content as Prism.Token, currentType);
  }

  return [{ content: String(tokenOrString.content), type: currentType }];
}

/**
 * Synchronous, zero-latency tokenizer that breaks code into structured lines
 * with syntax coloring, line highlighting, and diff status (+ / -).
 */
export function tokenizeCodeToLines(
  code: string,
  language: SupportedLanguage,
  themeId: string,
  highlightedLines: number[] = [],
  diffLines: DiffLine[] = []
): TokenizedLine[] {
  const theme = getTheme(themeId);
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === language);
  const grammarName = langConfig ? langConfig.prismGrammar : 'typescript';
  const grammar = Prism.languages[grammarName] || Prism.languages.javascript;

  const rawTokens = Prism.tokenize(code, grammar);

  // Flatten tokens
  const flatTokens: { content: string; type?: string }[] = [];
  for (const t of rawTokens) {
    flatTokens.push(...flattenTokens(t));
  }

  // Split tokens across line boundaries
  const lines: TokenItem[][] = [[]];

  for (const token of flatTokens) {
    const { color, fontStyle } = resolveTokenColor(token.type, theme);
    const parts = token.content.split('\n');

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.length > 0) {
        lines[lines.length - 1].push({
          content: part,
          type: token.type,
          color,
          fontStyle,
        });
      }
      if (i < parts.length - 1) {
        lines.push([]);
      }
    }
  }

  // Map into structured TokenizedLine with metadata
  return lines.map((tokenList, index) => {
    const lineNumber = index + 1;

    // Check manual diff config
    const diffMatch = diffLines.find((d) => d.line === lineNumber);
    let diffType: 'add' | 'remove' | undefined = diffMatch?.type;

    // Auto-detect diff from code content if not explicitly set
    if (!diffType && tokenList.length > 0) {
      const firstToken = tokenList[0].content;
      if (firstToken.startsWith('+ ') || firstToken === '+') {
        diffType = 'add';
      } else if (firstToken.startsWith('- ') || firstToken === '-') {
        diffType = 'remove';
      }
    }

    const isHighlighted = highlightedLines.includes(lineNumber);

    return {
      lineNumber,
      tokens: tokenList,
      isHighlighted,
      diffType,
    };
  });
}
