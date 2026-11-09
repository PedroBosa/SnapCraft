# SnapCraft

> **Estúdio de apresentação de código e captura de telas com modelo de iluminação em camadas e rasterização no navegador. Execução 100% no cliente, sem backend e sem telemetria em tempo de execução.**

<p align="center">
  <a href="https://pedrobosa.github.io/SnapCraft/"><img alt="Demo ao vivo" src="https://img.shields.io/badge/Demo-Online-10B981?style=for-the-badge&logo=github"></a>
  <a href="LICENSE"><img alt="Licença: MIT" src="https://img.shields.io/badge/Licen%C3%A7a-MIT-6366F1?style=for-the-badge"></a>
  <a href="https://github.com/PedroBosa"><img alt="Autor: Pedro Bosa" src="https://img.shields.io/badge/Autor-Pedro%20Bosa-4F46E5?style=for-the-badge&logo=github"></a>
</p>

<p align="center">
  <img alt="React 18" src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react">
  <img alt="TypeScript 5.7" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript">
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite">
  <img alt="Tailwind CSS 3.4" src="https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat&logo=tailwindcss">
  <img alt="Status do CI" src="https://github.com/PedroBosa/SnapCraft/actions/workflows/ci.yml/badge.svg">
</p>

---

## Visão geral

O **SnapCraft** é uma ferramenta para geração de imagens de trechos de código e capturas de tela, projetada para documentação técnica, relatórios de engenharia e materiais educacionais.

A maioria das soluções convencionais apresenta limitações operacionais relevantes: transmissão de código confidencial para servidores externos, rasterização com compressão destrutiva, falta de suporte para anotações contextuais precisas ou imposição de marcas d'água.

O SnapCraft processa todas as transformações geométricas, estilização sintática e rasterização diretamente na memória do navegador do usuário. O projeto opera sem serviços de backend, sem dependência de fontes remotas em tempo de execução e sem injeção compulsória de marcas d'água na exportação.

---

## Destaques de engenharia

### 1. Modelo de atenuação óptica em camadas (LAO)
A simulação de profundidade calcula uma matriz composta de `box-shadow` em 5 camadas atenuadas, simulando a queda de intensidade da luz a partir do fator normalizado de elevação $e = \frac{\text{clamp}(\text{elevation}, 1, 100)}{50}$ e do ângulo de incidência luminoso $\theta$ (em radianos $\theta = \frac{\text{lightAngle} \cdot \pi}{180}$):

$$\vec{\delta}_i = (k_{x,i} \cdot e \cdot \cos\theta, \; k_{y,i} \cdot e \cdot \sin\theta)$$

A projeção anisotrópica privilegia o eixo vertical ($k_{y,i} > k_{x,i}$) para simular a iluminação zenital de estúdio. No preset `elevated`, as 5 camadas calculadas são:
- **Umbra de contato:** $\vec{\delta}_1 = (0.5e \cos\theta, 1.0e \sin\theta)\text{ px}$, raio de desfoque $2e\text{ px}$, opacidade $0.45$.
- **Penumbra próxima:** $\vec{\delta}_2 = (1.5e \cos\theta, 3.0e \sin\theta)\text{ px}$, raio de desfoque $7e\text{ px}$, opacidade $0.32$.
- **Dispersão ambiente média:** $\vec{\delta}_3 = (3.5e \cos\theta, 8.0e \sin\theta)\text{ px}$, raio de desfoque $18e\text{ px}$, opacidade $0.26$.
- **Oclusão distante:** $\vec{\delta}_4 = (7.0e \cos\theta, 18.0e \sin\theta)\text{ px}$, raio de desfoque $38e\text{ px}$, opacidade $0.20$.
- **Fronteira difusa externa:** $\vec{\delta}_5 = (12.0e \cos\theta, 36.0e \sin\theta)\text{ px}$, raio de desfoque $75e\text{ px}$, opacidade $0.15$.

A composição inclui ainda uma reflexão superior especular (`inset 0 1px 0 0 rgba(255, 255, 255, 0.16)`), um anel interno escuro de contraste (`inset 0 0 0 1px rgba(255, 255, 255, 0.08)`), borda perimétrica de contenção (`0 0 0 1px rgba(0, 0, 0, 0.5)`) e um halo reativo opcional calculado a partir do espectro dominante do gradiente de fundo selecionado.

### 2. Tokenizador síncrono e gutter interativo
O realce de sintaxe é executado de forma síncrona através do analisador léxico PrismJS, sem latência de compilação WebAssembly. O sistema suporta 10 linguagens: `typescript`, `javascript`, `python`, `rust`, `go`, `sql`, `html`, `css`, `json` e `bash`.

