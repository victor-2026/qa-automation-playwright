import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Search, MessageCircle, Bell, Bookmark, User, Settings, Shield, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi } from '../../api/notifications'
import { messagesApi } from '../../api/messages'
import { cn } from '../../lib/utils'
import { useI18n } from '../../lib/i18n'

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useI18n()
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchCounts = async () => {
      try {
        const [notifsRes, convsRes] = await Promise.all([
          notificationsApi.getUnreadCount(),
          messagesApi.listConversations(),
        ])
        setUnreadNotifs(notifsRes.data.count)
        const totalUnread = convsRes.data.items.reduce((sum, c) => sum + c.unread_count, 0)
        setUnreadMessages(totalUnread)
      } catch { /* ignore */ }
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 15000)
    window.addEventListener('badges:refresh', fetchCounts)
    return () => { clearInterval(interval); window.removeEventListener('badges:refresh', fetchCounts) }
  }, [user])

  const navItems = [
    { path: '/', icon: Home, label: t('nav.feed'), testId: 'nav-feed', badge: 0 },
    { path: '/explore', icon: Compass, label: t('nav.explore'), testId: 'nav-explore', badge: 0 },
    { path: '/search', icon: Search, label: t('nav.search'), testId: 'nav-search', badge: 0 },
    { path: '/messages', icon: MessageCircle, label: t('nav.messages'), testId: 'nav-messages', badge: unreadMessages },
    { path: '/notifications', icon: Bell, label: t('nav.notifications'), testId: 'nav-notifications', badge: unreadNotifs },
    { path: '/bookmarks', icon: Bookmark, label: t('nav.bookmarks'), testId: 'nav-bookmarks', badge: 0 },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-200 bg-white p-4">
      <Link to="/" className="flex items-center gap-2.5 px-3 py-2 mb-6" data-testid="nav-logo">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">QA</div>
        <span className="text-lg font-bold text-gray-900">Sandbox</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ path, icon: Icon, label, testId, badge }) => (
          <Link
            key={path}
            to={path}
            data-testid={testId}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === path
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <div className="relative">
              <Icon size={20} />
              {badge > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                  data-testid={`${testId}-badge`}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        ))}

        {user && (
          <Link
            to={`/profile/${user.username}`}
            data-testid="nav-profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/profile')
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <User size={20} />
            <span>{t('nav.profile')}</span>
          </Link>
        )}

        <Link
          to="/settings"
          data-testid="nav-settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-brand-50 text-brand-700'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <Settings size={20} />
          <span>{t('nav.settings')}</span>
        </Link>

        {user && (user.role === 'admin' || user.role === 'moderator') && (
          <Link
            to="/admin"
            data-testid="nav-admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Shield size={20} />
            <span>{t('nav.admin')}</span>
          </Link>
        )}

        <div className="border-t border-gray-100 my-2" />

        <Link
          to="/docs"
          data-testid="nav-docs"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/docs'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-emerald-600 hover:bg-emerald-50'
          )}
        >
          <BookOpen size={20} />
          <span>{t('nav.docs')}</span>
        </Link>
      </nav>

      <div className="flex items-center gap-1 px-3 py-2">
        <button onClick={() => setLang('en')} className={cn('text-xs px-2 py-1 rounded', lang === 'en' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-400 hover:text-gray-600')} data-testid="lang-en">EN</button>
        <button onClick={() => setLang('ru')} className={cn('text-xs px-2 py-1 rounded', lang === 'ru' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-400 hover:text-gray-600')} data-testid="lang-ru">RU</button>
      </div>

      {user && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <Link to={`/profile/${user.username}`} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">
              {user.display_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.display_name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            data-testid="auth-logout-btn"
            className="w-full mt-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-left"
          >
            {t('nav.logout')}
          </button>
        </div>
      )}
    </aside>
  )
}
