type WasmModule = typeof import("@/wasm/pkg/openchaos_wasm");

let wasmInit: Promise<WasmModule> | null = null;

export async function loadWasm(): Promise<WasmModule> {
  if (!wasmInit) {
    wasmInit = (async () => {
      const wasm = await import("@/wasm/pkg/openchaos_wasm");
      const init = (
        wasm as unknown as {
          default?: (
            input?: RequestInfo | URL | Response | BufferSource
          ) => Promise<unknown>;
        }
      ).default;

      if (typeof init === "function") {
        if (typeof window === "undefined") {
          const { readFile } = await import("fs/promises");
          const { join } = await import("path");
          const wasmPath = join(
            process.cwd(),
            "public",
            "wasm",
            "openchaos_wasm_bg.wasm"
          );
          const bytes = await readFile(wasmPath);
          await init(bytes);
        } else {
          await init("/wasm/openchaos_wasm_bg.wasm");
        }
      }

      return wasm;
    })();
  }

  return wasmInit;
}
