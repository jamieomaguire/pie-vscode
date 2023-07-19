import * as vscode from 'vscode';
import { CssVariableCompletionGroup } from '../types';

/**
 * Creates a vscode.CompletionList from the provided group of cssVariableCompletions
 * @param group
 * @returns
 */
export function createAllCompletionItemsForGroup(group: CssVariableCompletionGroup): vscode.CompletionList {
	const completionItems = new vscode.CompletionList();

	for (const variable in group) {
		const { prefix, label, body, description, kind, detail } = group[variable];
		const completionItem = new vscode.CompletionItem(prefix, kind);
		completionItem.insertText = new vscode.SnippetString(body);
		completionItem.detail = detail;
		const docs = new vscode.MarkdownString();
		docs.appendMarkdown(description);
		completionItem.documentation = docs;
		completionItem.label = label;
		completionItems.items.push(completionItem);
	}

	return completionItems;
}