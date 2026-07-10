import { supabase } from './supabase';

function normalizeTags(tags?: string | string[]) {
  if (!tags) return '[]';
  if (Array.isArray(tags)) return JSON.stringify(tags.filter(Boolean));

  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return JSON.stringify(parsed);
  } catch {
    // ignore
  }

  const normalized = String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return JSON.stringify(normalized);
}

function normalizeJson(value: any) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return JSON.stringify(parsed);
    } catch {
      const raw = value.trim();
      if (raw.indexOf('\n') !== -1 || raw.indexOf(',') !== -1) {
        const arr = raw.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
        return JSON.stringify(arr);
      }
      return JSON.stringify(raw);
    }
    return value;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ==========================================
// BLOG POSTS
// ==========================================
export async function getPost(id: number) {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error) console.error('getPost error:', error);
  return data;
}

export async function getAllPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
  if (error) console.error('getAllPosts error:', error);
  return data || [];
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  if (error) console.error('getPostBySlug error:', error);
  return data;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  read_time?: number;
  is_featured?: boolean;
  tags?: string;
}) {
  const { data: inserted, error } = await supabase.from('blog_posts').insert({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image: data.cover_image || null,
    read_time: data.read_time || 0,
    is_featured: data.is_featured ? true : false,
    tags: normalizeTags(data.tags)
  }).select().single();
  
  if (error) {
    console.error('createPost error:', error);
    throw error;
  }
  return inserted.id;
}

export async function updatePost(id: number, data: Partial<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  read_time?: number;
  is_featured?: boolean;
  tags?: string;
}>) {
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.content !== undefined) updates.content = data.content;
  if (data.cover_image !== undefined) updates.cover_image = data.cover_image || null;
  if (data.read_time !== undefined) updates.read_time = data.read_time;
  if (data.is_featured !== undefined) updates.is_featured = data.is_featured ? true : false;
  if (data.tags !== undefined) updates.tags = normalizeTags(data.tags);

  const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
  if (error) {
    console.error('updatePost error:', error);
    throw error;
  }
}

export async function deletePost(id: number) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) {
    console.error('deletePost error:', error);
    throw error;
  }
}

// ==========================================
// PROJECTS
// ==========================================
export async function getProject(id: number) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) console.error('getProject error:', error);
  return data;
}

export async function getAllProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('featured', { ascending: false }).order('year', { ascending: false }).order('published_at', { ascending: false });
  if (error) console.error('getAllProjects error:', error);
  return data || [];
}

export async function getProjectBySlug(slug: string) {
  let query = supabase.from('projects').select('*').eq('slug', slug);
  if (!isNaN(Number(slug))) {
    query = supabase.from('projects').select('*').or(`slug.eq.${slug},id.eq.${Number(slug)}`);
  }
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) console.error('getProjectBySlug error:', error);
  return data;
}

export async function createProject(data: {
  title: string;
  slug: string;
  summary: string;
  description?: string;
  content?: string;
  cover_image?: string;
  cover_alt?: string;
  tech?: string;
  role?: string;
  year?: number;
  featured?: boolean;
  client?: string;
  duration?: string;
  links?: string;
  images?: string;
}) {
  const { data: inserted, error } = await supabase.from('projects').insert({
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    description: data.description || null,
    content: data.content || null,
    cover_image: data.cover_image || null,
    cover_alt: data.cover_alt || null,
    tech: normalizeJson(data.tech || '[]'),
    role: data.role || null,
    year: data.year || null,
    featured: data.featured ? true : false,
    client: data.client || null,
    duration: data.duration || null,
    links: normalizeJson(data.links || '{}'),
    images: normalizeJson(data.images || '[]')
  }).select().single();
  
  if (error) {
    console.error('createProject error:', error);
    throw error;
  }
  return inserted.id;
}

export async function updateProject(id: number, data: Partial<{
  title: string;
  slug: string;
  summary: string;
  description?: string;
  content?: string;
  cover_image?: string;
  cover_alt?: string;
  tech?: string;
  role?: string;
  year?: number;
  featured?: boolean;
  client?: string;
  duration?: string;
  links?: string;
  images?: string;
}>) {
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.summary !== undefined) updates.summary = data.summary;
  if (data.description !== undefined) updates.description = data.description || null;
  if (data.content !== undefined) updates.content = data.content || null;
  if (data.cover_image !== undefined) updates.cover_image = data.cover_image || null;
  if (data.cover_alt !== undefined) updates.cover_alt = data.cover_alt || null;
  if (data.tech !== undefined) updates.tech = normalizeJson(data.tech || '[]');
  if (data.role !== undefined) updates.role = data.role || null;
  if (data.year !== undefined) updates.year = data.year || null;
  if (data.featured !== undefined) updates.featured = data.featured ? true : false;
  if (data.client !== undefined) updates.client = data.client || null;
  if (data.duration !== undefined) updates.duration = data.duration || null;
  if (data.links !== undefined) updates.links = normalizeJson(data.links || '{}');
  if (data.images !== undefined) updates.images = normalizeJson(data.images || '[]');

  const { error } = await supabase.from('projects').update(updates).eq('id', id);
  if (error) {
    console.error('updateProject error:', error);
    throw error;
  }
}

export async function deleteProject(id: number) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('deleteProject error:', error);
    throw error;
  }
}

// ==========================================
// PRODUCTS
// ==========================================
export async function getProduct(id: number) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) console.error('getProduct error:', error);
  return data;
}

export async function getAllProducts() {
  const { data, error } = await supabase.from('products').select('*').order('published_at', { ascending: false });
  if (error) console.error('getAllProducts error:', error);
  return data || [];
}

export async function getProductBySlug(slug: string) {
  let query = supabase.from('products').select('*').eq('slug', slug);
  if (!isNaN(Number(slug))) {
    query = supabase.from('products').select('*').or(`slug.eq.${slug},id.eq.${Number(slug)}`);
  }
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) console.error('getProductBySlug error:', error);
  return data;
}

export async function createProduct(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  link?: string;
  price?: string;
  is_featured?: boolean;
  tags?: string;
}) {
  const { data: inserted, error } = await supabase.from('products').insert({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image: data.cover_image || null,
    link: data.link || null,
    price: data.price || null,
    is_featured: data.is_featured ? true : false,
    tags: normalizeTags(data.tags)
  }).select().single();
  
  if (error) {
    console.error('createProduct error:', error);
    throw error;
  }
  return inserted.id;
}

export async function updateProduct(id: number, data: Partial<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  link?: string;
  price?: string;
  is_featured?: boolean;
  tags?: string;
}>) {
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.content !== undefined) updates.content = data.content;
  if (data.cover_image !== undefined) updates.cover_image = data.cover_image || null;
  if (data.link !== undefined) updates.link = data.link || null;
  if (data.price !== undefined) updates.price = data.price || null;
  if (data.is_featured !== undefined) updates.is_featured = data.is_featured ? true : false;
  if (data.tags !== undefined) updates.tags = normalizeTags(data.tags);

  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) {
    console.error('updateProduct error:', error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('deleteProduct error:', error);
    throw error;
  }
}
