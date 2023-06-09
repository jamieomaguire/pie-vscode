export function isCssColorProperty(cssLine: string): boolean {
    return /color|background/.test(cssLine);
};


export function isCssSpacingProperty(cssLine: string): boolean {
    return /padding|margin|top|right|bottom|left|inset|inline|block|width|height/.test(cssLine);
};