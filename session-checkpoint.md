# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-28
**Status:** COMPLETE

## Session 12 — Bug fixes + UI Fuzz + Stress

### BUG-005 (False Positive)
- React экранирует строки — XSS нет
- Фикс: тест проверяет `innerHTML` на `&lt;`

### BUG-006 (Fixed)
- `PostCard.tsx`: `Math.max(0, likesCount)`

### BUG-001 (Fixed)
- `SafeContent` — `BeforeValidator` вырезает control chars, surrogates, non-characters
- На всех текстовых полях (Post, Comment, Message, User)

### BUG-003/004 (Fixed)
- `auth.py:register()` — TOCTOU убран, `IntegrityError` → 409

### BUG-002 (Fixed)
- `follows.py` — `.with_for_update()` на SELECT Follow в follow + unfollow

### Stage 4 — UI Fuzzing (NEW)
- `e2e/mutation/ui-fuzz.spec.ts` — 10 тестов (FUZZ-001..010)
- Login/post/search/register form fuzzing

### Stress Tests (Fixed)
- `e2e/load/stress-load.spec.ts`:
  - `APP_BASE_URL` env var (не hardcoded IP)
  - Warm-up перед тестами
  - Render: 5 users/3 posts/15 API (не 20/10/50)
  - Timeouts: 30s на Render, 10s локально

### Files Modified
- `e2e/mutation/ui-fuzz.spec.ts` — NEW, 10 tests
- `e2e/load/stress-load.spec.ts` — rewritten
- `e2e/mutation/TEST_ARCHITECTURE.md` — +Stage 4
- `backend/app/schemas/common.py` — SafeContent
- `backend/app/schemas/post.py` — SafeContent
- `backend/app/schemas/comment.py` — SafeContent, +UserBrief
- `backend/app/schemas/message.py` — SafeContent
- `backend/app/schemas/user.py` — SafeContent
- `backend/app/api/auth.py` — register race fix
- `backend/app/api/follows.py` — follow/unfollow +for_update
- `frontend/src/components/post/PostCard.tsx` — Math.max for likes
- `e2e/mutation/db-mutation.spec.ts` — fixed XSS/likes tests
- `BUGS.md` — updated closed bugs

## Next Steps
- Verify Render deploy for `f45f16d`
- Обновить CI workflows (добавить stress/UI fuzz в smoke?)
