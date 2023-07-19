import * as vscode from 'vscode';

export type CssVariableCompletion = {
	prefix: string;
	body: string;
	description: string;
	detail?: string;
	label: string;
	kind: vscode.CompletionItemKind;
};

export type CssVariableCompletionGroup = { [variable: string]: CssVariableCompletion };

export type CssVariableTokenCompletions = {
	global: { [tokenType: string]: CssVariableCompletionGroup },
	alias: { [tokenType: string]: CssVariableCompletionGroup }
};

export type TokenTypes = 'color' | 'spacing' | 'radius' | 'elevation' | 'font';