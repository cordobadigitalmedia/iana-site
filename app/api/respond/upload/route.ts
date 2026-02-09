import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getResponseLinkByToken } from '@/lib/respond';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const token = formData.get('token') as string | null;
    const type = formData.get('type') as string | null; // 'guarantor-id' | 'reference-letter'

    if (!file || !token || !type) {
      return NextResponse.json(
        { error: 'File, token, and type are required.' },
        { status: 400 }
      );
    }

    if (type !== 'guarantor-id' && type !== 'reference-letter') {
      return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
    }

    const link = await getResponseLinkByToken(token);
    if (!link) {
      return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 });
    }
    if (link.submitted_at) {
      return NextResponse.json({ error: 'This form has already been submitted.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'pdf';
    const suffix = type === 'guarantor-id' ? 'id' : 'letter';
    const pathname = `response/${link.application_id}/${token}-${suffix}.${ext}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading respond file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file.' },
      { status: 500 }
    );
  }
}
