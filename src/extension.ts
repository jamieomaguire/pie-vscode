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

		let cssProvider = null;
		let scssProvider = null;

		// read file from path using vscode
		vscode.workspace.openTextDocument(nodeModulesFilePath).then((document) => {
			// console.log(document.getText());
			const data = document.getText();
			const cssVariables = data.match(/--dt-.*?:/g)?.map((variable: string) => variable.replace(':', ''));
			const cssVariablesObject = cssVariables?.reduce((acc: { [key: string]: any }, variable: string) => {
				acc[variable] = {
					prefix: [`${variable.replace('--', '')}`, 'design', 'token', 'pie'],
					body: `var(${variable})`,
					description: `Some neat description for \`${variable}\` goes here! \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global/#${variable.replace('--', '')})`,
				};
				return acc;
			}, {}) || {};

			
			cssProvider = vscode.languages.registerCompletionItemProvider('css', {
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
					const completionItems = new vscode.CompletionList();
					Object.keys(cssVariablesObject).forEach((key) => {
						const completionItem = new vscode.CompletionItem(cssVariablesObject?.[key].prefix[0]);
						completionItem.insertText = cssVariablesObject?.[key].body;
						// completionItem.documentation = cssVariablesObject?.[key].description;
						const docs = new vscode.MarkdownString();
						docs.appendMarkdown(cssVariablesObject?.[key].description);
						completionItem.documentation = docs;
						completionItems.items.push(completionItem);
					});
					return completionItems;
				}
			});

			// todo: prevent duplication between css and scss
			scssProvider = vscode.languages.registerCompletionItemProvider('scss', {
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
					const completionItems = new vscode.CompletionList();
					Object.keys(cssVariablesObject).forEach((key) => {
						const completionItem = new vscode.CompletionItem(cssVariablesObject?.[key].prefix[0]);
						completionItem.insertText = cssVariablesObject?.[key].body;
						// completionItem.documentation = cssVariablesObject?.[key].description;
						const docs = new vscode.MarkdownString();
						docs.appendMarkdown(cssVariablesObject?.[key].description);
						completionItem.documentation = docs;
						completionItems.items.push(completionItem);
					});
					return completionItems;
				}
			});

			if (cssProvider && scssProvider) {
				context.subscriptions.push(cssProvider, scssProvider);
				vscode.window.showInformationMessage('Created pie design token snippets :D');
			} else {
				vscode.window.showInformationMessage('Failed to create pie design token snippets :(');
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
