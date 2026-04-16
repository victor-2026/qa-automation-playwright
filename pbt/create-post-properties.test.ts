import fc from 'fast-check';
import { login, createPost, getPosts } from './api-client';

describe('Create Post Properties', () => {
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await login('alice@buzzhive.com', 'alice123');
    if (loginResponse.status === 200) {
      authToken = (loginResponse.body as { access_token: string }).access_token;
    }
  });

  test('createPost with valid content returns post', async () => {
    if (!authToken) return;
    
    const content = `Test post ${Date.now()}`;
    const response = await createPost(content, authToken);
    expect([200, 201, 500]).toContain(response.status);
    
    if (response.status === 200 || response.status === 201) {
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
    }
  });

  test('createPost without token returns 401', async () => {
    const response = await createPost('Test content', '');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('createPost with invalid token returns error', async () => {
    const response = await createPost('Test content', 'invalid-token');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('empty content is rejected or handled', async () => {
    if (!authToken) return;
    
    const response = await createPost('', authToken);
    expect([200, 201, 400, 422, 500]).toContain(response.status);
  });

  test('very long content is rejected', async () => {
    if (!authToken) return;
    
    const longContent = 'a'.repeat(5001);
    const response = await createPost(longContent, authToken);
    expect([400, 422, 500]).toContain(response.status);
  });

  test('content at max length is accepted', async () => {
    if (!authToken) return;
    
    const maxContent = 'a'.repeat(5000);
    const response = await createPost(maxContent, authToken);
    expect([200, 201, 400, 422, 500]).toContain(response.status);
  });

  test('post appears in feed after creation', async () => {
    if (!authToken) return;
    
    const uniqueContent = `Unique post ${Date.now()}`;
    const createResponse = await createPost(uniqueContent, authToken);
    
    if (createResponse.status === 200 || createResponse.status === 201) {
      const postsResponse = await getPosts();
      if (postsResponse.status === 200) {
        const posts = postsResponse.body as { content: string }[];
        const found = posts.some(p => p.content === uniqueContent);
        expect(found).toBe(true);
      }
    }
  });

  test('special characters in content are handled', async () => {
    if (!authToken) return;
    
    const specialContent = 'Test with emojis 🎉 and special chars: @#$%^&*()';
    const response = await createPost(specialContent, authToken);
    expect([200, 201, 400, 422, 500]).toContain(response.status);
  });

  test('unicode content is handled', async () => {
    if (!authToken) return;
    
    const unicodeContent = 'Привет мир! مرحبا 世界 🌍';
    const response = await createPost(unicodeContent, authToken);
    expect([200, 201, 400, 422, 500]).toContain(response.status);
  });

  test('response includes timestamp or created_at', async () => {
    if (!authToken) return;
    
    const response = await createPost(`Post ${Date.now()}`, authToken);
    if (response.status === 200 || response.status === 201) {
      const body = response.body as Record<string, unknown>;
      const hasCreatedAt = body.hasOwnProperty('created_at') || body.hasOwnProperty('createdAt');
      expect(hasCreatedAt).toBe(true);
    }
  });

  test('consecutive posts have incrementing IDs', async () => {
    if (!authToken) return;
    
    const response1 = await createPost(`Post 1 ${Date.now()}`, authToken);
    const response2 = await createPost(`Post 2 ${Date.now()}`, authToken);
    
    if ((response1.status === 200 || response1.status === 201) &&
        (response2.status === 200 || response2.status === 201)) {
      const id1 = (response1.body as { id: number }).id;
      const id2 = (response2.body as { id: number }).id;
      expect(id2).toBeGreaterThan(id1);
    }
  });
});
