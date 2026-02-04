import { BACKEND_ROOT_URL } from "./constants";

const FLUSH_INTERVAL = 60 * 1000;

class PageCounter {
  count: number;
  lastFlush: number;
  flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.count = 0;
    this.lastFlush = Date.now();
    if (this.flushInterval === null) {
      this.flushInterval = setInterval(() => {
        this.flush();
      }, FLUSH_INTERVAL);
    }
  }

  async flush() {
    const currentCount = this.count;
    this.count = 0;
    if (currentCount === 0) {
      return;
    }
    const fileName = `${Date.now()}-partial-${Math.floor(Math.random() * 10001)}.txt`;
    const url = `${BACKEND_ROOT_URL}/partials/${fileName}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENCHAOS_BACKEND_ACCESS_TOKEN}`,
        },
        method: "PUT",
        body: JSON.stringify({
          message: `flush ${fileName}`,
          content: Buffer.from(`${currentCount}`).toString("base64"),
        }),
      });
      if (!response.ok) {
        throw Error("Unable to save results.");
      }
      const newFlushTime = Date.now();
      console.log(
        `Successfully flushed ${currentCount} to ${fileName}. Time since last flush ${newFlushTime - this.lastFlush}ms.`,
      );
      this.lastFlush = newFlushTime;
    } catch {
      this.count += currentCount;
      console.error(
        `Unable to save results. Merging WIP data back into live data.`,
      );
    }
  }

  increment() {
    this.count += 1;
  }
}

let counterInstance: PageCounter | null = null;

function getPageCounter(): PageCounter {
  if (!counterInstance) {
    counterInstance = new PageCounter();
  }
  return counterInstance;
}

export const pageCounter = getPageCounter();
