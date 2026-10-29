import * as vscode from 'vscode';

/** Must match `contributes.mcpServerDefinitionProviders[0].id` in package.json. */
export const PROVIDER_ID = 'easypdf';

/**
 * Remote MCP endpoint (streamable HTTP, OAuth 2.1 with dynamic client
 * registration). No trailing slash on purpose: VS Code checks that the
 * `resource` of the server's protected resource metadata (RFC 9728) equals
 * this URL, and the server advertises `https://www.easypdf.fr/mcp`.
 */
export const SERVER_URL = 'https://www.easypdf.fr/mcp';

export const DOCS_URL = 'https://www.easypdf.fr/mcp-docs';

export const SERVER_LABEL = 'EasyPDF';

/**
 * The single server this extension contributes. `version` is the extension
 * version, so VS Code refreshes its cached tool list after an update.
 */
export function createServerDefinitions(version?: string): vscode.McpHttpServerDefinition[] {
	return [new vscode.McpHttpServerDefinition(SERVER_LABEL, vscode.Uri.parse(SERVER_URL), {}, version)];
}

export function activate(context: vscode.ExtensionContext): void {
	const version: string | undefined = context.extension.packageJSON?.version;

	context.subscriptions.push(
		vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, {
			provideMcpServerDefinitions: () => createServerDefinitions(version),
			// Nothing to resolve: sign-in is handled by VS Code through the
			// server's OAuth metadata when the server asks for it.
			resolveMcpServerDefinition: (server) => server,
		}),
		vscode.commands.registerCommand('easypdf.openDocumentation', () =>
			vscode.env.openExternal(vscode.Uri.parse(DOCS_URL)),
		),
	);
}

export function deactivate(): void {
	// Disposables registered in activate() are released by VS Code.
}
