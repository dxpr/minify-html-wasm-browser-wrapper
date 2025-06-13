# WASM Browser Integration Guide: minify-html/wasm

This guide explains how to integrate the `@minify-html/wasm` package (or similar WASM modules) directly in browser-based JavaScript projects without requiring bundlers like Webpack or Vite.

## Problem Statement

Most WASM packages are designed to work with bundlers, but when serving files directly from a web server, you'll encounter:

- **MIME Type Issues**: Browsers enforce strict MIME type checking for ES modules
- **Import Resolution**: WASM files can't be imported as ES modules without proper server configuration
- **Missing Dependencies**: WASM modules often require specific import structures that CDNs don't handle correctly

## Solution Overview

Instead of relying on CDNs or bundlers, we:
1. Download the WASM files locally
2. Create a custom initialization wrapper
3. Use `fetch()` to load WASM files with proper import bindings

## Step-by-Step Implementation

### 1. Setup npm Project

Initialize your project with npm and install the WASM dependency:

```bash
# Initialize npm project
npm init -y

# Install the WASM package
npm install @minify-html/wasm

# Set module type in package.json
npm pkg set type="module"
```

### 2. Create Build Script

Create a `scripts/install-wasm.js` file to extract WASM files from npm:

```javascript
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
    
    // Extract all __wbg_ function names from the original file
    const functionMatches = originalJs.match(/export function (__wbg_[a-zA-Z0-9_]+)/g);
    const functions = functionMatches ? functionMatches.map(match => match.replace('export function ', '')) : [];
    
    console.log(`📝 Found ${functions.length} WASM binding functions`);

    // Generate the custom wrapper
    const wrapperContent = generateWrapper(functions);
    const wrapperDest = join(wasmDir, 'minify_html_wasm.js');
    writeFileSync(wrapperDest, wrapperContent);
    console.log('✅ Generated custom WASM wrapper');

    console.log('🎉 WASM setup complete! Files are ready in ./wasm/');
    
} catch (error) {
    console.error('❌ Error setting up WASM files:', error.message);
    process.exit(1);
}

function generateWrapper(functions) {
    const imports = functions.map(fn => `        ${fn}: wasm.${fn}`).join(',\n');
    
    return `import * as wasm from "./index_bg.js";
// ... rest of wrapper code (see full example in repository)
`;
}
```

Add npm scripts to your `package.json`:

```json
{
  "scripts": {
    "install-wasm": "node scripts/install-wasm.js",
    "build": "npm run install-wasm",
    "dev": "npm run build && python3 -m http.server 8000"
  }
}
```

### 3. Generate WASM Files

Run the build script to extract and setup WASM files:

```bash
npm run build
```

This will create a `wasm/` directory with the generated files.

### 4. Create Custom WASM Wrapper (Auto-generated)

The build script automatically generates `wasm/minify_html_wasm.js` with the following structure:

```javascript
import * as wasm from "./index_bg.js";

let wasmExports;

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
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
        __wbg_buffer_609cc3eee51ed158: wasm.__wbg_buffer_609cc3eee51ed158,
        __wbg_call_672a4d21634d4a24: wasm.__wbg_call_672a4d21634d4a24,
        __wbg_call_7cccdd69e0791ae2: wasm.__wbg_call_7cccdd69e0791ae2,
        __wbg_crypto_ed58b8e10a292839: wasm.__wbg_crypto_ed58b8e10a292839,
        __wbg_getRandomValues_bcb4912f16000dc4: wasm.__wbg_getRandomValues_bcb4912f16000dc4,
        __wbg_get_67b2ba62fc30de12: wasm.__wbg_get_67b2ba62fc30de12,
        __wbg_msCrypto_0a36e2ec3a343d26: wasm.__wbg_msCrypto_0a36e2ec3a343d26,
        __wbg_new_a12002a7f91c75be: wasm.__wbg_new_a12002a7f91c75be,
        __wbg_newnoargs_105ed471475aaf50: wasm.__wbg_newnoargs_105ed471475aaf50,
        __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: wasm.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a,
        __wbg_newwithlength_a381634e90c276d4: wasm.__wbg_newwithlength_a381634e90c276d4,
        __wbg_node_02999533c4ea02e3: wasm.__wbg_node_02999533c4ea02e3,
        __wbg_process_5c1d670bc53614b8: wasm.__wbg_process_5c1d670bc53614b8,
        __wbg_randomFillSync_ab2cfe79ebbf2740: wasm.__wbg_randomFillSync_ab2cfe79ebbf2740,
        __wbg_require_79b1e9274cde3c87: wasm.__wbg_require_79b1e9274cde3c87,
        __wbg_set_65595bdd868b3009: wasm.__wbg_set_65595bdd868b3009,
        __wbg_static_accessor_GLOBAL_88a902d13a557d07: wasm.__wbg_static_accessor_GLOBAL_88a902d13a557d07,
        __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: wasm.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0,
        __wbg_static_accessor_SELF_37c5d418e4bf5819: wasm.__wbg_static_accessor_SELF_37c5d418e4bf5819,
        __wbg_static_accessor_WINDOW_5de37043a91a9c40: wasm.__wbg_static_accessor_WINDOW_5de37043a91a9c40,
        __wbg_subarray_aa9065fa9dc5df96: wasm.__wbg_subarray_aa9065fa9dc5df96,
        __wbg_versions_c71aa1626a93e0a1: wasm.__wbg_versions_c71aa1626a93e0a1,
        __wbindgen_boolean_get: wasm.__wbindgen_boolean_get,
        __wbindgen_is_function: wasm.__wbindgen_is_function,
        __wbindgen_is_object: wasm.__wbindgen_is_object,
        __wbindgen_is_string: wasm.__wbindgen_is_string,
        __wbindgen_is_undefined: wasm.__wbindgen_is_undefined,
        __wbindgen_memory: wasm.__wbindgen_memory,
        __wbindgen_object_clone_ref: wasm.__wbindgen_object_clone_ref,
        __wbindgen_object_drop_ref: wasm.__wbindgen_object_drop_ref,
        __wbindgen_string_new: wasm.__wbindgen_string_new,
        __wbindgen_throw: wasm.__wbindgen_throw
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
```

