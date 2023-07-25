import * as vscode from 'vscode';
import * as path from 'path';
import { createCssVariableCompletionData } from './completion/createCssVariableCompletionData';
import { createAllCompletionItems } from './completion/createAllCompletionItems';
import { createTypeSpecificCompletions } from './completion/createTypeSpecificCompletions';
import { isCssColorProperty, isCssSpacingProperty } from './utils/cssPatterns';

export function activate(context: vscode.ExtensionContext): void {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders) {
		vscode.window.showInformationMessage('Could not locate pie design tokens in node_modules :(');
		return;
	}

	const currentWorkspacePath = workspaceFolders[0].uri.fsPath;
	const nodeModulesFilePath = path.join(currentWorkspacePath, 'node_modules', '@justeat', 'pie-design-tokens', 'dist', 'jet.css');

	vscode.workspace.openTextDocument(nodeModulesFilePath).then((document: vscode.TextDocument) => {
		vscode.window.setStatusBarMessage('PIE Design System - Located tokens in node_modules 😃', 5000);
		const data = document.getText();

		const cssVariableCompletions = createCssVariableCompletionData(data);
		const colorCssVariableCompletions = createTypeSpecificCompletions('color', cssVariableCompletions);
		const spacingCssVariableCompletions = createTypeSpecificCompletions('spacing', cssVariableCompletions);

		const provider: vscode.CompletionItemProvider = {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
				const lineText = document.lineAt(position).text;
				const trimmedLineText = lineText.trim();

				if (isCssColorProperty(trimmedLineText)) {
					return createAllCompletionItems(colorCssVariableCompletions);
				}

				if (isCssSpacingProperty(trimmedLineText)) {
					return createAllCompletionItems(spacingCssVariableCompletions);
				}

				return createAllCompletionItems(cssVariableCompletions);
			}
		};

		const disposable = vscode.languages.registerCompletionItemProvider(['css', 'scss'], provider);

		if (disposable) {
			context.subscriptions.push(disposable);
			setTimeout(() => {
				vscode.window.setStatusBarMessage('PIE Design System - Token snippets created 🎉', 5000);
			}, 500);
		} else {
			vscode.window.showErrorMessage('PIE Design System - Failed to create token snippets 😞');
		}
	});
}


export function deactivate(): void {}
