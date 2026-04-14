# Property-Based Testing (PBT) - Buzzhive Social Network

Property-based test specifications
Generated: 2026-04-14

---

## Authentication Properties

### Email Validation Properties

#### Property 1: Valid Emails Accepted
```typescript
property('all valid email formats are accepted') => {
  const validEmails = [
    'simple@example.com',
    'user.name@domain.com',
    'user+tag@domain.com',
    'user@sub.domain.com',
    'user123@domain.co.uk',
    'a@b.co',
  ];
  
  for (const email of validEmails) {
    const isValid = validateEmail(email);
    expect(isValid).toBe(true);
  }
}
```

#### Property 2: Invalid Emails Rejected
```typescript
property('all invalid email formats are rejected') => {
  const invalidEmails = [
    'plaintext',
    'user@',
    '@domain.com',
    'user@domain',
    'user@.com',
    'user@@domain.com',
    'user name@domain.com',
    'user@domain..com',
    '',
    '   ',
  ];
  
  for (const email of invalidEmails) {
    const isValid = validateEmail(email);
    expect(isValid).toBe(false);
  }
}
```

#### Property 3: Email Normalization
```typescript
property('email is case-insensitive') => {
  const variations = [
    'User@Domain.COM',
    'USER@domain.com',
    'user@DOMAIN.COM',
  ];
  
  const normalized = 'user@domain.com';
  
  for (const email of variations) {
    expect(normalizeEmail(email)).toBe(normalized);
  }
}
```

---

### Password Validation Properties

#### Property 4: Password Minimum Length
```typescript
property('passwords shorter than 6 chars are rejected') => {
  for (let len = 0; len < 6; len++) {
    const password = 'a'.repeat(len);
    const isValid = validatePassword(password);
    expect(isValid).toBe(false);
  }
}

property('passwords 6+ chars are accepted') => {
  for (let len = 6; len <= 100; len++) {
    const password = 'a'.repeat(len);
    const isValid = validatePassword(password);
    expect(isValid).toBe(true);
  }
}
```

#### Property 4b: Password Maximum Length
```typescript
property('very long passwords are handled gracefully') => {
  const longPasswords = [
    'a'.repeat(1000),
    'a'.repeat(3001),
    'a'.repeat(10000),
  ];
  
  for (const password of longPasswords) {
    const result = validatePassword(password);
    // Should not crash, return boolean
    expect(typeof result).toBe('boolean');
  }
}
```

---

### JWT Token Properties

#### Property 5: Token Format
```typescript
property('access_token follows JWT format') => {
  const token = getAccessToken();
  
  // JWT has 3 parts separated by dots
  const parts = token.split('.');
  expect(parts.length).toBe(3);
  
  // Each part is base64 encoded
  for (const part of parts) {
    expect(isBase64(part)).toBe(true);
  }
}

property('refresh_token follows JWT format') => {
  const token = getRefreshToken();
  const parts = token.split('.');
  expect(parts.length).toBe(3);
}
```

#### Property 6: Token Contains Claims
```typescript
property('access_token contains required claims') => {
  const decoded = decodeJWT(getAccessToken());
  
  expect(decoded).toHaveProperty('sub');  // user id
  expect(decoded).toHaveProperty('exp');  // expiration
  expect(decoded).toHaveProperty('iat');  // issued at
  expect(decoded).toHaveProperty('role'); // user role
}
```

---

## Post Properties

### Content Validation

#### Property 7: Post Length Limits
```typescript
property('posts over 2000 chars are rejected') => {
  for (let len = 2001; len <= 5000; len += 500) {
    const content = 'a'.repeat(len);
    const isValid = validatePostContent(content);
    expect(isValid).toBe(false);
  }
}

property('posts 1-2000 chars are accepted') => {
  const validLengths = [1, 100, 1000, 2000];
  
  for (const len of validLengths) {
    const content = 'a'.repeat(len);
    const isValid = validatePostContent(content);
    expect(isValid).toBe(true);
  }
}
```

#### Property 8: Like Count Never Negative
```typescript
property('like_count is always >= 0') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(post.like_count).toBeGreaterThanOrEqual(0);
  }
}

property('like_count is integer') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(Number.isInteger(post.like_count)).toBe(true);
  }
}
```

#### Property 9: Like Count Consistency
```typescript
property('liking increments count by 1') => {
  const before = getPost(postId).like_count;
  likePost(postId);
  const after = getPost(postId).like_count;
  
  expect(after).toBe(before + 1);
}

property('unliking decrements count by 1') => {
  const before = getPost(postId).like_count;
  unlikePost(postId);
  const after = getPost(postId).like_count;
  
  expect(after).toBe(before - 1);
}
```

---

## User Properties

### Profile Properties

