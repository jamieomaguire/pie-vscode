// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders) {
		vscode.window.showInformationMessage('Could not locate pie design tokens in node_modules :(');
	} else {
		vscode.window.showInformationMessage('Located pie design tokens in node_modules :)');

		const currentWorkspacePath = workspaceFolders[0].uri.fsPath;
		const nodeModulesFilePath = path.join(currentWorkspacePath, 'node_modules', '@justeat', 'pie-design-tokens', 'dist', 'jet.css');

		// retrieve the design tokens css file from the current workspace's node_modules folder
		vscode.workspace.openTextDocument(nodeModulesFilePath).then((document) => {
			const data = document.getText();
			const cssVariables = data.match(/--dt-.*?:/g)?.map((variable: string) => variable.replace(':', ''));
			// todo: this is old code and can be refactored and moved to the provider below
			const cssVariablesObject = cssVariables?.reduce((acc: { [key: string]: any }, variable: string) => {
				acc[variable] = {
					prefix: `${variable.replace('--', '')}`,
					body: `var(${variable})`,
					description: `Some neat description for \`${variable}\` goes here! \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global/#${variable.replace('--', '')})`,
				};
				return acc;
			}, {}) || {};

			const provider = {
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
					const completionItems = new vscode.CompletionList();
					// todo: can we split global and alias tokens and adjust label accordingly?
					Object.keys(cssVariablesObject).forEach((key) => {
						const completionItem = new vscode.CompletionItem(cssVariablesObject?.[key].prefix);
						completionItem.insertText = cssVariablesObject?.[key].body;
						const docs = new vscode.MarkdownString();
						docs.appendMarkdown(cssVariablesObject?.[key].description);
						completionItem.documentation = docs;
						completionItem.label = `${cssVariablesObject?.[key].prefix.replace('dt-', '')} - PIE Design Token`;
						completionItem.kind = cssVariablesObject?.[key].prefix.includes('color') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable;

						completionItems.items.push(completionItem);
					});
					return completionItems;
				}
			};
			
			const disposable = vscode.languages.registerCompletionItemProvider(['css', 'scss'], provider);

			if (disposable) {
				context.subscriptions.push(disposable);
				vscode.window.showInformationMessage('Created pie design token snippets :D');
			} else {
				vscode.window.showInformationMessage('Failed to create pie design token snippets :(');
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
