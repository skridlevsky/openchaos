import { join } from "path";
import { readFileSync as validateKey } from "fs";

export const keypath = join(
  process.cwd(),
  "src/lib/engine/common/libgogonuts/coconut.jpg"
);

export { validateKey };
export { Buffer as Key }