A calha de linhas (*gutter*) permite alternar o estado de cada linha via interação direta:

$$\text{Normal} \longrightarrow \text{Destaque} \longrightarrow \text{Diff Adição (+)} \longrightarrow \text{Diff Remoção (-)} \longrightarrow \text{Normal}$$

Quando o modo de foco (*focus dimming*) está ativo, linhas não destacadas recebem atenuação visual (`opacity: 0.35` e `blur(0.3px)`), direcionando a atenção para o trecho relevante.

### 3. Transformação espacial 3D por CSS
O palco de renderização utiliza o subsistema de perspectiva 3D acelerado por GPU (`transform-style: preserve-3d`), permitindo ajuste contínuo dos seguintes eixos:
- **Rotação X (Tilt):** $-20^\circ$ a $+20^\circ$.
- **Rotação Y (Yaw):** $-20^\circ$ a $+20^\circ$.
- **Rotação Z (Roll):** $-10^\circ$ a $+10^\circ$.
- **Distância focal:** $800\text{ px}$ a $2000\text{ px}$.

Estão disponíveis presets pré-definidos (`flat`, `iso-left`, `iso-right`, `hero-tilt`) e matriz de alinhamento em 9 pontos cardeais para composição gráfica.

### 4. Camada de anotações vetoriais
Elementos analíticos são compostos no espaço de coordenadas do palco e incorporados na rasterização final:
- **Setas direcionais:** cálculo vetorial com manipuladores de início $(x_1, y_1)$ e fim $(x_2, y_2)$ desacoplados.
- **Marcadores numéricos (*step badges*):** identificadores sequenciais com suporte a paletas temáticas.
- **Rótulos (*text pills*):** etiquetas de texto com edição inline.
- **Caixas de ofuscação (*redact*):** áreas com `backdrop-filter: blur(8px)` e padrão listrado a $45^\circ$ para preservação de segredos e dados sensíveis.

Todos os elementos de interface de edição (alças de redimensionamento e bordas de seleção) recebem a classe utilitária `.stage-ignore-export` e são excluídos automaticamente durante a captura.

### 5. Pipeline de exportação e integridade gráfica
A rasterização converte a árvore de elementos do DOM em dados gráficos utilizando a biblioteca `html-to-image`:
- Formatos suportados: **PNG**, **WebP** e **SVG** encapsulado.
- Escalas de densidade: `1x` (padrão de tela), `2x` (alta densidade) e `4x` (definição ultra-alta / 4K).
- Exportação direta para a área de transferência do sistema operacional através da interface assíncrona `ClipboardItem` (`image/png`), permitindo colagem imediata em outras ferramentas com `Ctrl+V` ou `Cmd+V`.
- Nenhuma marca d'água da ferramenta é injetada no resultado final.

### 6. Serialização de estado em URL Base64URL
As configurações completas do palco, incluindo código-fonte, ângulos 3D, seleções de estilo e anotações, são codificadas em uma cadeia Base64URL compacta com suporte a caracteres Unicode UTF-8 (`?snap=...`), permitindo compartilhamento instantâneo sem persistência em banco de dados remoto.

---

## Recursos

- **Modos de operação:** alternância entre modo código (*code*) e modo captura de tela (*screenshot* com redimensionamento proporcional e recorte).
- **Molduras de janela:** macOS Dark, macOS Light, macOS Mono, Windows Fluent, Terminal, Minimal Browser e Sem Moldura (*frameless*).
- **Gradientes e superfícies:** paleta técnica com gradientes de alta densidade, malhas cromáticas, superfícies sólidas, fundo transparente quadriculado e ruído procedural SVG ajustável.
- **Controle de proporção (*aspect ratio*):** Automático (ajustado ao conteúdo), `16:9`, `4:3`, `1:1`, `1200×675` (X/LinkedIn) e `1200×630` (Open Graph).
- **Atalhos globais de teclado:**
  - `Ctrl+C` / `Cmd+C`: copiar imagem renderizada para a área de transferência.
  - `Ctrl+S` / `Cmd+S`: exportação e download no formato e escala ativos.
  - `Ctrl+K` / `Cmd+K` ou `?`: abertura da barra de comandos e atalhos.
  - `Tab`: alternância entre modo código e captura de tela.
  - `Delete` / `Backspace`: exclusão da anotação selecionada.
  - `Esc`: fechar modais ou desselecionar anotações.

---

## Privacidade e segurança

