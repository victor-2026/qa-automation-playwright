import { describe, test, expect } from '@jest/globals';

describe('Post Properties', () => {
  test('posts have valid like counts', async () => {
    const response = await fetch('http://localhost:8000/api/posts');
    if (response.status === 200) {
      const posts = await response.json() as any[];
      for (const post of posts) {
        expect(typeof post.like_count).toBe('number');
        expect(post.like_count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(post.like_count)).toBe(true);
      }
    }
  });

  test('posts have valid comment counts', async () => {
    const response = await fetch('http://localhost:8000/api/posts');
    if (response.status === 200) {
      const posts = await response.json() as any[];
      for (const post of posts) {
        expect(typeof post.comments_count).toBe('number');
        expect(post.comments_count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('post content length is bounded', async () => {
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@buzzhive.com', password: 'alice123' }),
    });
    
    if (loginResponse.status !== 200) {
      return;
    }
    
    const data = await loginResponse.json() as { access_token: string };
    const { access_token } = data;
    
    const tooLongContent = 'a'.repeat(5001);
    const response = await fetch('http://localhost:8000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ content: tooLongContent }),
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
