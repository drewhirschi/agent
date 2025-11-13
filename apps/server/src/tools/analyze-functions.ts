import { join } from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';

/**
 * Resolve a path relative to workspace root
 */
function resolvePath(userPath: string): string {
  const cleanPath = userPath.startsWith('/') ? userPath.slice(1) : userPath;
  return join(WORKSPACE_ROOT, cleanPath);
}

interface FunctionInfo {
  name: string;
  description?: string;
  parameters: {
    name: string;
    type: string;
    description?: string;
    optional: boolean;
  }[];
  returnType: string;
  isExported: boolean;
  isAsync: boolean;
  documentation?: string;
  signature: string;
}

export async function analyzeFunctionsTool(params: { path: string }) {
  try {
    const actualPath = resolvePath(params.path);

    // Create a ts-morph project
    const project = new Project({
      compilerOptions: {
        target: 99, // ESNext
      },
    });

    // Add the source file
    const sourceFile = project.addSourceFileAtPath(actualPath);

    const functions: FunctionInfo[] = [];

    // Extract function declarations
    sourceFile.getFunctions().forEach((func) => {
      const info = extractFunctionInfo(func);
      if (info) functions.push(info);
    });

    // Extract exported arrow functions and function expressions
    sourceFile.getVariableDeclarations().forEach((varDecl) => {
      const initializer = varDecl.getInitializer();
      if (
        initializer &&
        (initializer.getKind() === SyntaxKind.ArrowFunction ||
          initializer.getKind() === SyntaxKind.FunctionExpression)
      ) {
        const isExported = varDecl.getVariableStatement()?.hasExportKeyword();
        const name = varDecl.getName();
        const type = varDecl.getType();

        // Get JSDoc
        const jsDocs = varDecl.getVariableStatement()?.getJsDocs() || [];
        const description = jsDocs
          .map((doc) => doc.getDescription().trim())
          .filter(Boolean)
          .join('\n');

        // Extract parameters and return type from the function type
        const callSignatures = type.getCallSignatures();
        const signature = callSignatures[0];

        const parameters = signature
          ? signature.getParameters().map((param) => {
              const paramDecl = param.getValueDeclaration();
              const paramName = param.getName();
              const paramType = param.getTypeAtLocation(sourceFile).getText();
              const isOptional = paramDecl?.getType().isNullable() || false;

              // Try to get parameter description from JSDoc
              const paramTag = jsDocs
                .flatMap((doc) => doc.getTags())
                .find(
                  (tag) =>
                    tag.getTagName() === 'param' &&
                    tag.getText().includes(paramName)
                );

              const comment = paramTag?.getComment();
              const commentStr =
                typeof comment === 'string'
                  ? comment
                  : Array.isArray(comment)
                  ? comment.map((c: any) => c?.text || '').join('')
                  : undefined;

              return {
                name: paramName,
                type: paramType,
                optional: isOptional,
                description: commentStr,
              };
            })
          : [];

        const returnType = signature
          ? signature.getReturnType().getText()
          : 'unknown';

        functions.push({
          name,
          description,
          parameters,
          returnType,
          isExported: isExported || false,
          isAsync:
            initializer.getKind() === SyntaxKind.ArrowFunction &&
            (initializer as any).isAsync?.() === true,
          documentation: description,
          signature: `${isExported ? 'export ' : ''}${varDecl
            .getVariableStatement()
            ?.getDeclarationKind()} ${name}: (${parameters
            .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
            .join(', ')}) => ${returnType}`,
        });
      }
    });

    return {
      path: params.path,
      absolutePath: actualPath,
      functions,
      count: functions.length,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to analyze file',
      functions: [],
      count: 0,
    };
  }
}

function extractFunctionInfo(func: any): FunctionInfo | null {
  const name = func.getName();
  if (!name) return null;

  // Get JSDoc comments
  const jsDocs = func.getJsDocs();
  const description = jsDocs
    .map((doc: any) => doc.getDescription().trim())
    .filter(Boolean)
    .join('\n');

  // Get parameters with JSDoc descriptions
  const parameters = func.getParameters().map((param: any) => {
    const paramName = param.getName();
    const paramType = param.getType().getText();
    const isOptional = param.isOptional();

    // Find @param tag for this parameter
    const paramTag = jsDocs
      .flatMap((doc: any) => doc.getTags())
      .find(
        (tag: any) =>
          tag.getTagName() === 'param' && tag.getText().includes(paramName)
      );

    const comment = paramTag?.getComment();
    const commentStr =
      typeof comment === 'string'
        ? comment
        : Array.isArray(comment)
        ? comment.map((c: any) => c?.text || '').join('')
        : undefined;

    return {
      name: paramName,
      type: paramType,
      optional: isOptional,
      description: commentStr,
    };
  });

  const returnType = func.getReturnType().getText();
  const isExported = func.hasExportKeyword();
  const isAsync = func.isAsync();

  // Build function signature
  const signature = `${isExported ? 'export ' : ''}${
    isAsync ? 'async ' : ''
  }function ${name}(${parameters
    .map((p: any) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
    .join(', ')}): ${returnType}`;

  return {
    name,
    description,
    parameters,
    returnType,
    isExported,
    isAsync,
    documentation: description,
    signature,
  };
}

