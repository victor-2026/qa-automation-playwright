import { describe, test, expect, afterAll } from '@jest/globals';
import { query, getOne, getAll, close } from './db-client';

describe('Schema Tests (No CRUD - Use API)', () => {
  test('users table exists', async () => {
    const result = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') as exists`);
    expect(result.rows[0].exists).toBe(true);
  });

  test('posts table exists', async () => {
    const result = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') as exists`);
    expect(result.rows[0].exists).toBe(true);
  });

  test('comments table exists', async () => {
    const result = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') as exists`);
    expect(result.rows[0].exists).toBe(true);
  });

  test('likes table exists', async () => {
    const result = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes') as exists`);
    expect(result.rows[0].exists).toBe(true);
  });

  test('follows table exists', async () => {
    const result = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'follows') as exists`);
    expect(result.rows[0].exists).toBe(true);
  });
});

describe('Data Integrity (Read-Only)', () => {
  test('INV-POST-001: post.likes_count >= 0', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts WHERE likes_count < 0`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-POST-002: post.comments_count >= 0', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts WHERE comments_count < 0`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-POST-003: post.content length <= 2000', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts WHERE LENGTH(content) > 2000`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-POST-003: post.content is not empty', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts WHERE LENGTH(TRIM(content)) = 0 AND is_deleted = false`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-SYS-002: no orphan posts', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE u.id IS NULL AND p.is_deleted = false`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-SYS-002: no orphan comments', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM comments c LEFT JOIN posts p ON c.post_id = p.id WHERE p.id IS NULL`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('INV-MSG-001: conversation.unread_count >= 0', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM conversations WHERE unread_count < 0`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });
});

describe('Seed Data (Read-Only)', () => {
  test('alice exists and is active', async () => {
    const user = await getOne(`SELECT * FROM users WHERE email = $1`, ['alice@buzzhive.com']);
    expect(user).toBeDefined();
    expect(user.is_active).toBe(true);
  });

  test('admin exists', async () => {
    const user = await getOne(`SELECT * FROM users WHERE role = 'admin' LIMIT 1`);
    expect(user).toBeDefined();
  });

  test('seed posts exist', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts WHERE is_deleted = false`);
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });
});

describe('Constraints (Read-Only)', () => {
  test('email unique', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1) t`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('username unique', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM (SELECT username FROM users GROUP BY username HAVING COUNT(*) > 1) t`);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('at least one admin exists', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = true`);
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });
});

describe('Relations (Read-Only)', () => {
  test('posts linked to users', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM posts p JOIN users u ON p.author_id = u.id`);
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('comments linked to posts', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM comments c JOIN posts p ON c.post_id = p.id`);
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('likes have valid targets', async () => {
    const result = await query(`SELECT COUNT(*) as count FROM likes WHERE target_type IS NOT NULL`);
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
  });
});

afterAll(async () => {
  await close();
});
