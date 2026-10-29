import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
	const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
	const extensionTestsPath = path.resolve(__dirname, 'suite', 'index');

	await runTests({
		// Set VSCODE_TEST_VERSION to pin a build, e.g. 1.101.0 (the minimum).
		version: process.env.VSCODE_TEST_VERSION || 'stable',
		// On Windows, VS Code fails to load its workbench when its install path
		// exceeds 260 characters: point VSCODE_TEST_CACHE to a short folder.
		...(process.env.VSCODE_TEST_CACHE ? { cachePath: process.env.VSCODE_TEST_CACHE } : {}),
		extensionDevelopmentPath,
		extensionTestsPath,
		launchArgs: ['--disable-extensions', '--disable-gpu', '--skip-welcome', '--skip-release-notes'],
	});
}

main().catch((err) => {
	console.error('Integration tests failed:', err);
	process.exit(1);
});