- **Ausência de requisições de rede:** a aplicação não efetua chamadas HTTP/HTTPS (`fetch`, `XMLHttpRequest`) em tempo de execução.
- **Fontes locais:** as declarações de tipografia utilizam a pilha de fontes instalada no sistema operacional (`Inter`, `JetBrains Mono`, `Fira Code`, pilhas do sistema), sem comunicação com servidores de fontes externos (Google Fonts ou CDNs).
- **Armazenamento estritamente local:** configurações e rascunhos são mantidos no `localStorage` do navegador (`snapcraft-storage-v1`), sem transmissão externa. Imagens coladas em base64 não são persistidas em disco para evitar saturação de cota.
- **Preservação de segredos:** a ferramenta fornece componente nativo de ofuscação visual (*redact box*) para cobrir tokens de autenticação, senhas e endereços privados antes da geração da imagem final.

---

## Estrutura do projeto

```text
SnapCraft/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml          # Formulário padronizado para relato de bugs
│   │   ├── config.yml              # Configurações de issues e canal de segurança
│   │   └── feature_request.yml     # Formulário padronizado para sugestões
│   ├── workflows/
│   │   ├── ci.yml                  # Validação estática de tipos e build em PRs
│   │   └── deploy.yml              # Build e publicação no GitHub Pages
│   ├── CODEOWNERS                  # Definição de propriedade de código (@PedroBosa)
│   ├── dependabot.yml              # Atualização semanal de dependências npm e actions
│   └── PULL_REQUEST_TEMPLATE.md    # Checklist de verificação para pull requests
├── src/
│   ├── core/                       # Algoritmos puros, conversores e definições de estilo
│   │   ├── aspectRatios.ts         # Cálculo de dimensões e proporções de palco
│   │   ├── backgrounds.ts          # Gradientes, malhas e parâmetros de ruído
│   │   ├── exporter.ts             # Rasterização com html-to-image e ClipboardItem
│   │   ├── shadows.ts              # Modelo óptico LAO (5 camadas de sombra e brilho)
│   │   ├── shortcuts.ts            # Gerenciamento de atalhos globais de teclado
│   │   ├── templates.ts            # Predefinições temáticas de estúdio
│   │   ├── tokenizer.ts            # Análise léxica com PrismJS e diff de linhas
│   │   └── urlState.ts             # Serialização e decodificação Base64URL
│   ├── modules/                    # Componentes visuais do workbench e palco
│   │   ├── canvas/
│   │   │   ├── AnnotationLayer.tsx # Renderização de setas, badges, rótulos e blur
│   │   │   ├── CodeEditor.tsx      # Editor de código sincronizado com calha interativa
│   │   │   ├── ScreenshotView.tsx  # Manipulação de imagens e uploads locais
│   │   │   ├── StageViewport.tsx   # Palco de renderização com zoom e alinhamento
│   │   │   ├── Watermark.tsx       # Identificador opcional do desenvolvedor
│   │   │   └── WindowFrame.tsx     # Molduras simuladas de sistemas operacionais
│   │   └── workbench/
│   │       ├── CommandPalette.tsx  # Barra de pesquisa e comandos rápidos
│   │       ├── Sidebar.tsx         # Painel de iluminação, 3D, cores e tipografia
│   │       └── Topbar.tsx          # Controle de aspecto, cópia, zoom e exportação
│   ├── store/
│   │   └── useSnapStore.ts         # Estado da aplicação com persistência Zustand
│   ├── types/
│   │   └── snap.ts                 # Interfaces estritas e uniões discriminadas
│   ├── App.tsx                     # Ponto de montagem da interface principal
│   ├── index.css                   # Tokens base, resets e estilos utilitários
│   └── main.tsx                    # Inicialização do React 18 no elemento raiz
├── .editorconfig                   # Padronização de indentação e quebras de linha
├── .gitattributes                  # Normalização de quebras de linha (LF)
├── .gitignore                      # Exclusão de artefatos de build e dependências
├── .nvmrc                          # Versão de runtime Node.js recomendada (22)
├── CHANGELOG.md                    # Histórico de alterações seguindo Keep a Changelog
├── CODE_OF_CONDUCT.md              # Código de conduta Contributor Covenant 2.1
├── CONTRIBUTING.md                 # Guia de contribuição e comandos de validação
├── index.html                      # Ponto de entrada HTML com metadados estruturados
├── LICENSE                         # Licença permissiva MIT
├── package.json                    # Metadados do projeto e scripts de automação
├── postcss.config.js               # Configuração do PostCSS
├── README.md                       # Documentação principal do projeto
├── SECURITY.md                     # Política de segurança e reporte confidencial
├── tailwind.config.js              # Configuração de temas e tokens Tailwind CSS
├── tsconfig.json                   # Configuração de compilação estrita do TypeScript
├── tsconfig.node.json              # Configuração TypeScript para scripts do Vite
└── vite.config.ts                  # Configuração do empacotador Vite e base path
```

