import * as vscode from 'vscode';
import * as path from 'path';

type CssVariableCompletion = {
	prefix: string;
	body: string;
	description: string;
	label: string;
	kind: vscode.CompletionItemKind;
};

type CssVariableCompletionGroup = { [variable: string]: CssVariableCompletion };

type CssVariableTokenCompletions = { 
	global: CssVariableCompletionGroup, 
	alias: CssVariableCompletionGroup 
};

/**
 * Creates an object containing completion data for all CSS variables in the provided cssString
 * Group by Global and Alias tokens
 * @param cssString 
 * @returns 
 */
function createCssVariableCompletionData(cssString: string): CssVariableTokenCompletions {
    const global: CssVariableCompletionGroup = {};
    const alias: CssVariableCompletionGroup = {};
    const globalTokenMessage = '**Warning** - Try to use Alias tokens instead of Globals.';
    
    let currentGroup: CssVariableCompletionGroup | null = null;
    const lines = cssString.split('\n');
    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('/* Global tokens')) {
            currentGroup = global;
        } else if (line.startsWith('/* Alias tokens')) {
            currentGroup = alias;
        } else if (line.startsWith('--')) {
            const variableName = line.split(':')[0];
            if (currentGroup) {
				const prefix = `${variableName.replace('--', '')}`;

                currentGroup[variableName] = {
					prefix,
					body: `var(${variableName})`,
					description: `Some neat description for \`${variableName}\` goes here! \n\n ${currentGroup === global ? globalTokenMessage : ''} \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global#${prefix})`,
                    label: `${prefix.replace('dt-', '')} - PIE Design Token ${currentGroup === global ? '(Global)' : '(Alias)'}`,
					kind: prefix.includes('color') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable
				};
            }
        }
    }

    return { global, alias };
}

/**
 * Creates a vscode.CompletionList from the provided cssVariableCompletions
 * @param cssVariableCompletions 
 * @returns 
 */
function createAllCompletionItems(cssVariableCompletions: CssVariableTokenCompletions): vscode.CompletionList {
	const completionItems = new vscode.CompletionList();
	const config = vscode.workspace.getConfiguration('pie-design-system-vscode');
	const provideGlobalTokenCompletions = config.get('provideGlobalTokenCompletions');
	
	let globalTokenCompletions = new vscode.CompletionList();

	// By default we will not provide global token completions as they should be discouraged
	if (provideGlobalTokenCompletions) {
		globalTokenCompletions = createACompletionItemsForGroup(cssVariableCompletions.global);
	}

	const aliasTokenCompletions = createACompletionItemsForGroup(cssVariableCompletions.alias);
	completionItems.items.push(...globalTokenCompletions.items, ...aliasTokenCompletions.items);
	
	return completionItems;
}

/**
 * Creates a vscode.CompletionList from the provided group of cssVariableCompletions
 * @param group 
 * @returns 
 */
function createACompletionItemsForGroup(group: CssVariableCompletionGroup): vscode.CompletionList {
	const completionItems = new vscode.CompletionList();

	for (const key in group) {
		const { prefix, label, body, description } = group[key];
		const completionItem = new vscode.CompletionItem(prefix);
		completionItem.insertText = body;
		const docs = new vscode.MarkdownString();
		docs.appendMarkdown(description);
		completionItem.documentation = docs;
		completionItem.label = label;
		completionItem.kind = prefix.includes('color') ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable;
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
		const cssVariableCompletions = createCssVariableCompletionData(data);
		// yup this is horrendous - it's just temporary to prove out the idea
		// of only showing color tokens on 'color' css properties
		const colorCssVariableCompletions = {
			global: Object.keys(cssVariableCompletions.global).reduce((acc, key) => {
				if (key.includes('color')) {
					acc[key] = cssVariableCompletions.global[key];
				}

				return acc;
			}, {} as CssVariableCompletionGroup),
			alias: Object.keys(cssVariableCompletions.alias).reduce((acc, key) => {
				if (key.includes('color')) {
					acc[key] = cssVariableCompletions.alias[key];
				}

				return acc;
			}, {} as CssVariableCompletionGroup)
		};


		const provider: vscode.CompletionItemProvider = {
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
				const lineText = document.lineAt(position).text;
				const trimmedLineText = lineText.trim();

				// only provide color tokens when the rule contains the word 'color'
				if (/color/.test(trimmedLineText)) {
					return createAllCompletionItems(colorCssVariableCompletions);
				}

				return createAllCompletionItems(cssVariableCompletions);
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


