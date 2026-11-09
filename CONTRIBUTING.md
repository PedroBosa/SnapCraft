# Guia de Contribuição

Agradecemos o interesse em contribuir com o **SnapCraft**. Este documento estabelece as diretrizes para desenvolvimento, estilo de código, testes e envio de contribuições.

---

## 1. Princípios de Desenvolvimento

1. **Execução no Navegador (Client-Side Puro):** O SnapCraft não possui camada de backend e não deve realizar requisições de rede em tempo de execução (telemetria, métricas de terceiros ou fontes externas via CDN).
2. **Tipagem Estrita:** O uso de `any` é estritamente proibido. Todas as interfaces, estruturas e estados devem possuir tipos explícitos.
3. **Consistência Visual e Alta Densidade:** A interface é projetada para desenvolvedores técnicos, priorizando alta densidade de informação, tema escuro e respeito aos tokens de cores definidos no design system.

---

## 2. Pré-requisitos do Ambiente

- **Node.js:** Versão 22 LTS ou superior (conforme `.nvmrc`).
- **npm:** Versão 10 ou superior.
- **Git:** Versão 2.30 ou superior.

---

## 3. Configuração Local

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/PedroBosa/SnapCraft.git
cd SnapCraft
npm ci
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará acessível em `http://localhost:3000`.

---

## 4. Comandos de Verificação

Antes de abrir um Pull Request, execute os seguintes comandos no terminal:

```bash
# Validação de tipos do compilador TypeScript
npm run typecheck

# Compilação do pacote de produção
npm run build

# Pré-visualização do pacote compilado
npm run preview
```

Todos os comandos devem finalizar com código de saída zero (`0`) e sem advertências não tratadas.

---

## 5. Padrão de Commits

Este projeto adere à convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). Toda mensagem de commit deve seguir a estrutura:

```text
<tipo>(<escopo opcional>): <descrição em minúsculas>
```

Tipos permitidos:

| Tipo | Descrição |
|---|---|
| `feat` | Nova funcionalidade para o usuário ou editor |
| `fix` | Correção de defeito funcional ou de renderização |
| `docs` | Alterações exclusivas na documentação |
| `refactor` | Refatoração de código que não altera comportamento |
| `perf` | Melhoria de desempenho na renderização ou no bundle |
| `chore` | Manutenção de build, dependências ou governança |

Exemplos:
- `feat(tokenizer): adicionar gramática para linguagem Elixir`
- `fix(shadows): corrigir offset de penumbra em ângulos superiores`
- `docs(readme): atualizar tabela de compatibilidade de navegadores`

---

## 6. Fluxo de Envio de Pull Requests

1. Crie uma branch específica a partir da `main`:
   ```bash
   git checkout -b feat/nome-da-funcionalidade
   ```
2. Realize as alterações mantendo commits atômicos e descritivos.
3. Execute as verificações locais (`npm run typecheck` e `npm run build`).
4. Envie a branch para o seu fork ou para o repositório remoto:
   ```bash
   git push origin feat/nome-da-funcionalidade
   ```
5. Abra o Pull Request no GitHub preenchendo todos os itens do template obrigatório.

---

## 7. Reporte de Vulnerabilidades

Caso identifique uma falha ou risco de segurança, não abra uma issue pública. Siga as instruções descritas em [`SECURITY.md`](SECURITY.md).