---

## Primeiros passos

### Pré-requisitos
- Node.js versão 20 LTS ou 22 LTS (verifique com `node --version`).
- npm versão 10 ou superior.

### Instalação e execução
```bash
git clone https://github.com/PedroBosa/SnapCraft.git
cd SnapCraft
npm ci
npm run dev
```

### Build e verificação
```bash
npm run typecheck
npm run build
npm run preview
```

---

## Compatibilidade

| Navegador / Plataforma | Suporte | Observações |
|---|---|---|
| Google Chrome / Chromium $\ge 108$ | Integral | Aceleração 3D por GPU, `ClipboardItem` nativo e exportação 4K. |
| Microsoft Edge $\ge 108$ | Integral | Suporte equivalente ao Chromium. |
| Mozilla Firefox $\ge 115$ | Estável | Suporte integral; em resoluções 4K extremas, monitore o limite de memória do canvas. |
| Apple Safari $\ge 16.4$ | Suportado com restrições | `ClipboardItem` com PNG requer contexto seguro (HTTPS/localhost); variações menores na rasterização de `backdrop-filter` 3D. |
| Dispositivos Móveis | Suporte de visualização | Interface otimizada para desktop; manipulação de canvas em telas sensíveis ao toque pode ter precisão reduzida. |

---

## Stack e tecnologias

| Tecnologia | Versão | Função na arquitetura |
|---|---|---|
| React | 18.3.1 | Renderização declarativa da interface do usuário |
| TypeScript | 5.7.2 | Tipagem estática estrita em toda a base de código |
| Vite | 6.0.3 | Empacotador e servidor de desenvolvimento |
| Zustand | 5.0.2 | Gerenciamento de estado global com middleware de persistência |
| Tailwind CSS | 3.4.16 | Utilitários de estilização e tokens de tema escuro |
| PrismJS | 1.29.0 | Análise léxica síncrona para realce de sintaxe em 10 linguagens |
| html-to-image | 1.11.11 | Conversão de elementos do DOM em blobs de imagem (PNG, WebP, SVG) |
| Lucide React | 0.468.0 | Conjunto consistente de ícones técnicos de interface |

---

## Limitações conhecidas

- **Mecanismo de captura e transformações 3D:** a rasterização depende de `html-to-image`, que serializa a árvore de nós do DOM em SVG com `foreignObject` para desenho em canvas. Filtros complexos (`backdrop-filter`) combinados a transformações de perspectiva 3D (`transform-style: preserve-3d`) podem sofrer achatamento ou inconsistências em determinados motores de renderização, especialmente no WebKit (Safari).
- **Tipografia e carregamento assíncrono de fontes:** a ausência de espera explícita por `document.fonts.ready` antes do início da rasterização pode resultar na aplicação temporária de fontes do sistema (*fallback font*) caso fontes declaradas ainda estejam em fase de carregamento na memória do navegador.
- **Suporte ao formato WebP:** a geração de arquivos WebP via `html-to-image` / `toBlob` depende do suporte nativo da implementação de canvas do navegador; versões legadas do Safari ou navegadores com restrições de codecs exigem exportação em PNG.
- **Uso de memória gráfica em escala 4K:** a exportação em resolução ultra-alta (`scale: 4`) em palcos extensos (>2560px) pode ultrapassar a barreira de $10000\text{ px}$ de largura/altura no canvas subjacente, atingindo os limites de alocação de buffer gráfico em dispositivos com pouca memória compartilhada.
- **Área de transferência assíncrona:** a interface `navigator.clipboard.write([new ClipboardItem(...)])` exige permissões de área de transferência ativas no navegador e opera exclusivamente sob contexto seguro (HTTPS ou `localhost`).

---

## Contribuindo

Contribuições que aprimorem a estabilidade, desempenho e fidelidade gráfica são bem-vindas. Consulte o guia detalhado em [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de enviar alterações. Relatos de falhas de segurança devem seguir a política em [`SECURITY.md`](SECURITY.md).

---

## Licença

Distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE) para mais informações.

Desenvolvido por [Pedro Bosa](https://github.com/PedroBosa).
