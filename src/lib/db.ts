import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, values?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

const DEV_POSTS_PATH = path.join(process.cwd(), 'src', 'data', 'dev-posts.json');
const DEV_PROJECTS_PATH = path.join(process.cwd(), 'src', 'data', 'dev-projects.json');
const DEV_PRODUCTS_PATH = path.join(process.cwd(), 'src', 'data', 'dev-products.json');

async function loadDevData(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (_err) {
    // ignore and return empty
  }
  return [];
}

async function saveDevData(filePath: string, data: any[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

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
      // If it's not valid JSON, try to coerce into a reasonable JSON value:
      const raw = value.trim();
      // If it looks like a list (commas or newlines), split into an array
      if (raw.indexOf('\n') !== -1 || raw.indexOf(',') !== -1) {
        const arr = raw.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
        return JSON.stringify(arr);
      }
      // Otherwise, return a JSON string to avoid leaving raw non-JSON in storage
      return JSON.stringify(raw);
    }
    return value;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

async function loadDevPosts() {
  return loadDevData(DEV_POSTS_PATH);
}

async function saveDevPosts(posts: any[]) {
  await saveDevData(DEV_POSTS_PATH, posts);
}

export async function getPost(id: number) {
  try {
    const results = await query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getPost: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    return posts.find((p) => Number(p.id) === Number(id));
  }
}

export async function getAllPosts() {
  try {
    const results = await query('SELECT * FROM blog_posts ORDER BY published_at DESC');
    return results as any[];
  } catch (err: any) {
    console.error('getAllPosts: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    return posts.sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const results = await query('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1', [slug]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getPostBySlug: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    return posts.find((p) => p.slug === slug);
  }
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
  try {
    const result = await query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, read_time, is_featured, tags, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.cover_image || null,
        data.read_time || 0,
        data.is_featured ? 1 : 0,
        normalizeTags(data.tags),
      ]
    );
    return (result as any).insertId;
  } catch (err: any) {
    console.error('createPost: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    const maxId = posts.reduce((m: number, p: any) => Math.max(m, Number(p.id) || 0), 0);
    const id = maxId + 1;
    const now = new Date().toISOString();
    const p = {
      id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image: data.cover_image || null,
      read_time: data.read_time || 0,
      is_featured: data.is_featured ? 1 : 0,
      tags: normalizeTags(data.tags),
      published_at: now,
    };
    posts.push(p);
    await saveDevPosts(posts);
    return id;
  }
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
  const fields = [];
  const values = [];

  if (data.title) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.slug) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.excerpt) {
    fields.push('excerpt = ?');
    values.push(data.excerpt);
  }
  if (data.content) {
    fields.push('content = ?');
    values.push(data.content);
  }
  if (data.cover_image !== undefined) {
    fields.push('cover_image = ?');
    values.push(data.cover_image || null);
  }
  if (data.read_time !== undefined) {
    fields.push('read_time = ?');
    values.push(data.read_time);
  }
  if (data.is_featured !== undefined) {
    fields.push('is_featured = ?');
    values.push(data.is_featured ? 1 : 0);
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(normalizeTags(data.tags));
  }

  if (fields.length === 0) return;

  values.push(id);
  try {
    await query(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`, values);
    return;
  } catch (err: any) {
    console.error('updatePost: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    const idx = posts.findIndex((p) => Number(p.id) === Number(id));
    if (idx === -1) return;
    const p = posts[idx];
    if (data.title) p.title = data.title;
    if (data.slug) p.slug = data.slug;
    if (data.excerpt) p.excerpt = data.excerpt;
    if (data.content) p.content = data.content;
    if (data.cover_image !== undefined) p.cover_image = data.cover_image || null;
    if (data.read_time !== undefined) p.read_time = data.read_time;
    if (data.is_featured !== undefined) p.is_featured = data.is_featured ? 1 : 0;
    if (data.tags !== undefined) p.tags = normalizeTags(data.tags);
    posts[idx] = p;
    await saveDevPosts(posts);
    return;
  }
}

export async function deletePost(id: number) {
  try {
    await query('DELETE FROM blog_posts WHERE id = ?', [id]);
  } catch (err: any) {
    console.error('deletePost: DB error, falling back to file store', err && (err.code || err.message || err));
    const posts = await loadDevPosts();
    const filtered = posts.filter((p) => Number(p.id) !== Number(id));
    await saveDevPosts(filtered);
  }
}

async function loadDevProjects() {
  return loadDevData(DEV_PROJECTS_PATH);
}

async function saveDevProjects(projects: any[]) {
  await saveDevData(DEV_PROJECTS_PATH, projects);
}

export async function getProject(id: number) {
  try {
    const results = await query('SELECT * FROM projects WHERE id = ?', [id]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getProject: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    return projects.find((p) => Number(p.id) === Number(id));
  }
}

export async function getAllProjects() {
  try {
    const results = await query('SELECT * FROM projects ORDER BY featured DESC, year DESC, published_at DESC');
    return results as any[];
  } catch (err: any) {
    console.error('getAllProjects: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    return projects.sort((a: any, b: any) => {
      if ((b.featured ? 1 : 0) - (a.featured ? 1 : 0) !== 0) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if ((b.year || 0) !== (a.year || 0)) {
        return (b.year || 0) - (a.year || 0);
      }
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const results = await query('SELECT * FROM projects WHERE slug = ? LIMIT 1', [slug]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getProjectBySlug: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    return projects.find((p) => p.slug === slug || String(p.id) === slug);
  }
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
  try {
    const result = await query(
      `INSERT INTO projects (title, slug, summary, description, content, cover_image, cover_alt, tech, role, year, featured, client, duration, links, images, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.title,
        data.slug,
        data.summary,
        data.description || null,
        data.content || null,
        data.cover_image || null,
        data.cover_alt || null,
        normalizeJson(data.tech || '[]'),
        data.role || null,
        data.year || null,
        data.featured ? 1 : 0,
        data.client || null,
        data.duration || null,
        normalizeJson(data.links || '{}'),
        normalizeJson(data.images || '[]'),
      ]
    );
    return (result as any).insertId;
  } catch (err: any) {
    console.error('createProject: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    const maxId = projects.reduce((m: number, p: any) => Math.max(m, Number(p.id) || 0), 0);
    const id = maxId + 1;
    const now = new Date().toISOString();
    const entry = {
      id,
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
      featured: data.featured ? 1 : 0,
      client: data.client || null,
      duration: data.duration || null,
      links: normalizeJson(data.links || '{}'),
      images: normalizeJson(data.images || '[]'),
      published_at: now,
    };
    projects.push(entry);
    await saveDevProjects(projects);
    return id;
  }
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
  const fields = [];
  const values = [];

  if (data.title) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.slug) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.summary) {
    fields.push('summary = ?');
    values.push(data.summary);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description || null);
  }
  if (data.content !== undefined) {
    fields.push('content = ?');
    values.push(data.content || null);
  }
  if (data.cover_image !== undefined) {
    fields.push('cover_image = ?');
    values.push(data.cover_image || null);
  }
  if (data.cover_alt !== undefined) {
    fields.push('cover_alt = ?');
    values.push(data.cover_alt || null);
  }
  if (data.tech !== undefined) {
    fields.push('tech = ?');
    values.push(normalizeJson(data.tech || '[]'));
  }
  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role || null);
  }
  if (data.year !== undefined) {
    fields.push('year = ?');
    values.push(data.year || null);
  }
  if (data.featured !== undefined) {
    fields.push('featured = ?');
    values.push(data.featured ? 1 : 0);
  }
  if (data.client !== undefined) {
    fields.push('client = ?');
    values.push(data.client || null);
  }
  if (data.duration !== undefined) {
    fields.push('duration = ?');
    values.push(data.duration || null);
  }
  if (data.links !== undefined) {
    fields.push('links = ?');
    values.push(normalizeJson(data.links || '{}'));
  }
  if (data.images !== undefined) {
    fields.push('images = ?');
    values.push(normalizeJson(data.images || '[]'));
  }

  if (fields.length === 0) return;

  values.push(id);
  try {
    await query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    return;
  } catch (err: any) {
    console.error('updateProject: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    const idx = projects.findIndex((p) => Number(p.id) === Number(id));
    if (idx === -1) return;
    const entry = projects[idx];
    if (data.title) entry.title = data.title;
    if (data.slug) entry.slug = data.slug;
    if (data.summary) entry.summary = data.summary;
    if (data.description !== undefined) entry.description = data.description || null;
    if (data.content !== undefined) entry.content = data.content || null;
    if (data.cover_image !== undefined) entry.cover_image = data.cover_image || null;
    if (data.cover_alt !== undefined) entry.cover_alt = data.cover_alt || null;
    if (data.tech !== undefined) entry.tech = normalizeJson(data.tech || '[]');
    if (data.role !== undefined) entry.role = data.role || null;
    if (data.year !== undefined) entry.year = data.year || null;
    if (data.featured !== undefined) entry.featured = data.featured ? 1 : 0;
    if (data.client !== undefined) entry.client = data.client || null;
    if (data.duration !== undefined) entry.duration = data.duration || null;
    if (data.links !== undefined) entry.links = normalizeJson(data.links || '{}');
    if (data.images !== undefined) entry.images = normalizeJson(data.images || '[]');
    projects[idx] = entry;
    await saveDevProjects(projects);
    return;
  }
}

