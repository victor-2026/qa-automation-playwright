# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-28
**Status:** COMPLETE

## Session 12 — Bug fixes: BUG-001..006

### BUG-005 (False Positive, Fixed)
- React автоматически экранирует строки в JSX — XSS нет
- `dangerouslySetInnerHTML` не используется нигде в проекте
- Поправлен тест: проверять `innerHTML` на `&lt;`, а не `textContent`

### BUG-006 (Fixed)
- `PostCard.tsx`: `{Math.max(0, likesCount)}` — отрицательные значения не показываются
- Поправлен тест: ожидает `\d+` вместо `not.toMatch(/^-\d+$/)`

### BUG-001 (Fixed)
- Добавлен `SafeContent` — `Annotated[str, BeforeValidator(...)]` в `common.py`
- Валидатор вырезает control chars (Cc), surrogates (Cs), non-characters (`U+FDD0-U+FDEF`, `U+FFFE-U+FFFF`)
- Применён ко всем текстовым полям: PostCreate/Update, CommentCreate/Update, MessageCreate, ConversationCreate.name, UserRegister/Update.display_name/bio

### BUG-003/004 (Fixed)
- `auth.py:register()` — удалён check-then-insert паттерн (TOCTOU race)
- `IntegrityError` ловится → `ConflictException` (409)
- Параллельная регистрация: один succeeds (201), остальные → 409

### BUG-002 (Fixed)
- `follows.py:follow_user()` + `unfollow_user()` — `.with_for_update()` на SELECT Follow
- Serializes concurrent follow/unfollow для одной пары пользователей
- `IntegrityError` catch как safety net для follow_user

### Files Modified
- `backend/app/schemas/common.py` — SafeContent тип + regex control chars
- `backend/app/schemas/post.py` — SafeContent на content поля
- `backend/app/schemas/comment.py` — SafeContent, +UserBrief import
- `backend/app/schemas/message.py` — SafeContent
- `backend/app/schemas/user.py` — SafeContent на display_name/bio
- `backend/app/api/auth.py` — register() race fix
- `backend/app/api/follows.py` — follow/unfollow +for_update()
- `frontend/src/components/post/PostCard.tsx` — Math.max for likes
- `e2e/mutation/db-mutation.spec.ts` — fix XSS test, fix likes test
- `BUGS.md` — updated fixed bugs

## Next Steps
1. Verify Render deploy for `9f602cd`
2. Stress tests — fix timeout on Render free tier
