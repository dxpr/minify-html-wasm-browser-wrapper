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