import * as vscode from 'vscode';
import { CssVariableCompletionGroup, CssVariableTokenCompletions, TokenTypes } from '../types';

const getTokenDetail = (tokenValue: string, isColor: boolean) : string | undefined => {
    if (isColor) {
        return tokenValue.replace(/;/, '').trim();
    }
    return undefined;
};

export function createCssVariableCompletionData(cssString: string): CssVariableTokenCompletions {
    const global: { [tokenType: string]: CssVariableCompletionGroup } = {};
    const alias: { [tokenType: string]: CssVariableCompletionGroup } = {};
    const globalTokenMessage = '**Warning** - Try to use Alias tokens instead of Globals.';

    let currentGroup: { [tokenType: string]: CssVariableCompletionGroup } | null = null;
    const lines = cssString.split('\n');

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('/* Global tokens')) {
            currentGroup = global;
        } else if (line.startsWith('/* Alias tokens')) {
            currentGroup = alias;
        } else if (line.startsWith('--')) {
            const [variableName, variableValue] = line.split(':');

            if (currentGroup) {
				const prefix = `${variableName.replace('--', '')}`;
                const tokenType = prefix.split('-')[1] as TokenTypes;

                if (!currentGroup[tokenType]) {
                    currentGroup[tokenType] = {};
                }

                const isColor = tokenType === 'color';

                currentGroup[tokenType][variableName] = {
					body: `var(${variableName})`,
					description: `Some neat description for \`${variableName}\` goes here! \n\n ${currentGroup === global ? globalTokenMessage : ''} \n\n [pie.design reference](https://pie.design/foundations/colour/tokens/global#${prefix})`,
                    detail: currentGroup === global ? getTokenDetail(variableValue, isColor) : undefined,
					kind: isColor ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Variable,
                    label: `${prefix.replace('dt-', '')} - PIE Design Token ${currentGroup === global ? '(Global)' : '(Alias)'}`,
					prefix,
				};
            }
        }
    }

    return { global, alias };
}