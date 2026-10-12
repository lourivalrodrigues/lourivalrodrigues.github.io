# Comece aqui — guia para GitHub Desktop no Windows

Você já tem o GitHub Desktop. Com este pacote, não precisa programar nem instalar Quarto para publicar: o GitHub compila o site automaticamente.

## 1. Entre na sua conta
Abra o GitHub Desktop. Em **File → Options → Accounts**, entre na sua conta GitHub. Se não tiver conta, crie uma em https://github.com/signup.
Anote seu nome de usuário (username). Ele pode ser diferente do seu nome de exibição.

## 2. Extraia o pacote
Clique com o botão direito no ZIP e escolha **Extrair tudo**. Abra a pasta extraída `academic-site`. Confira que nela estão `_quarto.yml`, `index.qmd` e `COMECE-AQUI.md`.

## 3. Crie o repositório pelo Desktop
1. No GitHub Desktop, selecione **File → New repository**.
2. Em **Name**, escreva `SEUUSUARIO.github.io`, substituindo `SEUUSUARIO` pelo username exato da sua conta. Exemplo ilustrativo: se o username fosse `louri-math`, o nome seria `louri-math.github.io`.
3. Em **Local path**, escolha uma pasta de trabalho, como Documentos/GitHub. O Desktop criará uma subpasta com o nome do repositório.
4. Não selecione modelos de licença nem de gitignore. Clique **Create repository**.
5. Use **Repository → Show in Explorer** para abrir a nova pasta.
6. Copie TODO o conteúdo de `academic-site` para essa nova pasta, inclusive `.github`, `.gitignore` e `.gitattributes`. Copie os arquivos para a raiz, não a pasta `academic-site` inteira. Não remova a pasta `.git` criada pelo Desktop.
7. Volte ao Desktop. Em **Summary**, escreva `Create academic website`. Clique **Commit to main**. Se a branch tiver outro nome, use **Branch → Rename** para renomeá-la para `main` antes de publicar.

## 4. Envie ao GitHub
Clique **Publish repository**. Para a hospedagem gratuita em GitHub Pages, desmarque **Keep this code private** e clique **Publish repository**. O código e os textos enviados serão públicos.
O nome deve continuar sendo `SEUUSUARIO.github.io`.

## 5. Ative o GitHub Pages
1. No Desktop, use **Repository → View on GitHub**.
2. No navegador, abra **Settings → Pages** do repositório.
3. Em **Build and deployment → Source**, escolha **GitHub Actions**. O workflow já está no pacote; não é necessário escolher um template nem criar outro arquivo.
4. Vá à aba **Actions**. Escolha **Publish academic website**.
5. Clique **Run workflow**, selecione `main` e confirme **Run workflow**.
6. Aguarde até que as etapas `build` e `deploy` apareçam concluídas em verde. Pode levar alguns minutos.
7. Seu endereço será `https://SEUUSUARIO.github.io/`. O endereço efetivo também aparece em **Settings → Pages**.

A primeira execução automática pode falhar se começar antes de você ativar Pages. Depois de ativar, execute **Run workflow** novamente. Não precisa mudar o código.

## 6. Como editar depois
1. Use **Repository → Show in Explorer**.
2. Abra o `.qmd` desejado no seu editor de texto. VS Code é uma opção; o Bloco de Notas também funciona, desde que salve como UTF-8 sem alterar a extensão.
3. Altere os parágrafos abaixo do bloco delimitado por `---`. Evite alterar a configuração inicial se quiser apenas editar conteúdo.
4. Faça a mesma atualização no arquivo correspondente dentro de `es/`.
5. No Desktop, escreva um resumo, como `Update publications`, e clique **Commit to main**.
6. Clique **Push origin**. O GitHub atualizará o site automaticamente.

**Commit** registra a alteração no computador; **Push** a envia ao GitHub. Se editar apenas no computador, o site público ainda não muda.

## 7. Mapa rápido dos arquivos
| O que você quer mudar | Inglês | Espanhol |
|---|---|---|
| Apresentação | `index.qmd` | `es/index.qmd` |
| Pesquisa | `research.qmd` | `es/research.qmd` |
| Publicações | `publications.qmd` | `es/publications.qmd` |
| Cursos | `teaching.qmd` | `es/teaching.qmd` |
| Currículo | `cv.qmd` | `es/cv.qmd` |
| Lista de notas | `notes.qmd` | `es/notes.qmd` |
| Nota do pêndulo | `notes/second-order.qmd` | `es/notes/second-order.qmd` |

## 8. Adicionar uma publicação
Em `publications.qmd`, copie um bloco `::: {.publication}` existente e altere o título. Adicione autores, revista, ano e links apenas depois de verificar os dados. Exemplo de formato:

```markdown
::: {.publication}
### Título do artigo
Autores. *Nome da revista*, ano.
[DOI](https://doi.org/DOI-VERIFICADO) · [PDF](files/artigo.pdf)
:::
```

Este bloco é um modelo de edição, não uma referência real. Na página espanhola, o caminho do PDF será `../files/artigo.pdf`.

## 9. Adicionar notas e fotografia
Para uma nova nota, copie `notes/second-order.qmd`, altere o nome e o texto e inclua um link em `notes.qmd`. Crie a tradução com o mesmo nome em `es/notes/` e adicione seu link em `es/notes.qmd`. Atualize também o link de idioma na própria nota.
A fotografia pode ser adicionada mais tarde em `assets/`. A versão inicial já funciona sem ela.

## 10. Se algo der errado
- **Site mostra 404:** confirme nome do repositório, conclusão do deploy e **Settings → Pages → Source: GitHub Actions**.
- **Não aparece o workflow:** confira que `.github/workflows/publish.yml` está na raiz do repositório, não dentro de outra pasta.
- **Render falhou:** abra a execução na aba Actions e veja a primeira mensagem de erro na etapa Render website. Um bloco `---` ou uma indentação YAML alterados podem ser a causa.
- **Deploy falhou:** confira Pages, repositório público e a branch `main`.
- **Mudanças não aparecem:** confirme **Push origin**, aguarde a execução e recarregue o navegador com Ctrl+F5.

## Referências oficiais
- GitHub Desktop: https://docs.github.com/en/desktop/adding-and-cloning-repositories
- GitHub Pages com workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Quarto: https://quarto.org/docs/publishing/github-pages.html
