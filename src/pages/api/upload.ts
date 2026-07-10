import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Ensure this endpoint runs server-side so uploads and request headers work
export const prerender = false;

// Create public/uploads directory if it doesn't exist
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    await fsPromises.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type');
    console.log('[UPLOAD] Content-Type:', contentType);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.log('[UPLOAD] No file found in formData or unsupported form value');
      return new Response(
        JSON.stringify({ error: 'Tidak ada file yang diunggah atau format file tidak didukung' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const imageFile = file;
    console.log('[UPLOAD] File object:', imageFile.name, imageFile.type, imageFile.size);

    const acceptedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() ?? '';
    const isImageType = imageFile.type.startsWith('image/');
    const isImageExtension = acceptedExtensions.includes(fileExtension);

    if (!isImageType && !isImageExtension) {
      return new Response(
        JSON.stringify({
          error: 'File harus berupa gambar (JPG, PNG, WebP, GIF, AVIF)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Ukuran file maksimal 5MB' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const uploadsDir = await ensureUploadsDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalName = file.name.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const filename = `${timestamp}-${randomString}-${originalName}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fsPromises.writeFile(filepath, buffer);

    // Return relative path for use in database
    const relativePath = `/uploads/${filename}`;

    return new Response(JSON.stringify({ url: relativePath }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: 'Gagal mengunggah gambar: ' + error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
