# System Invariants - Buzzhive Social Network

Invariant specifications for continuous verification
Generated: 2026-04-14

---

## What Are Invariants?

**Invariant** = A condition that must ALWAYS be true during system operation.

```
Invariant: post.like_count >= 0
```
This must ALWAYS hold, regardless of:
- Concurrent operations
- System state
- User actions
- Edge cases

---

## Authentication Invariants

### INV-AUTH-001: Unauthenticated Users Cannot Access Protected Routes
```typescript
invariant('unauthenticated users blocked from protected routes') => {
  const protectedRoutes = [
    '/api/posts',
    '/api/users/me',
    '/api/notifications',
    '/api/messages',
    '/api/bookmarks',
  ];
  
  for (const route of protectedRoutes) {
    const response = request(route, { noAuth: true });
    expect(response.status).toBe(401);
  }
}
```

### INV-AUTH-002: Banned Users Cannot Authenticate
```typescript
invariant('banned users (is_active=false) cannot login') => {
  const bannedUsers = getBannedUsers();
  
  for (const user of bannedUsers) {
    const loginResult = login(user.email, user.password);
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toContain('deactivated');
  }
}
```

### INV-AUTH-003: Expired Tokens Are Rejected
```typescript
invariant('expired access_token returns 401') => {
  const expiredToken = createExpiredJWT();
  const response = request('/api/auth/me', {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  
  expect(response.status).toBe(401);
}
```

### INV-AUTH-004: JWT Contains Required Claims
```typescript
invariant('JWT always has sub, exp, iat claims') => {
  const token = getAccessToken();
  const decoded = decodeJWT(token);
  
  expect(decoded.sub).toBeDefined();  // user id
  expect(decoded.exp).toBeDefined();  // expiration timestamp
  expect(decoded.iat).toBeDefined();  // issued at timestamp
  expect(decoded.exp).toBeGreaterThan(decoded.iat);  // exp > iat
}
```

---

## Post Invariants

### INV-POST-001: Like Count Never Negative
```typescript
invariant('post.like_count >= 0 for all posts') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(post.like_count).toBeGreaterThanOrEqual(0);
  }
}
```

### INV-POST-002: Comment Count Never Negative
```typescript
invariant('post.comments_count >= 0 for all posts') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(post.comments_count).toBeGreaterThanOrEqual(0);
  }
}
```

### INV-POST-003: Post Content Length Within Limits
```typescript
invariant('post.content.length <= 2000') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(post.content.length).toBeLessThanOrEqual(2000);
  }
}

invariant('post.content is not empty') => {
  const posts = getAllPosts();
  
  for (const post of posts) {
    expect(post.content.trim().length).toBeGreaterThan(0);
  }
}
```

### INV-POST-004: Deleted Posts Not in Public Feed
```typescript
invariant('deleted posts excluded from public feed') => {
  const feed = getPublicFeed();
  
  for (const post of feed) {
    expect(post.is_deleted).toBe(false);
    expect(post.deleted_at).toBeNull();
  }
}
```

### INV-POST-005: User Can Only Delete Own Posts
```typescript
invariant('users cannot delete other users posts') => {
  const posts = getAllPosts();
  const currentUser = getCurrentUser();
  
  for (const post of posts) {
    if (post.user_id !== currentUser.id) {
      const deleteResult = deletePost(post.id);
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toContain('forbidden');
    }
  }
}
```

---

## User Invariants

### INV-USER-001: Follower Count Consistency
```typescript
invariant('user.followers_count matches actual follower list') => {
  const users = getAllUsers();
  
  for (const user of users) {
    const actualFollowers = getFollowers(user.username);
    expect(user.followers_count).toBe(actualFollowers.length);
  }
}

invariant('user.following_count matches actual following list') => {
  const users = getAllUsers();
  
  for (const user of users) {
    const actualFollowing = getFollowing(user.username);
    expect(user.following_count).toBe(actualFollowing.length);
  }
}
```

### INV-USER-002: Posts Count Consistency
```typescript
invariant('user.posts_count matches actual posts list') => {
  const users = getAllUsers();
  
  for (const user of users) {
    const actualPosts = getUserPosts(user.username);
    expect(user.posts_count).toBe(actualPosts.length);
  }
}
```

### INV-USER-003: Cannot Follow Self
```typescript
invariant('user cannot follow themselves') => {
  const currentUser = getCurrentUser();
  const result = followUser(currentUser.username);
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('cannot follow yourself');
}
```

### INV-USER-004: At Least One Admin Exists
```typescript
invariant('system always has at least one admin') => {
  const admins = getUsersByRole('admin');
  expect(admins.length).toBeGreaterThanOrEqual(1);
}
```

---

## Social Invariants

### INV-SOCIAL-001: Duplicate Follow Returns Conflict
```typescript
invariant('liking already-liked post returns 409') => {
  const post = getPostWithCurrentUserLike();
  const result = likePost(post.id);
  
  expect(result.status).toBe(409);
  expect(result.error_code).toBe('CONFLICT');
}

invariant('following already-followed user returns 409') => {
  const following = getFollowingList();
  if (following.length > 0) {
    const target = following[0];
    const result = followUser(target.username);
    expect(result.status).toBe(409);
  }
}
```

### INV-SOCIAL-002: Follow Request States Valid
```typescript
invariant('follow request status is valid enum') => {
  const validStatuses = ['pending', 'accepted', 'rejected'];
  const requests = getFollowRequests();
  
  for (const request of requests) {
    expect(validStatuses).toContain(request.status);
  }
}
```

---

## Message Invariants

### INV-MSG-001: Unread Count Never Negative
```typescript
invariant('conversation.unread_count >= 0') => {
  const conversations = getConversations();
  
  for (const conv of conversations) {
    expect(conv.unread_count).toBeGreaterThanOrEqual(0);
  }
}
```

