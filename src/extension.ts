// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pie-vscode" is now active!');

	let workspaceFolders = vscode.workspace.workspaceFolders;

	let cssProvider = null;
	let scssProvider = null;

	if (!workspaceFolders) {
		vscode.window.showInformationMessage('No folders open!');
	} else {
		vscode.window.showInformationMessage('Found a folder');
		console.log(workspaceFolders[0].uri.fsPath);
		const currentWorkspacePath = workspaceFolders[0].uri.fsPath;
		const nodeModulesFilePath = path.join(currentWorkspacePath, 'node_modules', '@justeat', 'pie-design-tokens', 'dist', 'jet.css');

		// read file from path using vscode
		vscode.workspace.openTextDocument(nodeModulesFilePath).then((document) => {
			// console.log(document.getText());
			const data = document.getText();
			const cssVariables = data.match(/--dt-.*?:/g)?.map((variable: string) => variable.replace(':', ''));
			const cssVariablesObject = cssVariables?.reduce((acc: { [key: string]: any }, variable: string) => {
				acc[variable] = {
					prefix: [`${variable.replace('--', '')}`, 'design', 'token', 'pie'],
					body: `var(${variable})`,
					description: `{{ token description here}} \n See more at: https://pie.design/foundations/colour#${variable.replace('--', '')}.`,
				};
				return acc;
			}, {}) || {};

			
			cssProvider = vscode.languages.registerCompletionItemProvider('css', {
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
					const completionItems = new vscode.CompletionList();
					Object.keys(cssVariablesObject).forEach((key) => {
						const completionItem = new vscode.CompletionItem(cssVariablesObject?.[key].prefix[0]);
						completionItem.insertText = cssVariablesObject?.[key].body;
						completionItem.documentation = cssVariablesObject?.[key].description;
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
						completionItem.documentation = cssVariablesObject?.[key].description;
						completionItems.items.push(completionItem);
					});
					return completionItems;
				}
			});
		});

	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('pie-vscode.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from pie-vscode!');
	// });

	// context.subscriptions.push(disposable);
	if (cssProvider && scssProvider) {
		context.subscriptions.push(cssProvider, scssProvider);
	} else {
			vscode.window.showInformationMessage('Failed to create autocomplete snippets :(');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
