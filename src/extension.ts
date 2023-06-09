import * as vscode from 'vscode';
import * as path from 'path';

interface CssVariableCompletion {
    prefix: string;
    body: string;
    description: string;
}

/**
 * Gets a object containing the completion data for each design token CSS variable
 * @param cssVariableFileString the string contents of the CSS variable file to parse
 * @returns 
 */
function getCssVariablesCompletions(cssVariableFileString: string): Record<string, CssVariableCompletion> {
	const cssVariables: string[] = cssVariableFileString.match(/--dt-.*?:/g)?.map(variable => variable.replace(':', '')) || [];
	
	return cssVariables.reduce((accumulatedValues: Record<string, CssVariableCompletion>, variable: string) => {
		const prefix = `${variable.replace('--', '')}`;
		
		accumulatedValues[variable] = {
			prefix,
			body: `var(${variable})`,
			description: `Some neat description for \`${variable}\` goes here! \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global#${prefix})`,
		};

		return accumulatedValues;
	}, {}) || {};
}

/**
 * Creates a vscode.CompletionList from the provided cssVariablesObject
 * @param cssVariablesObject 
 * @returns 
 */
function createCompletionItems(cssVariablesObject: Record<string, CssVariableCompletion>): vscode.CompletionList {
	const completionItems = new vscode.CompletionList();

	for (const key in cssVariablesObject) {
		const completionItem = new vscode.CompletionItem(cssVariablesObject[key].prefix);
		completionItem.insertText = cssVariablesObject[key].body;
		const docs = new vscode.MarkdownString();
		docs.appendMarkdown(cssVariablesObject[key].description);
		completionItem.documentation = docs;
		completionItem.label = `${cssVariablesObject[key].prefix.replace('dt-', '')} - PIE Design Token`;
		completionItem.kind = cssVariablesObject[key].prefix.includes('color') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable;
		completionItems.items.push(completionItem);
	}

	return completionItems;
}

export function activate(context: vscode.ExtensionContext): void {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders) {
		vscode.window.showInformationMessage('Could not locate pie design tokens in node_modules :(');
		
		return;
	}

	const currentWorkspacePath = workspaceFolders[0].uri.fsPath;
	const nodeModulesFilePath = path.join(currentWorkspacePath, 'node_modules', '@justeat', 'pie-design-tokens', 'dist', 'jet.css');

	vscode.workspace.openTextDocument(nodeModulesFilePath).then((document: vscode.TextDocument) => {
		vscode.window.showInformationMessage('Located pie design tokens in node_modules :)');
		const data = document.getText();
		const cssVariableCompletions = getCssVariablesCompletions(data);

		const provider: vscode.CompletionItemProvider = {
			provideCompletionItems(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
				return createCompletionItems(cssVariableCompletions);
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

export function deactivate(): void {}
