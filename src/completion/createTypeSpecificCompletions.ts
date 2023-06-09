import { CssVariableTokenCompletions, TokenTypes } from "../types";

export function createTypeSpecificCompletions(
    type: TokenTypes, 
    completions: CssVariableTokenCompletions
    ): CssVariableTokenCompletions {
    return {
        global: { [type]: completions.global[type] },
        alias: { [type]: completions.alias[type] }
    };
}