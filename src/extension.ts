import { workspace, ExtensionContext, window } from 'vscode';
import { execFileSync } from 'child_process';

import {
	Executable,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(_context: ExtensionContext) {
	const enabled = workspace.getConfiguration("device-driver").get("language-server-enabled") as boolean;

	if (!enabled) {
		return;
	}

	const command = workspace.getConfiguration("device-driver").get("language-server-binary") as string;

	checkCommand(command);

	const run: Executable = {
		command,
		args: ["lsp"],
		options: {
			env: {
				...process.env,
			},
		},
	};

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run,
		debug: run,
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'ddsl' }],
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'device-driver-language-server',
		'device-driver language server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

function checkCommand(command: string): boolean {
	try {
		execFileSync(command, ['lsp', '--help'], { timeout: 3000 });
		return true;
	} catch (error: any) {
		if (typeof error.code === "string") {
			// Some system error happened. The file/command probably doesn't exist
			window.showErrorMessage(
				`LSP Initialization Failed: '${command}' not found. Is it installed? Is the path correct?`,
			);
		} else {
			// Clap returned an error code, so the lsp arg likely isn't included
			window.showErrorMessage(
				`LSP Initialization Failed: Your ddc binary likely doesn't support the lsp command. Update or reinstall it with lsp support enabled`
			);
		}
		return false;
	}
}