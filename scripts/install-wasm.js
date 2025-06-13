#!/usr/bin/env node

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔧 Setting up WASM files from npm package...');

// Ensure wasm directory exists
const wasmDir = join(projectRoot, 'wasm');
if (!existsSync(wasmDir)) {
    mkdirSync(wasmDir, { recursive: true });
}

try {
    // Path to the installed npm package
    const packagePath = join(projectRoot, 'node_modules', '@minify-html', 'wasm');
    
    if (!existsSync(packagePath)) {
        console.error('❌ @minify-html/wasm package not found. Run "npm install" first.');
        process.exit(1);
    }

    // Copy WASM binary
    const wasmSource = join(packagePath, 'index_bg.wasm');
    const wasmDest = join(wasmDir, 'minify_html_wasm_bg.wasm');
    copyFileSync(wasmSource, wasmDest);
    console.log('✅ Copied WASM binary');

    // Copy JavaScript bindings
    const jsSource = join(packagePath, 'index_bg.js');
    const jsDest = join(wasmDir, 'index_bg.js');
    copyFileSync(jsSource, jsDest);
    console.log('✅ Copied JavaScript bindings');

    // Read the original index_bg.js to extract the function signatures
    const originalJs = readFileSync(jsSource, 'utf8');
    
    // Extract ALL exported function names from the original file (both __wbg_ and __wbindgen_)
    const functionMatches = originalJs.match(/export function (__w[a-zA-Z0-9_]+)/g);
    const functions = functionMatches ? functionMatches.map(match => match.replace('export function ', '')) : [];
    
    console.log(`📝 Found ${functions.length} WASM binding functions`);

    // Generate the custom wrapper
    const wrapperContent = generateWrapper(functions);
    const wrapperDest = join(wasmDir, 'minify_html_wasm.js');
    writeFileSync(wrapperDest, wrapperContent);
    console.log('✅ Generated custom WASM wrapper');

    // Update the main HTML file to use the wasm directory
    updateHtmlFile();
    console.log('✅ Updated HTML file imports');

    console.log('🎉 WASM setup complete! Files are ready in ./wasm/');
    
} catch (error) {
    console.error('❌ Error setting up WASM files:', error.message);
    process.exit(1);
}

function generateWrapper(functions) {
    const imports = functions.map(fn => `        ${fn}: wasm.${fn}`).join(',\n');
    
    return `import * as wasm from "./index_bg.js";

let wasmExports;

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("\`WebAssembly.instantiateStreaming\` failed because your server does not serve wasm with \`application/wasm\` MIME type. Falling back to \`WebAssembly.instantiate\` which is slower. Original error:\\n", e);
                } else {
                    throw e;
                }
            }
        }
        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);
        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    // CRITICAL: Use the exact import path the WASM expects
    imports["./index_bg.js"] = {
${imports}
    };
    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {
    // Memory initialization if needed
}

function __wbg_finalize_init(instance, module) {
    wasmExports = instance.exports;
    wasm.__wbg_set_wasm(instance.exports);
    __wbg_init_memory(instance.exports);
    return instance.exports;
}

async function __wbg_init(input) {
    if (wasmExports !== undefined) return wasmExports;

    if (typeof input === 'undefined') {
        input = new URL('minify_html_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export default __wbg_init;
export { minify } from "./index_bg.js";
`;
}

function updateHtmlFile() {
    const htmlPath = join(projectRoot, 'index.html');
    if (!existsSync(htmlPath)) {
        console.log('⚠️  index.html not found, skipping update');
        return;
    }

    let htmlContent = readFileSync(htmlPath, 'utf8');
    
    // Update the import path to use the wasm directory
    htmlContent = htmlContent.replace(
        "import init, { minify } from './minify_html_wasm.js';",
        "import init, { minify } from './wasm/minify_html_wasm.js';"
    );
    
    writeFileSync(htmlPath, htmlContent);
} 