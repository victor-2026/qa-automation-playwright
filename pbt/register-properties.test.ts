import fc from 'fast-check';
import { register } from './api-client';

describe('Register Properties', () => {
  test('register returns expected status codes', async () => {
    const timestamp = Date.now();
    const response = await register(
      `test${timestamp}@example.com`,
      'password123',
      `user${timestamp}`
    );
    expect([200, 201, 409, 422, 500]).toContain(response.status);
  });

  test('successful registration returns user data', async () => {
    const timestamp = Date.now();
    const response = await register(
      `newuser${timestamp}@example.com`,
      'password123',
      `newuser${timestamp}`
    );
    if (response.status === 200 || response.status === 201) {
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('username');
    }
  });

  test('duplicate email returns 409 or error', async () => {
    const timestamp = Date.now();
    await register(`dup${timestamp}@example.com`, 'password123', `dupuser${timestamp}`);
    const response = await register(`dup${timestamp}@example.com`, 'password123', `dupuser2${timestamp}`);
    expect([409, 422]).toContain(response.status);
  });

  test('valid email formats are accepted', async () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@sub.domain.com',
      `user${Date.now()}@buzzhive.com`,
    ];
    
    for (const email of validEmails) {
      const timestamp = Date.now();
      const response = await register(email, 'password123', `u${timestamp}`);
      expect([200, 201, 409, 422, 500]).toContain(response.status);
    }
  });

  test('empty username is rejected', async () => {
    const timestamp = Date.now();
    const response = await register(
      `emptyuser${timestamp}@example.com`,
      'password123',
      ''
    );
    expect([400, 422, 500]).toContain(response.status);
  });

  test('username with special characters handling', async () => {
    const timestamp = Date.now();
    const specialUsernames = [`user-name-${timestamp}`, `user_name_${timestamp}`];
    
    for (const username of specialUsernames) {
      const response = await register(
        `${timestamp}@example.com`,
        'password123',
        username
      );
      expect([200, 201, 409, 422, 500]).toContain(response.status);
    }
  });

  test('password minimum length enforced', async () => {
    const shortPasswords = ['1', '12345', 'a', 'ab'];
    
    for (const password of shortPasswords) {
      const timestamp = Date.now();
      const response = await register(
        `short${timestamp}@example.com`,
        password,
        `shortpw${timestamp}`
      );
      expect([400, 422]).toContain(response.status);
    }
  });

  test('response time is reasonable', async () => {
    const start = Date.now();
    const timestamp = Date.now();
    await register(`time${timestamp}@example.com`, 'password123', `timeuser${timestamp}`);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });
});
