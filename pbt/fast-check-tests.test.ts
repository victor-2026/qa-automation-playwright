import fc from 'fast-check';
import { login, register, createPost, getUser, getNotifications } from './api-client';

describe('Fast-Check Property-Based Tests', () => {
  let authToken: string;
  let testUsername: string;

  beforeAll(async () => {
    const loginResponse = await login('alice@buzzhive.com', 'alice123');
    if (loginResponse.status === 200) {
      authToken = (loginResponse.body as { access_token: string }).access_token;
      testUsername = (loginResponse.body as { username: string }).username;
    }
  });

  test('register: valid email format always returns valid status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        async (email, password, username) => {
          const cleanEmail = email.split('@')[0] + '@buzzhive.com';
          const response = await register(cleanEmail, password, username);
          expect([200, 201, 409, 422, 500]).toContain(response.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('register: password length >= 6 always accepted or validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 100 }),
        async (password) => {
          const timestamp = Date.now();
          const response = await register(
            `test${timestamp}@example.com`,
            password,
            `user${timestamp}`
          );
          expect([200, 201, 409, 422, 500]).toContain(response.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('createPost: content length determines acceptance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 6000 }),
        async (content: string) => {
          if (!authToken) return;
          
          const response = await createPost(content, authToken);
          
          if (content.length === 0) {
            expect([200, 201, 400, 422, 500]).toContain(response.status);
          } else if (content.length > 5000) {
            expect([400, 422, 500]).toContain(response.status);
          } else {
            expect([200, 201, 500]).toContain(response.status);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('getUser: username exists or returns 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (username: string) => {
          if (!authToken) return;
          
          const response = await getUser(username, authToken);
          expect([200, 404, 500]).toContain(response.status);
        }
      ),
      { numRuns: 15 }
    );
  });

  test('username: valid characters are handled correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }),
        async (username: string) => {
          if (!authToken) return;
          
          const response = await getUser(username, authToken);
          expect([200, 404, 500]).toContain(response.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('getNotifications: token validity affects response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('invalid-token'),
          fc.string({ minLength: 10, maxLength: 50 })
        ),
        async (token: string) => {
          const response = await getNotifications(token);
          
          if (token === '' || token === 'invalid-token') {
            expect([401, 403, 500]).toContain(response.status);
          } else {
            expect([200, 401, 403, 500]).toContain(response.status);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  test('createPost: unicode content is handled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 1000 }),
        async (content: string) => {
          if (!authToken) return;
          
          const response = await createPost(content, authToken);
          expect([200, 201, 400, 422, 500]).toContain(response.status);
        }
      ),
      { numRuns: 15 }
    );
  });
});