### 5. Use in Your Application

```javascript
import init, { minify } from './wasm/minify_html_wasm.js';

async function setupMinifier() {
    // Initialize the WASM module
    await init();
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Use the minifier
    function minifyHtml(htmlString) {
        const encoded = encoder.encode(htmlString);
        const minified = minify(encoded, {
            // Configuration options
            keep_spaces_between_attributes: false,
            keep_comments: false,
            minify_css: true,
            minify_js: true
        });
        return decoder.decode(minified);
    }
    
    return minifyHtml;
}

// Usage
setupMinifier().then(minifyHtml => {
    const result = minifyHtml('<p>  Hello,    world!  </p>');
    console.log(result); // <p>Hello, world!</p>
});
```

## Benefits of npm-based Approach

### Version Management
- **Locked Dependencies**: WASM package versions are managed in `package.json`
- **Reproducible Builds**: `npm install && npm run build` gives consistent results
- **Easy Updates**: Use `npm update @minify-html/wasm` to get newer versions
- **Security**: npm audit can check for vulnerabilities in WASM dependencies

### Development Workflow
- **Automated Setup**: No manual file downloads or version tracking
- **Build Integration**: WASM setup integrates with standard npm scripts
- **Git-friendly**: Generated files are gitignored, only source code is tracked
- **CI/CD Ready**: Build process works in automated environments

### Project Structure
```
your-project/
├── package.json           # Dependency management
├── scripts/
│   └── install-wasm.js   # WASM extraction logic
├── wasm/                 # Generated files (gitignored)
│   ├── minify_html_wasm.js
│   ├── index_bg.js
│   └── minify_html_wasm_bg.wasm
└── .gitignore           # Excludes generated files
```

## Key Implementation Details

### Import Structure
The most critical part is getting the import structure right. WASM modules expect imports with specific module names. In this case, the WASM file expects imports from `"./index_bg.js"`, not from a generic namespace.

### Error Handling
The implementation includes fallback logic for servers that don't serve WASM files with the correct MIME type, automatically falling back to `WebAssembly.instantiate()`.

### Memory Management
The wrapper properly manages the WASM memory and exports, ensuring the module is only initialized once and reused for subsequent calls.

## Integration in Larger Projects

### Project Structure
```
your-project/
├── src/
│   ├── wasm/
│   │   ├── minify_html_wasm.js
│   │   ├── index_bg.js
│   │   └── minify_html_wasm_bg.wasm
│   └── main.js
└── index.html
```

### Module Integration
```javascript
// In your main application
import { setupMinifier } from './wasm/minify_html_wasm.js';

class HtmlProcessor {
    constructor() {
        this.minifier = null;
        this.ready = this.init();
    }
    
    async init() {
        this.minifier = await setupMinifier();
    }
    
    async minify(html) {
        await this.ready;
        return this.minifier(html);
    }
}

export default HtmlProcessor;
```

## Configuration Options

The `minify` function accepts a configuration object with these options:

```javascript
const config = {
    keep_spaces_between_attributes: false,
    keep_comments: false,
    minify_css: true,
    minify_js: true,
    remove_processing_instructions: false,
    ensure_spec_compliant_unquoted_attribute_values: true,
    keep_closing_tags: false,
    keep_html_and_head_opening_tags: false,
    keep_input_type_text_attr: false,
    preserve_brace_template_syntax: false,
    preserve_chevron_percent_template_syntax: false
};
```

## Troubleshooting

### Common Issues

1. **MIME Type Errors**: Ensure your server serves `.wasm` files with `application/wasm` MIME type
2. **Import Errors**: Verify the import structure matches what the WASM expects
3. **Memory Issues**: Make sure to await the `init()` function before using WASM functions

### Server Configuration

For Apache (`.htaccess`):
```apache
AddType application/wasm .wasm
```

For Nginx:
```nginx
location ~* \.wasm$ {
    add_header Content-Type application/wasm;
}
```

## Performance Considerations

- WASM initialization is async and should be done once at application startup
- The minifier is extremely fast once initialized
- Consider lazy loading the WASM module if it's not immediately needed
- Cache the initialized module for reuse across your application

## Browser Compatibility

This implementation works in all modern browsers that support:
- ES Modules
- WebAssembly
- Fetch API
- TextEncoder/TextDecoder

Supported browsers: Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

## Alternative Packages

This pattern works for other Rust-based WASM packages:
- `@swc/wasm-web` (JavaScript/TypeScript compiler)
- `@parcel/css-wasm` (CSS parser/transformer)
- `@dprint/formatter` (Code formatter)

Just adapt the import structure and function names accordingly. 