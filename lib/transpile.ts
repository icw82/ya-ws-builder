import { CompilerOptions, default as ts } from 'typescript';

const {
    ModuleKind,
    ModuleResolutionKind,
    ScriptTarget,
    transpileModule,
} = ts;

interface ITranspileOptions {
    jsx?: CompilerOptions['jsx']
}


const transpile = (
    source: string,
    options?: ITranspileOptions
): string => {
    const compilerOptions: CompilerOptions = {
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
        target: ScriptTarget.ES2020,

        module: ModuleKind.AMD,

        moduleResolution: ModuleResolutionKind.Classic, // node?
        // noUnusedLocals: true,
        // noImplicitReturns: true,
        // noUnusedParameters: false,
        // forceConsistentCasingInFileNames: true,

        // paths: {
        //     'Core/*': ['WS.Core/core/*'],
        //     'Lib/*': ['WS.Core/lib/*'],
        //     'Transport/*': ['WS.Core/transport/*'],
        // },
    };

    if (options?.jsx) {
        compilerOptions.jsx = options?.jsx;
    }

    const result = transpileModule(source, { compilerOptions });

    if (result.diagnostics?.length) {
        console.log('diagnostics!', result.diagnostics);
    }

    return result.outputText;
}


export {
    transpile,
}

export type {
    ITranspileOptions,
}
