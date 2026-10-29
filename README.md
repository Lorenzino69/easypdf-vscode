# EasyPDF for VS Code

This extension adds the <a href="https://www.easypdf.fr">EasyPDF</a> MCP server to VS Code. Once it is installed, GitHub Copilot in agent mode (or any other chat agent in VS Code that uses MCP servers) can work on real PDF files for you: change text inside an existing PDF while keeping its fonts and layout, compress a file under a size limit, merge, split, convert to Word, Excel or PowerPoint, translate, and more.

The extension itself is small. It contains no PDF code and no API key: it tells VS Code where the hosted EasyPDF server is (`https://www.easypdf.fr/mcp`, streamable HTTP) and VS Code does the rest. The same server can be added by hand to a `mcp.json` file; the extension saves you that step and keeps the address up to date.

## Requirements

- VS Code 1.101 or later.
- A chat agent that can use MCP tools, such as GitHub Copilot Chat in agent mode. If your organization manages Copilot, MCP servers may be turned off or limited to an allow list by policy.
- An EasyPDF account. You sign in with Google the first time the server is used; the account is created for you and the free plan needs no payment.

## Install

In VS Code, open the Extensions view, search for **EasyPDF** and click **Install**.

Nothing else to configure. The server appears as **EasyPDF** in the list of MCP servers (Command Palette: **MCP: List Servers**).

## First use

1. Open the Chat view and switch to **Agent** mode.
2. Click **Configure Tools** in the chat input and check that the **EasyPDF** tools are enabled.
3. Ask for something that needs a PDF tool, for example "Compress report.pdf under 2 MB".
4. VS Code starts the EasyPDF server. Because the server requires an account, VS Code asks whether EasyPDF may sign in. Accept, and your browser opens the EasyPDF consent page, then Google sign-in. Google only shares your email address with EasyPDF. When the browser says you can return, go back to VS Code.
5. Copilot asks for your confirmation before each tool call, unless you choose to always allow it.

You can sign out or remove access later from the **Accounts** menu in VS Code.

### How your local files reach EasyPDF

EasyPDF runs on a server, so it cannot read files from your disk directly. Every tool takes a link to a PDF:

- If the PDF is already online, give the agent its public `https://` link.
- Otherwise the agent calls `get_upload_link`, which returns a private upload link valid for one hour (files up to 50 MB). An agent that can run terminal commands can upload the file itself with a multipart POST; if not, open the link, drop the PDF there and tell the agent when it is done.
- Results come back as download links valid for one hour. Ask the agent to save the result into your workspace if you want it next to the original.

## Tools

| Tool | What it does |
|---|---|
| `edit_pdf_text` | Replaces text in the original PDF (dates, amounts, names, typos) with the same font, size and position, and reports each replacement. |
| `get_upload_link` | Returns a one-hour upload link for a local PDF. |
| `compress_pdf` | Reduces the file size, optionally to fit a limit such as 2 MB. |
| `merge_pdfs` | Merges several PDFs in the given order. |
| `split_pdf` | Splits a PDF into files of N pages. |
| `extract_pages` | Keeps only the listed pages. |
| `rotate_pdf` | Rotates all or some pages by 90, 180 or 270 degrees. |
| `protect_pdf` | Adds a password (AES-256). |
| `unlock_pdf` | Removes a password you know. |
| `watermark_pdf` | Adds a text watermark such as DRAFT or CONFIDENTIAL. |
| `add_page_numbers` | Adds page numbers. |
| `convert_pdf_to_word` | Converts the PDF to an editable .docx file. |
| `convert_pdf_to_excel` | Extracts tables into an .xlsx file. |
| `convert_pdf_to_powerpoint` | Converts the PDF to a .pptx deck. |
| `translate_pdf` | Translates the document and returns a PDF with the layout kept. |
| `generate_pdf` | Creates a new PDF from a text description. |
| `chat_with_pdf` | Answers a question about a PDF, with references to the source. |

The server also offers three prompts: `fix_pdf_text`, `compress_pdf_under_limit` and `translate_pdf_document`.

The same features are available in the browser if you prefer to do it by hand, for example the <a href="https://www.easypdf.fr/tools/edit">PDF editor</a>, <a href="https://www.easypdf.fr/tools/compress">Compress PDF</a>, <a href="https://www.easypdf.fr/tools/convert/pdf-to-word">PDF to Word</a> and <a href="https://www.easypdf.fr/tools/translate">Translate PDF</a>.

## Example prompts

- "In invoice.pdf, change the due date 17/10/2026 to 31/10/2026 and keep the layout."
- "Fix the spelling mistakes in my resume directly in the PDF."
- "Replace "Example Ltd" with "Example Consulting Inc." everywhere in contract.pdf."
- "Compress docs/application.pdf under 2 MB and save the result next to it."
- "Merge cover.pdf, report.pdf and appendix.pdf in that order, then add page numbers."
- "Convert the tables in statement.pdf to an Excel file."
- "Translate manual.pdf into English and keep the layout."
- "Watermark draft.pdf with DRAFT and protect it with a password I will give you."

## Limits

- Your EasyPDF plan applies: the free plan covers a limited number of files per day, and when the limit is reached the tool says when it resets. Paid plans lift the limit, see <a href="https://www.easypdf.fr/pricing">pricing</a>.
- Uploads are limited to 50 MB per file. Upload and download links expire after one hour.
- Text editing works on PDFs that contain real text. For scanned pages the result depends on the scan quality.
- An internet connection is required; nothing runs locally.

## Privacy

- This extension collects no telemetry and stores no secret. Sign-in tokens are managed by VS Code.
- EasyPDF receives the files you send and the tool arguments, never the rest of your chat.
- Uploaded files are used for processing and deleted within one hour. Result files are available through their download link for one hour, then deleted.
- Text edits are applied without any AI model on the EasyPDF side: your agent decides what to change and EasyPDF writes exactly that. Translation, chat with PDF, PDF generation and Office conversions rely on third-party processors described in the privacy policy.

Read the full <a href="https://www.easypdf.fr/confidentialite">EasyPDF privacy policy</a>.

## Documentation and support

- Server documentation: <a href="https://www.easypdf.fr/mcp-docs">EasyPDF MCP documentation</a> (also opened by the command **EasyPDF: Open documentation**).
- Bugs and questions about the extension: [GitHub issues](https://github.com/Lorenzino69/easypdf-vscode/issues).
- Other clients (Claude, Claude Code, Cursor, ChatGPT): [easypdf-mcp](https://github.com/Lorenzino69/easypdf-mcp).

## Adding the server without the extension

If you prefer a configuration file, the extension is equivalent to this `.vscode/mcp.json`:

```json
{
  "servers": {
    "easypdf": { "type": "http", "url": "https://www.easypdf.fr/mcp" }
  }
}
```

Use one or the other, not both, or the server will be listed twice.

## License

The extension source code is released under the MIT license. The EasyPDF service is operated by LORENET SYSTEMS.
