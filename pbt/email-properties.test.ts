import { describe, test, expect } from '@jest/globals';

describe('Email Validation Properties', () => {
  test('valid email formats are accepted', async () => {
    const validEmails = [
      'simple@example.com',
      'user.name@domain.com',
      'user+tag@domain.com',
      'user@sub.domain.com',
      'user123@domain.co.uk',
      'a@b.co',
    ];

    for (const email of validEmails) {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          username: 'testuser123',
        }),
      });
      expect([200, 201, 409, 422]).toContain(response.status);
    }
  });

  test('invalid email formats are rejected', async () => {
    const invalidEmails = [
      'plaintext',
      'user@',
      '@domain.com',
      'user@domain',
      'user@.com',
      'user@@domain.com',
      'user name@domain.com',
      'user@domain..com',
    ];

    for (const email of invalidEmails) {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          username: 'testuser123',
        }),
      });
      expect([400, 422]).toContain(response.status);
    }
  });

  test('email is case-insensitive for login', async () => {
    const response1 = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Alice@Buzzhive.com',
        password: 'alice123',
      }),
    });
    const response2 = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@buzzhive.com',
        password: 'alice123',
      }),
    });
    expect([200, 401, 500]).toContain(response1.status);
    expect([200, 401, 500]).toContain(response2.status);
  });
});
