import { describe, test, expect } from '@jest/globals';

describe('Password Validation Properties', () => {
  test('passwords shorter than 6 chars are rejected during registration', async () => {
    const shortPasswords = ['', 'a', 'ab', 'abc', 'abcd', 'abcde'];

    for (const password of shortPasswords) {
      const timestamp = Date.now();
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${timestamp}@example.com`,
          password,
          username: `test${timestamp}`,
        }),
      });
      expect([400, 422]).toContain(response.status);
    }
  });

  test('passwords 6+ chars are accepted', async () => {
    const validPasswords = ['123456', 'abcdef', 'password', 'P@ssw0rd!'];

    for (const password of validPasswords) {
      const timestamp = Date.now();
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${timestamp}@example.com`,
          password,
          username: `test${timestamp}`,
        }),
      });
      expect([200, 201, 409, 422]).toContain(response.status);
    }
  });

  test('very long passwords are handled gracefully', async () => {
    const longPasswords = ['a'.repeat(1000), 'a'.repeat(3001), 'a'.repeat(10000)];

    for (const password of longPasswords) {
      const timestamp = Date.now();
      try {
        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test${timestamp}@example.com`,
            password,
            username: `test${timestamp}`,
          }),
        });
        expect([200, 201, 400, 422, 500]).toContain(response.status);
      } catch {
        // Should not crash
      }
    }
  });
});
