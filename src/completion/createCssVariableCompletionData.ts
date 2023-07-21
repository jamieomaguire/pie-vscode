import * as vscode from 'vscode';
import { CssVariableCompletionGroup, CssVariableTokenCompletions, TokenTypes } from '../types';

export function createCssVariableCompletionData(cssString: string): CssVariableTokenCompletions {
    const global: { [tokenType: string]: CssVariableCompletionGroup } = {};
    const alias: { [tokenType: string]: CssVariableCompletionGroup } = {};
    const globalTokenMessage = '**Warning** - Try to use Alias tokens instead of Globals.';

    let currentGroup: { [tokenType: string]: CssVariableCompletionGroup } | null = null;
    let isGlobal = false;
    const lines = cssString.split('\n');

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('/* Global tokens')) {
            currentGroup = global;
            isGlobal = true;

        } else if (line.startsWith('/* Alias tokens')) {
            currentGroup = alias;
            isGlobal = false;
        } else if (line.startsWith('--')) {
            const [variableName, variableValue] = line.split(':');

            if (currentGroup) {
                const prefix = `${variableName.replace('--', '')}`;
                const tokenType = prefix.split('-')[1] as TokenTypes;

                if (!currentGroup[tokenType]) {
                    currentGroup[tokenType] = {};
                }

                let detail : string | undefined;

                if (isGlobal) {
                    // Read the value directly
                    detail = variableValue.replace(/;/, '').trim();
                } else {
                    /**
                     * For alias tokens that rely on a global token,
                     * e.g., `--dt-color-interactive-brand: var(--dt-color-orange);`
                     * we need to fetch the underlying value for that global token
                     */
                    const doesTokenContainVariableRegex = new RegExp(/var\((.*?)\)/);
                    // The regex uses a capturing group to extract the name of the global token
                    const globalTokenName = doesTokenContainVariableRegex.exec(variableValue)?.[1];

                    if (globalTokenName) {
                        // Fetch the value of the global token
                        // This assumes a global token was defined before being referenced by an alias token
                        detail = global[tokenType]?.[globalTokenName]?.detail;
                    }
                }

                currentGroup[tokenType][variableName] = {
                    body: `var(${variableName})`,
                    description: `Some neat description for \`${variableName}\` goes here! \n\n ${isGlobal ? globalTokenMessage : ''} \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global#${prefix})`,
                    detail,
                    kind: tokenType === 'color'
                        ? vscode.CompletionItemKind.Color
                        : vscode.CompletionItemKind.Variable,
                    label: `${prefix.replace('dt-', '')} - PIE Design Token ${isGlobal ? '(Global)' : '(Alias)'}`,
                    prefix,
				};
            }
        }
    }

    return { global, alias };
}