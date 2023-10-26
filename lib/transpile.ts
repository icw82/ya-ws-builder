import { default as ts } from 'typescript';


const transpile = (source: string) => {
    const result = ts.transpileModule(
        source,
        {
            compilerOptions: {
                // alwaysStrict: true,
                importHelpers: true,
                isolatedModules: true,
                lib: [
                    'es2015',
                    'es2016',
                    'es2017',
                    'dom',
                ],

                // Пока морда стенда крутится на старых нодах типа 12 версии,
                // красота типа ?. ?? не будет работать
                target: ts.ScriptTarget.ES2020,

                module: ts.ModuleKind.AMD,

                moduleResolution: ts.ModuleResolutionKind.Classic, // node?

                jsx: ts.JsxEmit.ReactJSXDev,

                // noUnusedLocals: true,
                // noImplicitReturns: true,
                // noUnusedParameters: false,
                // forceConsistentCasingInFileNames: true,

                // paths: {
                //     'Core/*': ['WS.Core/core/*'],
                //     'Lib/*': ['WS.Core/lib/*'],
                //     'Transport/*': ['WS.Core/transport/*'],
                // },
            }
        }
    );

    if (result.diagnostics) {
        console.log('!!!', result.diagnostics);
    }

    return result.outputText;
}


export {
    transpile,
}