export async function deleteProject(id: number) {
  try {
    await query('DELETE FROM projects WHERE id = ?', [id]);
  } catch (err: any) {
    console.error('deleteProject: DB error, falling back to file store', err && (err.code || err.message || err));
    const projects = await loadDevProjects();
    const filtered = projects.filter((p) => Number(p.id) !== Number(id));
    await saveDevProjects(filtered);
  }
}

async function loadDevProducts() {
  return loadDevData(DEV_PRODUCTS_PATH);
}

async function saveDevProducts(products: any[]) {
  await saveDevData(DEV_PRODUCTS_PATH, products);
}

export async function getProduct(id: number) {
  try {
    const results = await query('SELECT * FROM products WHERE id = ?', [id]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getProduct: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    return products.find((p) => Number(p.id) === Number(id));
  }
}

export async function getAllProducts() {
  try {
    const results = await query('SELECT * FROM products ORDER BY published_at DESC');
    return results as any[];
  } catch (err: any) {
    console.error('getAllProducts: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    return products.sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const results = await query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
    return (results as any[])[0];
  } catch (err: any) {
    console.error('getProductBySlug: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    return products.find((p) => p.slug === slug || String(p.id) === slug);
  }
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
  try {
    const result = await query(
      `INSERT INTO products (title, slug, excerpt, content, cover_image, link, price, is_featured, tags, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.cover_image || null,
        data.link || null,
        data.price || null,
        data.is_featured ? 1 : 0,
        normalizeTags(data.tags),
      ]
    );
    return (result as any).insertId;
  } catch (err: any) {
    console.error('createProduct: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    const maxId = products.reduce((m: number, p: any) => Math.max(m, Number(p.id) || 0), 0);
    const id = maxId + 1;
    const now = new Date().toISOString();
    const product = {
      id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image: data.cover_image || null,
      link: data.link || null,
      price: data.price || null,
      is_featured: data.is_featured ? 1 : 0,
      tags: normalizeTags(data.tags),
      published_at: now,
    };
    products.push(product);
    await saveDevProducts(products);
    return id;
  }
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
  const fields = [];
  const values = [];

  if (data.title) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.slug) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.excerpt) {
    fields.push('excerpt = ?');
    values.push(data.excerpt);
  }
  if (data.content) {
    fields.push('content = ?');
    values.push(data.content);
  }
  if (data.cover_image !== undefined) {
    fields.push('cover_image = ?');
    values.push(data.cover_image || null);
  }
  if (data.link !== undefined) {
    fields.push('link = ?');
    values.push(data.link || null);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    values.push(data.price || null);
  }
  if (data.is_featured !== undefined) {
    fields.push('is_featured = ?');
    values.push(data.is_featured ? 1 : 0);
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(normalizeTags(data.tags));
  }

  if (fields.length === 0) return;

  values.push(id);
  try {
    await query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    return;
  } catch (err: any) {
    console.error('updateProduct: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    const idx = products.findIndex((p) => Number(p.id) === Number(id));
    if (idx === -1) return;
    const product = products[idx];
    if (data.title) product.title = data.title;
    if (data.slug) product.slug = data.slug;
    if (data.excerpt) product.excerpt = data.excerpt;
    if (data.content) product.content = data.content;
    if (data.cover_image !== undefined) product.cover_image = data.cover_image || null;
    if (data.link !== undefined) product.link = data.link || null;
    if (data.price !== undefined) product.price = data.price || null;
    if (data.is_featured !== undefined) product.is_featured = data.is_featured ? 1 : 0;
    if (data.tags !== undefined) product.tags = normalizeTags(data.tags);
    products[idx] = product;
    await saveDevProducts(products);
    return;
  }
}

export async function deleteProduct(id: number) {
  try {
    await query('DELETE FROM products WHERE id = ?', [id]);
  } catch (err: any) {
    console.error('deleteProduct: DB error, falling back to file store', err && (err.code || err.message || err));
    const products = await loadDevProducts();
    const filtered = products.filter((p) => Number(p.id) !== Number(id));
    await saveDevProducts(filtered);
  }
}
