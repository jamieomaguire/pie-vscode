import * as vscode from 'vscode';
import { getConfiguration } from '../config/getConfiguration';
import { CssVariableTokenCompletions } from '../types';
import { createAllCompletionItemsForGroup } from './createAllCompletionItemsForGroup';

/**
* Creates a vscode.CompletionList from the provided cssVariableCompletions
* @param cssVariableCompletions 
* @returns 
*/
export function createAllCompletionItems(cssVariableCompletions: CssVariableTokenCompletions): vscode.CompletionList {
    const completionItems = new vscode.CompletionList();
    const provideGlobalTokenCompletions = getConfiguration<boolean>('provideGlobalTokenCompletions');

    let globalTokenCompletions = new vscode.CompletionList();

    // By default we will not provide global token completions as they should be discouraged
    if (provideGlobalTokenCompletions) {
        for (const tokenType in cssVariableCompletions.global) {
            const tokenTypeCompletions = createAllCompletionItemsForGroup(cssVariableCompletions.global[tokenType]);
            globalTokenCompletions.items.push(...tokenTypeCompletions.items);
        }
    }

    for (const tokenType in cssVariableCompletions.alias) {
        const tokenTypeCompletions = createAllCompletionItemsForGroup(cssVariableCompletions.alias[tokenType]);
        completionItems.items.push(...tokenTypeCompletions.items);
    }

    completionItems.items.push(...globalTokenCompletions.items);

    return completionItems;
}