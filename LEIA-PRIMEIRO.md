# Capítulo 2 · Métodos Matemáticos para las Ciencias

Esta atualização acrescenta notas em espanhol sobre o capítulo 2, Equações de transporte, do livro de Witelski e Bowen (2015). Mantém seus temas, exemplos e símbolos. Inclui as seções 2.1–2.8 e os exercícios 2.1–2.15, reformulados em espanhol, sem solucionário adicional. As duas notas de revisão identificam inconsistências tipográficas do original.

## Instalar no site

1. Extraia o ZIP.
2. Abra a pasta `atualizacao-site`.
3. Copie TODO O CONTEÚDO dessa pasta para a raiz do repositório `lourivalrodrigues.github.io`, onde está `_quarto.yml`.
4. Mescle as pastas e substitua os arquivos com o mesmo nome. Não exclua outros arquivos. Não copie a pasta `atualizacao-site` como uma subpasta do site.
5. No GitHub Desktop, confira as mudanças, escreva `Adicionar capítulo 2 de Métodos`, clique em **Commit to main** e depois **Push origin**.
6. Aguarde a conclusão da publicação no GitHub Actions. Em Notas → Métodos Matemáticos para las Ciencias, abra o cartão do capítulo 2.

A publicação não foi feita automaticamente. A configuração existente do repositório deve renderizar o projeto Quarto quando você enviar a atualização.

## O que está incluído

- Página de leitura nas duas estruturas de navegação do site (o conteúdo da aula permanece em espanhol).
- PDF de 16 páginas, com índice e figuras vetoriais estáticas.
- Três figuras interativas: característica do exemplo (2.35), cruzamento no pulso triangular e solução com choque.
- Atualização da página da matéria com links para leitura e PDF.
- `PREVIA-FIGURAS.html`: abra com duplo clique para experimentar as figuras sem instalar nada.
- `fontes-latex`: fonte editável do PDF e seus desenhos. Não precisa copiar esta pasta para publicar.

## Conferência

O texto e as fórmulas foram comparados com o capítulo 2 do PDF fornecido. As páginas web foram renderizadas com Quarto 1.8.27. O PDF foi compilado e suas 16 páginas inspecionadas visualmente. Foram verificados os controles em ambiente simulado, as fórmulas características e a conservação de área/velocidade do choque. A validação em navegador real não estava disponível nesta sessão; a prévia permite conferir o comportamento no seu navegador.
