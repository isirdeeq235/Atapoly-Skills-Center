import { Response } from 'express';

// Simple in-memory SSE broadcaster keyed by user id
const subscribers: Map<string, Set<Response>> = new Map();

export function subscribe(userId: string, res: Response) {
  if (!subscribers.has(userId)) subscribers.set(userId, new Set());
  const set = subscribers.get(userId)!;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  set.add(res);

  const cleanup = () => {
    set.delete(res);
    try { res.end(); } catch (e) {}
  };

  res.on('close', cleanup);
  res.on('finish', cleanup);

  return () => cleanup();
}

export function publishToUser(userId: string, event: string, data: any) {
  const set = subscribers.get(userId);
  if (!set) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch (e) {
      // ignore write errors
    }
  }
}

export function broadcast(event: string, data: any) {
  for (const [userId, set] of subscribers.entries()) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) {
      try { res.write(payload); } catch (e) {}
    }
  }
}
