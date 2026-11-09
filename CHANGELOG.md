# Registro de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- Proposta de migração de rotinas com acesso ao DOM fora de `src/core/` para módulos dedicados.
- Proposta de testes automatizados unitários via Vitest para o motor LAO e tokenizador.

## [1.0.0] - 2026-11-09

### Adicionado
- Estúdio de captura e apresentação de código com suporte a temas escuros.
- Motor de iluminação procedural *Layered Ambient Occlusion* (LAO) com 5 camadas de atenuação e brilho colorido reativo.
- Tokenizador síncrono léxico com suporte nativo a 10 linguagens de programação (`typescript`, `javascript`, `python`, `rust`, `go`, `sql`, `html`, `css`, `json`, `bash`).
- Gutter interativo com 4 estados de linha cíclicos (normal, destacado, diff adição, diff remoção) e foco atenuado de contraste.
- Perspectiva 3D por aceleração via hardware CSS com rotação nos eixos X, Y e Z e distância focal configurável.
- Camada de anotações vetoriais sobre o canvas (setas direcionais, marcadores numéricos, rótulos de texto e caixas de ofuscação/redact).
- Pipeline de rasterização em resoluções 1x, 2x e 4K nos formatos PNG, WebP e SVG vetorial encapsulado via `html-to-image`.
- Cópia com 1 clique para a área de transferência via `ClipboardItem` nativa.
- Serialização e restauração completa de configurações de palco via parâmetro de URL Base64URL (`?snap=...`).
- Persistência local de preferências e projetos através de `localStorage` (`snapcraft-storage-v1`).
- Workflows de validação contínua (CI) e publicação automatizada no GitHub Pages.
- Documentação técnica e arquivos de governança para comunidade open source.

[Não lançado]: https://github.com/PedroBosa/SnapCraft/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/PedroBosa/SnapCraft/releases/tag/v1.0.0
