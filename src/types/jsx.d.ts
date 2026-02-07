import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLMarqueeElement>, HTMLMarqueeElement> & {
        behavior?: 'scroll' | 'slide' | 'alternate';
        direction?: 'left' | 'right' | 'up' | 'down';
        scrollamount?: string | number;
        scrolldelay?: string | number;
        width?: string;
        height?: string;
      };
    }
  }
}

export {};