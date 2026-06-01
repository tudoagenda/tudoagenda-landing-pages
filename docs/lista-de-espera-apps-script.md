# Lista de espera — integração com Google Sheets

A LP `/agendabela/lista-de-espera` salva os cadastros (nome + WhatsApp) numa
planilha do Google via um **Google Apps Script Web App**.

Fluxo:

```
Form (LP) → POST /api/agendabela/waitlist (BFF) → Apps Script /exec → append na planilha
```

O BFF (`src/app/api/agendabela/waitlist/route.ts`) valida/normaliza e repassa.
O Apps Script faz o `appendRow` na planilha. Nenhuma credencial do Google
fica no app — só a URL `/exec` (e um segredo opcional).

## 1. Abrir o editor de script da planilha

1. Abra a planilha (conta `tudoagendaagendabela@gmail.com`):
   <https://docs.google.com/spreadsheets/d/1IDXcBydDqkpPuZZ61GYBWYzmxUpHS0dwxMdtIhezSyc/edit>
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo padrão e cole o código abaixo.

## 2. Código do Apps Script

```javascript
// Segredo compartilhado: precisa ser IGUAL ao AGENDABELA_WAITLIST_SECRET do app.
// Deixe "" se não for usar segredo (não recomendado em produção).
const SECRET = "TROQUE_POR_UM_SEGREDO_FORTE";

// ID da planilha (o trecho entre /d/ e /edit na URL). Usamos openById em vez de
// getActiveSpreadsheet() porque num Web App publicado (execução via HTTP) não
// existe planilha "ativa" no contexto — getActiveSpreadsheet() retorna null.
const SHEET_ID = "1IDXcBydDqkpPuZZ61GYBWYzmxUpHS0dwxMdtIhezSyc";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");

    if (SECRET && body.secret !== SECRET) {
      return json({ error: "unauthorized" });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    // Cria cabeçalho na primeira execução, se a planilha estiver vazia.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Data", "Nome", "WhatsApp", "Origem"]);
    }

    sheet.appendRow([
      new Date(),
      String(body.name || ""),
      String(body.whatsapp || ""),
      String(body.source || ""),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

> Obs: o Apps Script Web App não define status HTTP custom em respostas de
> `ContentService` (sempre 200). Por isso o script retorna `{ ok: true }` no
> sucesso e `{ error: ... }` no erro, e o **BFF valida o corpo** (`ok === true`),
> não só o status. O `status` passado pra `json()` é ignorado pelo Apps Script
> e fica só como documentação.

## 3. Publicar como Web App

1. No editor: **Implantar → Nova implantação**.
2. Tipo: **App da Web**.
3. **Executar como:** Eu (`tudoagendaagendabela@gmail.com`).
4. **Quem pode acessar:** **Qualquer pessoa** (necessário pro BFF chamar sem login).
5. **Implantar** → autorize as permissões da conta.
6. Copie a **URL do app da Web** (termina em `/exec`).

A cada mudança no código, use **Implantar → Gerenciar implantações → editar →
Nova versão** pra que a URL `/exec` reflita o código novo.

## 4. Configurar as env vars do app (Railway)

No serviço da `tudoagenda-landing-pages`:

| Variável | Valor |
| --- | --- |
| `AGENDABELA_WAITLIST_WEBHOOK_URL` | a URL `/exec` copiada no passo 3 |
| `AGENDABELA_WAITLIST_SECRET` | o mesmo valor de `SECRET` no script |

Local (não commitar): coloque as duas num `.env.local`.

## 5. Testar

```bash
curl -X POST http://localhost:3000/api/agendabela/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","whatsapp":"(11) 91234-5678"}'
# esperado: {"ok":true} e uma linha nova na planilha
```
