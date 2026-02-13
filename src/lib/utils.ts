/**
 * Strips emojis and other Unicode symbols from text, leaving only ASCII characters.
 */
export function stripEmojis(text: string): string {
  // Remove emojis and other Unicode symbols
  // This regex matches:
  // - Emoticons (😀-🙏)
  // - Symbols & Pictographs (🌀-🗿)
  // - Transport & Map Symbols (🚀-🛿)
  // - Supplemental Symbols and Pictographs (🔼-🫶)
  // - Symbols and Pictographs Extended-A (🪿-🫨)
  // - And other common emoji ranges
  return text.replace(
    /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{200D}]|[\u{FE00}-\u{FE0F}]|[\u{20D0}-\u{20FF}]/gu,
    ""
  ).trim();
}
