/**
 * WASM Module Loader
 *
 * Loads and caches the Rust/WASM module for OpenChaos.
 * Prevents multiple simultaneous initializations.
 */

let wasmModule: any = null;
let initPromise: Promise<any> | null = null;

export async function loadWasm() {
  // Return cached module if available
  if (wasmModule) {
    return wasmModule;
  }

  // Prevent parallel initializations
  if (initPromise) {
    return initPromise;
  }

  initPromise = import('@/wasm/pkg/openchaos_wasm')
    .then(module => {
      wasmModule = module;
      return module;
    })
    .catch(error => {
      // Reset on error so next call can retry
      initPromise = null;
      console.error('Failed to load WASM module:', error);
      throw new Error(`WASM initialization failed: ${error.message}`);
    });

  return initPromise;
}

/**
 * Check if WASM is loaded (for debugging)
 */
export function isWasmLoaded(): boolean {
  return wasmModule !== null;
}
