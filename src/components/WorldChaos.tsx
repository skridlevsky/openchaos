'use client'

import { useState, useEffect } from "react";
import Parser from 'rss-parser';

export interface WorldChaosProps {
  url: string;
  rotateInterval?: number;
  scramble_words: boolean;
}

export function WorldChaos({ url, rotateInterval = 1000, scramble_words=false }: WorldChaosProps) {
  const [items, setItems] = useState<Parser.Item[]>([]);
  const [currentItem, setCurrentItem] = useState<Parser.Item | null>(null);

  // Fetch RSS feed
  useEffect(() => {
    const parser = new Parser();
    
    const fetchData = async () => {
      try {
        const feed = await parser.parseURL(url);
        setItems(feed.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [url]);

  // Rotate to random item every N seconds
  useEffect(() => {
    if (items.length === 0) return;

    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setCurrentItem(items[randomIndex]);
    }, rotateInterval);

    return () => clearInterval(intervalId);
  }, [items, rotateInterval]);

  const mix_words = (text: string): string => {
      const words = text.split(' ');
      const shuffled_words = shuffleArray(words);
      return shuffled_words.join(' ');
  };

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

  let text_to_display;
  if (currentItem?.title) {
    text_to_display = scramble_words ? mix_words(currentItem.title) : currentItem.title;
  } else {
    text_to_display = "The World in Chaos...";
  }

  return (
    <a target="_blank" href={currentItem?.link}>
      <span className='world-chaos'>{text_to_display}</span>
    </a>
  );
}