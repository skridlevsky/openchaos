/* @ts-self-types="./openchaos_wasm.d.ts" */

import * as wasm from "./openchaos_wasm_bg.wasm";
import { __wbg_set_wasm } from "./openchaos_wasm_bg.js";
__wbg_set_wasm(wasm);

export {
    get_merged_prs, get_open_prs
} from "./openchaos_wasm_bg.js";
