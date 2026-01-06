type WasmModule = typeof import("@/wasm/pkg/openchaos_wasm");

let wasmInit: Promise<WasmModule> | null = null;

export async function loadWasm(): Promise<WasmModule> {
  if (!wasmInit) {
    wasmInit = import("@/wasm/pkg/openchaos_wasm");
  }

  return wasmInit;
}
