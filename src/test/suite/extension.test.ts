/**
 * Integration tests: run inside a real VS Code instance (@vscode/test-electron).
 */
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';
import { createServerDefinitions, SERVER_URL } from '../../extension';

const EXTENSION_ID = `${require('../../../package.json').publisher}.easypdf`;

suite('EasyPDF extension', () => {
	test('the MCP API is available in this VS Code build', () => {
		assert.equal(typeof vscode.lm.registerMcpServerDefinitionProvider, 'function');
		assert.equal(typeof vscode.McpHttpServerDefinition, 'function');
	});

	test('provider returns one real McpHttpServerDefinition with the EasyPDF URL', () => {
		const defs = createServerDefinitions('0.1.0');
		assert.equal(defs.length, 1);
		assert.ok(defs[0] instanceof vscode.McpHttpServerDefinition);
		assert.equal(defs[0].label, 'EasyPDF');
		assert.equal(defs[0].uri.toString(true), SERVER_URL);
		assert.equal(defs[0].uri.toString(true), 'https://www.easypdf.fr/mcp');
	});

	test('extension activates and registers its command', async () => {
		const ext = vscode.extensions.getExtension(EXTENSION_ID);
		assert.ok(ext, `extension ${EXTENSION_ID} not found`);
		await ext.activate();
		assert.ok(ext.isActive);
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('easypdf.openDocumentation'));
	});
});
