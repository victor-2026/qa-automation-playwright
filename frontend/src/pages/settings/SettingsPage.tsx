import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../lib/i18n'
import { usersApi } from '../../api/users'
import client from '../../api/client'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth()
  const { t, lang, setLang } = useI18n()
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await usersApi.updateMe({ display_name: displayName, bio, is_private: isPrivate })
      await refreshUser()
      toast.success(t('settings.saved'))
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await usersApi.uploadAvatar(file)
      await refreshUser()
      toast.success('Avatar updated!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    }
  }

  const handleReset = async () => {
    if (!confirm(t('settings.reset_confirm'))) return
    setResetting(true)
    try {
      await client.post('/reset')
      toast.success(t('settings.reset_done'))
      setTimeout(() => logout(), 1500)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed')
    } finally { setResetting(false) }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('settings.title')}</h1>

      <div className="card space-y-4">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
          <div className="flex gap-2">
            <button onClick={() => setLang('en')} data-testid="lang-en"
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-colors', lang === 'en' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
              English
            </button>
            <button onClick={() => setLang('ru')} data-testid="lang-ru"
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-colors', lang === 'ru' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
              Русский
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.avatar')}</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.display_name[0]
              )}
            </div>
            <label className="btn-secondary cursor-pointer text-sm">
              {t('settings.change_avatar')}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.display_name')}</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" maxLength={100} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.bio')}</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" rows={3} maxLength={500} />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="private" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-gray-300" />
          <label htmlFor="private" className="text-sm">{t('settings.private')}</label>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>

      <div className="card mt-4">
        <h2 className="font-semibold mb-2">{t('settings.account_info')}</h2>
        <div className="text-sm space-y-1 text-gray-600">
          <p>Username: <span className="font-mono">@{user?.username}</span></p>
          <p>Email: <span className="font-mono">{user?.email}</span></p>
          <p>Role: <span className="font-mono">{user?.role}</span></p>
          <p>User ID: <span className="font-mono text-xs">{user?.id}</span></p>
        </div>
      </div>

      <div className="card mt-4 border-red-200 bg-red-50/50">
        <h2 className="font-semibold mb-2 text-red-700 flex items-center gap-2">
          <RotateCcw size={18} />
          {t('settings.reset_title')}
        </h2>
        <p className="text-sm text-red-600 mb-3">{t('settings.reset_desc')}</p>
        <button onClick={handleReset} disabled={resetting} data-testid="reset-database-btn" className="btn-danger flex items-center gap-2">
          <RotateCcw size={16} className={resetting ? 'animate-spin' : ''} />
          {resetting ? t('settings.resetting') : t('settings.reset_btn')}
        </button>
      </div>
    </div>
  )
}
