import rhymesWith from 'rhymes-with';

/**
 * Checks if a PR title contains at least two rhyming words
 * @param title - The PR title to check
 * @returns true if the title contains at least two rhyming words
 */
export function hasRhymingWords(title: string): boolean {
  // Extract words from the title (lowercase, remove punctuation)
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out very short words

  // Check all pairs of words to see if any two rhyme
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const word1 = words[i];
      const word2 = words[j];

      // Skip if same word (case-insensitive already handled by lowercase)
      if (word1 === word2) continue;

      // Check if words rhyme
      if (rhymesWith(word1, word2)) {
        return true;
      }
    }
  }

  return false;
}
