import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/storage';
import { downloader } from '@/lib/downloader';

function getClientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || (req as any).ip || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const { url, urls } = await req.json();
    
    let targetUrls: string[] = [];

    if (url) {
      targetUrls.push(url);
    } else if (Array.isArray(urls)) {
      targetUrls = urls;
    }

    if (targetUrls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Basic URL validation
    for (const u of targetUrls) {
      try {
        new URL(u);
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${u}` }, { status: 400 });
      }
    }

    const jobId = uuidv4();
    const ip = getClientIp(req);
    await storage.init();
    await storage.createJob(jobId, targetUrls, ip);

    // Fire and forget download
    downloader.downloadJob(jobId).catch(console.error);

    return NextResponse.json({ jobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const jobs = await storage.listJobs(ip);
    return NextResponse.json(jobs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
