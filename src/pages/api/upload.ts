import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Tidak ada file yang diunggah atau format file tidak didukung' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const acceptedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isImageType = file.type.startsWith('image/');
    const isImageExtension = acceptedExtensions.includes(fileExtension);

    if (!isImageType && !isImageExtension) {
      return new Response(
        JSON.stringify({ error: 'File harus berupa gambar (JPG, PNG, WebP, GIF, AVIF)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Ukuran file maksimal 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalName = file.name.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const filename = `${timestamp}-${randomString}-${originalName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal mengunggah gambar: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
