// src/lib/minifyUtils.ts

// Utility function to detect if code is likely TypeScript/TSX
export function isTypeScriptCode(code: string): boolean {
  const typeAnnotationRegex = /:\s*(?:string|number|boolean|any|null|undefined|Array|Promise|React\.FC|JSX\.Element|\w+\[\]|<.*?>)/;
  const interfaceOrTypeRegex = /(interface|type)\s+\w+\s*\{/;
  const enumRegex = /enum\s+\w+\s*\{/;
  const jsxRegex = /<\w+\s*(\s+\w+=".*?")*\s*\/?\s*>/;

  return (
    typeAnnotationRegex.test(code) ||
    interfaceOrTypeRegex.test(code) ||
    enumRegex.test(code) ||
    jsxRegex.test(code)
  );
}