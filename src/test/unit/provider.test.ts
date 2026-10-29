/**
 * Unit tests that run in plain Node (no VS Code download): the `vscode`
 * module is replaced by a minimal stub before the extension is loaded.
 */
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import Module = require('node:module');

class StubUri {
	constructor(private readonly value: string) {}
	static parse(value: string): StubUri {
		return new StubUri(new URL(value).toString());
	}
	toString(): string {
		return this.value;
	}
}

class StubMcpHttpServerDefinition {
	constructor(
		public readonly label: string,
		public readonly uri: StubUri,
		public readonly headers: Record<string, string> = {},
		public readonly version?: string,
	) {}
}

const registered: { providers: Array<{ id: string; provider: any }>; commands: Map<string, () => unknown> } = {
	providers: [],
	commands: new Map(),
};

const vscodeStub = {
	Uri: StubUri,
	McpHttpServerDefinition: StubMcpHttpServerDefinition,
	lm: {
		registerMcpServerDefinitionProvider(id: string, provider: unknown) {
			registered.providers.push({ id, provider });
			return { dispose() {} };
		},
	},
	commands: {
		registerCommand(id: string, fn: () => unknown) {
			registered.commands.set(id, fn);
			return { dispose() {} };
		},
	},
	env: { openExternal: async () => true },
};

const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, ...rest: unknown[]) {
	if (request === 'vscode') {
		return vscodeStub;
	}
	return originalLoad.call(this, request, ...rest);
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ext = require('../../extension') as typeof import('../../extension');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'package.json'), 'utf8'));

test('createServerDefinitions returns exactly one HTTP server with the EasyPDF URL', () => {
	const defs = ext.createServerDefinitions('0.1.0');
	assert.equal(defs.length, 1);
	const def = defs[0] as unknown as StubMcpHttpServerDefinition;
	assert.ok(def instanceof StubMcpHttpServerDefinition, 'expected an McpHttpServerDefinition');
	assert.equal(def.label, 'EasyPDF');
	assert.equal(def.uri.toString(), 'https://www.easypdf.fr/mcp');
	assert.deepEqual(def.headers, {}, 'no secret or header is sent by the extension');
	assert.equal(def.version, '0.1.0');
});

test('server URL matches the resource advertised by the server (no trailing slash)', () => {
	assert.equal(ext.SERVER_URL, 'https://www.easypdf.fr/mcp');
	assert.ok(!ext.SERVER_URL.endsWith('/'));
});

test('activate registers the provider declared in package.json and the docs command', async () => {
	const subscriptions: Array<{ dispose(): void }> = [];
	ext.activate({ subscriptions, extension: { packageJSON: packageJson } } as any);

	const declared = packageJson.contributes.mcpServerDefinitionProviders.map((p: { id: string }) => p.id);
	assert.deepEqual(declared, [ext.PROVIDER_ID]);
	assert.equal(registered.providers.length, 1);
	assert.equal(registered.providers[0].id, ext.PROVIDER_ID);

	const provided = await registered.providers[0].provider.provideMcpServerDefinitions();
	assert.equal(provided.length, 1);
	assert.equal(provided[0].uri.toString(), 'https://www.easypdf.fr/mcp');
	assert.equal(provided[0].version, packageJson.version);

	const resolved = await registered.providers[0].provider.resolveMcpServerDefinition(provided[0]);
	assert.equal(resolved, provided[0], 'resolve must not block or alter the server');

	const declaredCommands = packageJson.contributes.commands.map((c: { command: string }) => c.command);
	assert.deepEqual([...registered.commands.keys()], declaredCommands);
	assert.equal(subscriptions.length, 2);
});