### INV-MSG-002: Message Sender Exists
```typescript
invariant('all messages have valid sender') => {
  const conversations = getConversations();
  
  for (const conv of conversations) {
    const messages = getMessages(conv.id);
    for (const msg of messages) {
      const sender = getUser(msg.sender_id);
      expect(sender).toBeDefined();
      expect(sender.is_active).toBe(true);
    }
  }
}
```

### INV-MSG-003: Only Participants Can View Conversation
```typescript
invariant('non-participant cannot access conversation') => {
  const conv = getConversation(id);
  const nonParticipant = getUserNotInConversation(id);
  
  const result = request(`/api/conversations/${id}`, {
    user: nonParticipant
  });
  
  expect(result.status).toBe(403);
}
```

---

## Notification Invariants

### INV-NOTIF-001: Notification Points to Valid Resource
```typescript
invariant('all notifications have valid target') => {
  const notifications = getNotifications();
  
  for (const notif of notifications) {
    if (notif.type === 'like') {
      const post = getPost(notif.target_id);
      expect(post).toBeDefined();
    }
    if (notif.type === 'follow') {
      const user = getUser(notif.target_id);
      expect(user).toBeDefined();
    }
  }
}
```

### INV-NOTIF-002: Read Status Consistent
```typescript
invariant('notification read status is boolean') => {
  const notifications = getNotifications();
  
  for (const notif of notifications) {
    expect(typeof notif.is_read).toBe('boolean');
  }
}
```

---

## Admin Invariants

### INV-ADMIN-001: Regular Users Cannot Access Admin Routes
```typescript
invariant('role=user cannot access admin endpoints') => {
  const adminRoutes = [
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/posts',
  ];
  
  const regularUser = loginAsRegularUser();
  
  for (const route of adminRoutes) {
    const response = request(route, { user: regularUser });
    expect(response.status).toBe(403);
  }
}
```

### INV-ADMIN-002: Stats Consistency
```typescript
invariant('admin stats.total_users matches actual user count') => {
  const stats = getAdminStats();
  const actualUsers = getAllUsers();
  
  expect(stats.total_users).toBe(actualUsers.length);
}

invariant('admin stats.total_posts matches actual post count') => {
  const stats = getAdminStats();
  const actualPosts = getAllPosts();
  
  expect(stats.total_posts).toBe(actualPosts.length);
}
```

### INV-ADMIN-003: Cannot Remove Last Admin
```typescript
invariant('cannot ban the last admin') => {
  const admins = getUsersByRole('admin');
  
  if (admins.length === 1) {
    const result = banUser(admins[0].id);
    expect(result.success).toBe(false);
    expect(result.error).toContain('last admin');
  }
}
```

---

## System Invariants

### INV-SYS-001: Seed Data Always Present After Reset
```typescript
invariant('after reset: 8 seed users exist') => {
  resetDatabase();
  const users = getAllUsers();
  
  expect(users.length).toBeGreaterThanOrEqual(8);
}

invariant('after reset: seed posts exist') => {
  resetDatabase();
  const posts = getAllPosts();
  
  expect(posts.length).toBeGreaterThanOrEqual(25);
}

invariant('after reset: seed users are active') => {
  resetDatabase();
  const seedEmails = ['alice@buzzhive.com', 'bob@buzzhive.com', ...];
  
  for (const email of seedEmails) {
    const user = getUserByEmail(email);
    expect(user.is_active).toBe(true);
  }
}
```

### INV-SYS-002: No Orphaned Records
```typescript
invariant('no comments without parent post') => {
  const comments = getAllComments();
  
  for (const comment of comments) {
    const post = getPost(comment.post_id);
    expect(post).toBeDefined();
  }
}

invariant('no likes without parent post') => {
  const likes = getAllLikes();
  
  for (const like of likes) {
    const post = getPost(like.post_id);
    expect(post).toBeDefined();
  }
}
```

---

## Security Invariants

### INV-SEC-001: XSS Content Not Executed
```typescript
invariant('XSS payloads rendered as text, not HTML') => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert('xss')",
  ];
  
  const posts = getAllPosts();
  
  for (const post of posts) {
    // Script tags should not appear in DOM
    expect(post.content).not.toContain('<script>');
    // No event handlers
    expect(post.content).not.toContain('onerror=');
    expect(post.content).not.toContain('onload=');
  }
}
```

### INV-SEC-002: SQL Injection Safe
```typescript
invariant('SQL injection attempts stored as plain text') => {
  const sqlPayloads = [
    "'; DROP TABLE users;--",
    "' OR '1'='1",
    "1; DELETE FROM posts",
  ];
  
  // These should be stored and retrieved safely
  for (const payload of sqlPayloads) {
    createPost({ content: payload });
    const post = getPostLatest();
    
    // Should be stored exactly as entered
    expect(post.content).toBe(payload);
    
    // Should not affect other data
    const userCount = query('SELECT COUNT(*) FROM users');
    expect(userCount).toBeGreaterThan(0);
  }
}
```

---

## Summary

| Category | Invariants |
|---------|------------|
| Authentication | 4 |
| Posts | 5 |
| Users | 4 |
| Social | 2 |
| Messages | 3 |
| Notifications | 2 |
| Admin | 3 |
| System | 2 |
| Security | 2 |
| **TOTAL** | **27** |

---

## Running Invariants

Invariants can be run as:
1. **Continuous background checks** - monitor in production
2. **CI/CD pipeline tests** - fail build if violated
3. **Scheduled jobs** - alert on violations

```bash
# Run all invariants
npm test -- --grep "invariant"

# Run specific category
npm test -- --grep "INV-AUTH"
```
