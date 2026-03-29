import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, MessageCircle, BarChart3 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { useI18n } from '../../lib/i18n'
import type { AdminStats } from '../../types'

export default function AdminDashboard() {
  const { t } = useI18n()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    adminApi.getStats().then((res) => setStats(res.data))
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('admin.dashboard')}</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card" data-testid="admin-stats-users-count">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users size={16} /> {t('admin.stats_users')}
            </div>
            <p className="text-2xl font-bold">{stats.total_users}</p>
            <p className="text-xs text-gray-400">{stats.active_users} {t('admin.active')}</p>
          </div>
          <div className="card" data-testid="admin-stats-posts-count">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <FileText size={16} /> {t('admin.stats_posts')}
            </div>
            <p className="text-2xl font-bold">{stats.total_posts}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <MessageCircle size={16} /> {t('admin.stats_comments')}
            </div>
            <p className="text-2xl font-bold">{stats.total_comments}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <BarChart3 size={16} /> {t('admin.stats_messages')}
            </div>
            <p className="text-2xl font-bold">{stats.total_messages}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Link to="/admin/users" className="card block hover:bg-gray-50">
          <h3 className="font-medium">{t('admin.users_mgmt')}</h3>
          <p className="text-sm text-gray-500">{t('admin.users_desc')}</p>
        </Link>
        <Link to="/admin/content" className="card block hover:bg-gray-50">
          <h3 className="font-medium">{t('admin.content_mod')}</h3>
          <p className="text-sm text-gray-500">{t('admin.content_desc')}</p>
        </Link>
      </div>
    </div>
  )
}
