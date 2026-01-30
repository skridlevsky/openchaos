# OpenChaos WASM

🦀 Rust/WebAssembly implementation of OpenChaos server logic.

## What This Does

This crate compiles Rust code to WebAssembly that handles:
- Fetching open PRs from GitHub
- Counting votes (upvotes - downvotes)
- Sorting PRs by votes and date
- Fetching recently merged PRs

## Why Rust?

1. **Performance**: Faster sorting and data processing
2. **Memory Safety**: No null pointers, no garbage collection pauses
3. **Bundle Size**: Optimized WASM builds (~150KB)
4. **Type Safety**: Compile-time guarantees
5. **The Memes**: 🦀

## Development

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack
```

### Build

```bash
# Debug build (fast compile, larger binary)
wasm-pack build --target web --out-dir ../../src/wasm/pkg

# Release build (slow compile, smaller binary ~150KB)
wasm-pack build --target web --release --out-dir ../../src/wasm/pkg
```

### Test

```bash
cargo test
cargo clippy
cargo fmt --check
```

### Project Structure

```
src/
├── lib.rs      # WASM exports (get_open_prs, get_merged_prs)
├── github.rs   # GitHub API client
├── types.rs    # Data structures
└── utils.rs    # Logging helpers
```

## Architecture

```
TypeScript (Next.js)
    ↓ calls
WASM Module (compiled Rust)
    ↓ fetches
GitHub API
```

## Performance Optimizations

The `Cargo.toml` includes aggressive size optimizations:

- `opt-level = "z"` - Optimize for size
- `lto = true` - Link-time optimization
- `codegen-units = 1` - Better optimization
- `panic = "abort"` - Remove panic unwinding
- `strip = true` - Strip symbols

Result: ~150KB WASM binary (vs ~300KB without optimization)

## API

### `get_open_prs()`

Fetches all open PRs, counts votes, and sorts by votes DESC then date DESC.

**Returns:**
```json
[
  {
    "number": 13,
    "title": "Rewrite it in rust",
    "author": "wvanlit",
    "url": "https://github.com/...",
    "votes": 748,
    "createdAt": "2024-01-15T..."
  }
]
```

### `get_merged_prs(limit: u32)`

Fetches recently merged PRs (excluding repo owner).

**Returns:**
```json
[
  {
    "number": 47,
    "title": "IE6 mode",
    "author": "username",
    "url": "https://github.com/...",
    "mergedAt": "2024-12-20T..."
  }
]
```

## Troubleshooting

### "No window object" error
Make sure you're running in a browser environment, not Node.js.

### WASM build fails
Check that wasm-pack is installed and WASM target is added:
```bash
rustup target list | grep wasm32
# Should show: wasm32-unknown-unknown (installed)
```

### Large bundle size
Make sure you're using `--release` flag for production builds.

## Contributing

When adding new functionality:
1. Add types to `types.rs`
2. Implement logic in `github.rs` or new module
3. Export function in `lib.rs` with `#[wasm_bindgen]`
4. Add tests
5. Update this README

## License

Same as parent project (OpenChaos).
