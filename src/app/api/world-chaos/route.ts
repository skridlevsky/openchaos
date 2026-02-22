export async function GET() {
  try {
    const response = await fetch('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
    const xml = await response.text();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return new Response('Failed to fetch RSS', { status: 500 });
  }
}
