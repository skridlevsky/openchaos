use web_sys::console;
use wasm_bindgen::JsValue;

/// Log to browser console
pub fn log(msg: &str) {
    console::log_1(&JsValue::from_str(msg));
}

/// Log errors to console
pub fn log_error(msg: &str) {
    console::error_1(&JsValue::from_str(msg));
}
