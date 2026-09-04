import { workspace, ExtensionContext, window } from 'vscode';

import {
	Executable,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(_context: ExtensionContext) {
	const command = workspace.getConfiguration("device-driver-language-server").get("language-server-binary") as string;

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
		documentSelector: [{ scheme: 'file', language: 'DDSL' }],
		traceOutputChannel: window.createOutputChannel("Device-driver LSP Trace"),
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
