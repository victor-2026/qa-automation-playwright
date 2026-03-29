import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ru'

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.feed': { en: 'Feed', ru: 'Лента' },
  'nav.explore': { en: 'Explore', ru: 'Обзор' },
  'nav.search': { en: 'Search', ru: 'Поиск' },
  'nav.messages': { en: 'Messages', ru: 'Сообщения' },
  'nav.notifications': { en: 'Notifications', ru: 'Уведомления' },
  'nav.bookmarks': { en: 'Bookmarks', ru: 'Закладки' },
  'nav.profile': { en: 'Profile', ru: 'Профиль' },
  'nav.settings': { en: 'Settings', ru: 'Настройки' },
  'nav.admin': { en: 'Admin', ru: 'Админ' },
  'nav.docs': { en: 'QA Docs', ru: 'Документация' },
  'nav.logout': { en: 'Log out', ru: 'Выйти' },

  // Auth
  'auth.title': { en: 'QA Sandbox', ru: 'QA Sandbox' },
  'auth.subtitle': { en: 'Social Network for Test Automation Practice', ru: 'Соцсеть для практики автоматизации тестирования' },
  'auth.signin': { en: 'Sign in', ru: 'Войти' },
  'auth.signing_in': { en: 'Signing in...', ru: 'Вход...' },
  'auth.signup': { en: 'Sign up', ru: 'Регистрация' },
  'auth.create_account': { en: 'Create account', ru: 'Создать аккаунт' },
  'auth.creating': { en: 'Creating...', ru: 'Создание...' },
  'auth.email': { en: 'Email', ru: 'Эл. почта' },
  'auth.password': { en: 'Password', ru: 'Пароль' },
  'auth.username': { en: 'Username', ru: 'Имя пользователя' },
  'auth.display_name': { en: 'Display Name', ru: 'Отображаемое имя' },
  'auth.no_account': { en: "Don't have an account?", ru: 'Нет аккаунта?' },
  'auth.have_account': { en: 'Already have an account?', ru: 'Уже есть аккаунт?' },
  'auth.quick_login': { en: 'Quick login (test accounts)', ru: 'Быстрый вход (тестовые аккаунты)' },
  'auth.welcome': { en: 'Welcome back!', ru: 'С возвращением!' },
  'auth.created': { en: 'Account created! Please sign in.', ru: 'Аккаунт создан! Войдите.' },

  // Feed
  'feed.title': { en: 'Feed', ru: 'Лента' },
  'feed.loading': { en: 'Loading...', ru: 'Загрузка...' },
  'feed.empty': { en: 'Your feed is empty', ru: 'Ваша лента пуста' },
  'feed.empty_hint': { en: 'Follow people to see their posts here', ru: 'Подпишитесь на людей, чтобы видеть их посты' },
  'feed.load_more': { en: 'Load more', ru: 'Загрузить ещё' },

  // Posts
  'post.composer_placeholder': { en: "What's buzzing?", ru: 'Что нового?' },
  'post.post': { en: 'Post', ru: 'Опубликовать' },
  'post.posting': { en: 'Posting...', ru: 'Публикация...' },
  'post.created': { en: 'Post created!', ru: 'Пост создан!' },
  'post.pinned': { en: 'Pinned post', ru: 'Закреплённый пост' },
  'post.reposted': { en: 'Reposted', ru: 'Репост' },
  'post.quoted': { en: 'Quoted', ru: 'Цитата' },
  'post.edit': { en: 'Edit', ru: 'Редактировать' },
  'post.delete': { en: 'Delete', ru: 'Удалить' },
  'post.delete_confirm': { en: 'Delete this post?', ru: 'Удалить этот пост?' },
  'post.uploading': { en: 'Uploading...', ru: 'Загрузка...' },
  'post.image_uploaded': { en: 'Image uploaded!', ru: 'Изображение загружено!' },

  // Comments
  'comment.placeholder': { en: 'Write a comment...', ru: 'Написать комментарий...' },
  'comment.reply_to': { en: 'Replying to', ru: 'Ответ для' },
  'comment.reply': { en: 'Reply', ru: 'Ответить' },
  'comment.cancel': { en: 'Cancel', ru: 'Отмена' },
  'comment.added': { en: 'Comment added!', ru: 'Комментарий добавлен!' },
  'comment.reply_added': { en: 'Reply added!', ru: 'Ответ добавлен!' },
  'comment.replies': { en: 'replies', ru: 'ответов' },
  'comment.none': { en: 'No comments yet', ru: 'Комментариев пока нет' },

  // Profile
  'profile.follow': { en: 'Follow', ru: 'Подписаться' },
  'profile.unfollow': { en: 'Unfollow', ru: 'Отписаться' },
  'profile.request_follow': { en: 'Request to Follow', ru: 'Запросить подписку' },
  'profile.message': { en: 'Message', ru: 'Написать' },
  'profile.edit': { en: 'Edit profile', ru: 'Редактировать' },
  'profile.following': { en: 'Following', ru: 'Подписки' },
  'profile.followers': { en: 'Followers', ru: 'Подписчики' },
  'profile.posts': { en: 'Posts', ru: 'Посты' },
  'profile.follows_you': { en: 'Follows you', ru: 'Подписан на вас' },
  'profile.joined': { en: 'Joined', ru: 'Регистрация' },
  'profile.no_posts': { en: 'No posts yet', ru: 'Постов пока нет' },

  // Messages
  'messages.title': { en: 'Messages', ru: 'Сообщения' },
  'messages.new': { en: 'New message', ru: 'Новое сообщение' },
  'messages.empty': { en: 'No conversations yet', ru: 'Диалогов пока нет' },
  'messages.empty_hint': { en: 'Start a conversation with someone!', ru: 'Начните диалог с кем-нибудь!' },
  'messages.start': { en: 'Start a conversation', ru: 'Начать диалог' },
  'messages.search_users': { en: 'Search users...', ru: 'Найти пользователя...' },
  'messages.type_message': { en: 'Type a message...', ru: 'Введите сообщение...' },
  'messages.no_messages': { en: 'No messages yet. Say hello!', ru: 'Сообщений пока нет. Поздоровайтесь!' },
  'messages.participants': { en: 'participants', ru: 'участников' },

  // Notifications
  'notifications.title': { en: 'Notifications', ru: 'Уведомления' },
  'notifications.mark_all': { en: 'Mark all read', ru: 'Прочитать все' },
  'notifications.all': { en: 'All', ru: 'Все' },
  'notifications.unread': { en: 'Unread', ru: 'Непрочитанные' },
  'notifications.empty': { en: 'No notifications', ru: 'Нет уведомлений' },
  'notifications.empty_unread': { en: 'No unread notifications', ru: 'Нет непрочитанных' },
  'notif.liked': { en: 'liked your post', ru: 'поставил(а) лайк' },
  'notif.commented': { en: 'commented on your post', ru: 'прокомментировал(а) пост' },
  'notif.followed': { en: 'started following you', ru: 'подписался(-ась) на вас' },
  'notif.follow_request': { en: 'requested to follow you', ru: 'запросил(а) подписку' },
  'notif.reposted': { en: 'reposted your post', ru: 'сделал(а) репост' },
  'notif.mentioned': { en: 'mentioned you', ru: 'упомянул(а) вас' },
  'notif.messaged': { en: 'sent you a message', ru: 'отправил(а) сообщение' },

  // Search
  'search.title': { en: 'Search', ru: 'Поиск' },
  'search.placeholder': { en: 'Search users, posts, hashtags...', ru: 'Поиск по пользователям, постам, хештегам...' },
  'search.users': { en: 'Users', ru: 'Пользователи' },
  'search.posts': { en: 'Posts', ru: 'Посты' },
  'search.hashtags': { en: 'Hashtags', ru: 'Хештеги' },
  'search.no_users': { en: 'No users found', ru: 'Пользователи не найдены' },
  'search.no_posts': { en: 'No posts found', ru: 'Посты не найдены' },
  'search.no_hashtags': { en: 'No hashtags found', ru: 'Хештеги не найдены' },
  'search.searching': { en: 'Searching...', ru: 'Поиск...' },

  // Explore
  'explore.title': { en: 'Explore', ru: 'Обзор' },
  'explore.trending': { en: 'Trending', ru: 'Популярное' },
  'explore.no_posts': { en: 'No posts found', ru: 'Посты не найдены' },

  // Bookmarks
  'bookmarks.title': { en: 'Bookmarks', ru: 'Закладки' },
  'bookmarks.empty': { en: 'No bookmarks yet', ru: 'Закладок пока нет' },
  'bookmarks.empty_hint': { en: 'Save posts to read later', ru: 'Сохраняйте посты, чтобы прочитать позже' },

  // Settings
  'settings.title': { en: 'Settings', ru: 'Настройки' },
  'settings.avatar': { en: 'Avatar', ru: 'Аватар' },
  'settings.change_avatar': { en: 'Change avatar', ru: 'Сменить аватар' },
  'settings.display_name': { en: 'Display Name', ru: 'Отображаемое имя' },
  'settings.bio': { en: 'Bio', ru: 'О себе' },
  'settings.private': { en: 'Private account (follow requests required)', ru: 'Приватный аккаунт (нужен запрос на подписку)' },
  'settings.save': { en: 'Save changes', ru: 'Сохранить' },
  'settings.saving': { en: 'Saving...', ru: 'Сохранение...' },
  'settings.saved': { en: 'Profile updated!', ru: 'Профиль обновлён!' },
  'settings.account_info': { en: 'Account info', ru: 'Информация об аккаунте' },
  'settings.reset_title': { en: 'Reset Sandbox', ru: 'Сброс песочницы' },
  'settings.reset_desc': { en: 'Reset the entire database to its default state. All posts, comments, messages, and user changes will be lost. The 8 test accounts and seed data will be restored.', ru: 'Сбросить всю базу данных до начального состояния. Все посты, комментарии, сообщения и изменения будут удалены. 8 тестовых аккаунтов и данные будут восстановлены.' },
  'settings.reset_btn': { en: 'Reset Database', ru: 'Сбросить базу данных' },
  'settings.resetting': { en: 'Resetting...', ru: 'Сброс...' },
  'settings.reset_confirm': { en: 'This will reset the ENTIRE database to its initial state.\n\nAll your changes, posts, messages will be lost.\n\nAre you sure?', ru: 'Это сбросит ВСЮ базу данных до начального состояния.\n\nВсе ваши изменения, посты, сообщения будут удалены.\n\nВы уверены?' },
  'settings.reset_done': { en: 'Database reset! Logging out...', ru: 'База сброшена! Выход...' },
  'settings.language': { en: 'Language', ru: 'Язык' },

  // Admin
  'admin.dashboard': { en: 'Admin Dashboard', ru: 'Админ-панель' },
  'admin.users_mgmt': { en: 'User Management', ru: 'Управление пользователями' },
  'admin.content_mod': { en: 'Content Moderation', ru: 'Модерация контента' },
  'admin.users_desc': { en: 'Manage roles, verify accounts, ban users', ru: 'Управление ролями, верификация, блокировка' },
  'admin.content_desc': { en: 'Review and moderate posts', ru: 'Проверка и модерация постов' },
  'admin.search': { en: 'Search users...', ru: 'Поиск пользователей...' },
  'admin.ban': { en: 'Ban', ru: 'Забанить' },
  'admin.unban': { en: 'Unban', ru: 'Разбанить' },
  'admin.verify': { en: 'Verify', ru: 'Верифицировать' },
  'admin.verified': { en: 'Verified', ru: 'Верифицирован' },
  'admin.active_posts': { en: 'Active posts', ru: 'Активные посты' },
  'admin.deleted_posts': { en: 'Deleted posts', ru: 'Удалённые посты' },
  'admin.stats_users': { en: 'Users', ru: 'Пользователи' },
  'admin.stats_posts': { en: 'Posts', ru: 'Посты' },
  'admin.stats_comments': { en: 'Comments', ru: 'Комментарии' },
  'admin.stats_messages': { en: 'Messages', ru: 'Сообщения' },
  'admin.active': { en: 'active', ru: 'активных' },

  // Common
  'common.loading': { en: 'Loading...', ru: 'Загрузка...' },
  'common.not_found': { en: 'Not found', ru: 'Не найдено' },
  'common.search': { en: 'Search', ru: 'Поиск' },
  'common.someone': { en: 'Someone', ru: 'Кто-то' },
  'common.posts': { en: 'posts', ru: 'постов' },
}

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('qa-sandbox-lang') as Lang) || 'en'
  })

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('qa-sandbox-lang', newLang)
  }

  const t = (key: string): string => {
    return translations[key]?.[lang] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