#### Property 10: Follower Count Consistency
```typescript
property('follower_count matches actual followers list') => {
  const user = getUser(username);
  const followers = getFollowers(username);
  
  expect(user.followers_count).toBe(followers.length);
}

property('following_count matches actual following list') => {
  const user = getUser(username);
  const following = getFollowing(username);
  
  expect(user.following_count).toBe(following.length);
}
```

#### Property 11: Self-Follow Prevention
```typescript
property('user cannot follow themselves') => {
  const userId = getCurrentUser().id;
  const result = followUser(userId);
  
  expect(result).toBe('error');
  expect(result.message).toContain('cannot follow yourself');
}
```

---

## Social Properties

### Follow Properties

#### Property 12: Duplicate Follow Prevention
```typescript
property('liking same post twice returns conflict') => {
  likePost(postId);
  const result = likePost(postId); // Second like
  
  expect(result.status).toBe(409);
  expect(result.error_code).toBe('CONFLICT');
}

property('following same user twice returns conflict') => {
  followUser(targetUserId);
  const result = followUser(targetUserId); // Second follow
  
  expect(result.status).toBe(409);
}
```

---

## Message Properties

#### Property 13: Message Count Never Negative
```typescript
property('unread_count is always >= 0') => {
  const conversations = getConversations();
  
  for (const conv of conversations) {
    expect(conv.unread_count).toBeGreaterThanOrEqual(0);
  }
}

property('total message count matches actual messages') => {
  const conv = getConversation(convId);
  const messages = getMessages(convId);
  
  expect(conv.message_count).toBe(messages.length);
}
```

---

## API Response Properties

### HTTP Status Code Properties

#### Property 14: Error Responses Always Have Body
```typescript
property('4xx responses have error detail') => {
  const errorResponses = [
    { endpoint: '/auth/login', body: { wrong: 'credentials' } },
    { endpoint: '/posts/999', method: 'GET' },
    { endpoint: '/auth/register', body: { existing: 'email' } },
  ];
  
  for (const req of errorResponses) {
    const response = makeRequest(req);
    if (response.status >= 400 && response.status < 500) {
      expect(response.body).toHaveProperty('detail');
    }
  }
}
```

#### Property 15: Successful Responses Have Expected Structure
```typescript
property('POST /auth/login returns tokens') => {
  const response = post('/auth/login', {
    email: 'alice@buzzhive.com',
    password: 'alice123'
  });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('access_token');
  expect(response.body).toHaveProperty('refresh_token');
}

property('GET /auth/me returns user object') => {
  const response = get('/auth/me', { token });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('email');
  expect(response.body).toHaveProperty('username');
}
```

---

## Invariants (System-Wide)

### Property 16: Core Invariants
```typescript
invariant('user count never negative') => {
  const stats = getAdminStats();
  expect(stats.total_users).toBeGreaterThanOrEqual(0);
}

invariant('post count never negative') => {
  const stats = getAdminStats();
  expect(stats.total_posts).toBeGreaterThanOrEqual(0);
}

invariant('banned user cannot login') => {
  const bannedUser = getUser('frank');
  if (bannedUser.is_active === false) {
    const loginResult = login(bannedUser);
    expect(loginResult.success).toBe(false);
  }
}

invariant('deleted post not in public feed') => {
  const deletedPost = getDeletedPost();
  const feed = getFeed();
  
  expect(feed).not.toContain(deletedPost);
}
```

---

## Data Integrity Properties

### Property 17: Relational Consistency
```typescript
property('user.followers_count == count(users who follow user)') => {
  const users = getAllUsers();
  
  for (const user of users) {
    const actualFollowers = users.filter(u => u.following.includes(user.id));
    expect(user.followers_count).toBe(actualFollowers.length);
  }
}

property('post.comments_count == count(comments on post)') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    const comments = getComments(post.id);
    expect(post.comments_count).toBe(comments.length);
  }
}

property('conversation.unread_count == count(unread messages)') => {
  const conversations = getConversations();
  
  for (const conv of conversations) {
    const messages = getMessages(conv.id);
    const unread = messages.filter(m => !m.is_read);
    expect(conv.unread_count).toBe(unread.length);
  }
}
```

---

## Summary

| Category | Properties |
|----------|------------|
| Authentication | 6 |
| Posts | 3 |
| Users | 2 |
| Social | 1 |
| Messages | 1 |
| API Responses | 2 |
| Invariants | 4 |
| Data Integrity | 3 |
| **TOTAL** | **22** |

---

## Running PBT

Property-based testing frameworks:
- **JavaScript**: fast-check, jsverify
- **Python**: hypothesis
- **TypeScript**: @fast-check/test

```bash
# Example with fast-check
npx fast-check --property "emailValidation"
```
