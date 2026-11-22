# 📊 Frequenciômetro — CCM Anchieta

Painel para a TV da escola: frequência por turma, rankings por turno, disputa manhã × tarde, histórico, trimestres e **sorteio de brindes** para as turmas com melhor frequência.

Site: <https://anchietafrequencia.vercel.app>

## Como funciona

Os dados vêm do **SIGA** (Apps Script do sistema da escola, arquivo `backend/frequenciometro.gs` no repositório CCMAnchieta):

| O quê | Acesso |
|---|---|
| % de frequência por turma, histórico e trimestres | público (números agregados) |
| Lista de alunos para o sorteio | **só com a chave da TV** |
| Quem já foi sorteado | aba `Sorteios` da planilha, igual em todas as TVs |

### Configurar uma TV

1. No Apps Script do SIGA, execute `FREQ_gerarChaveTV`.
2. Abra **uma vez** na TV o endereço que aparece no registro (`...?chave=...`).
3. A TV guarda a chave e ela some do endereço.

Sem a chave, o painel funciona normalmente, mas o sorteio fica desativado.

### Trimestres

Na aba `Frequenciometro_Trimestres` da planilha do SIGA, preencha a média quando o trimestre fechar. O trimestre em andamento mostra a média atual da escola.

### Atualização

A TV relê os dados a cada 10 minutos e recarrega a página a cada 6 horas. Ela nunca atualiza no meio de um sorteio ou com uma janela aberta.

## ⚖️ Licença

**Software proprietário. Todos os direitos reservados.** Copyright © 2026 Cleiton Ivaí da Silva.
Uso concedido exclusivamente ao Colégio Cívico-Militar Anchieta. Veja o arquivo `LICENSE`.
