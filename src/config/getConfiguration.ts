import * as vscode from 'vscode';

export function getConfiguration<T>(configProperty: string): T | undefined {
    const config = vscode.workspace.getConfiguration('pie-design-system-vscode-prototype');
	
    return config.get<T>(configProperty);
}