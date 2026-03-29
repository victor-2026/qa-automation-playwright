import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../lib/i18n'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { user, register, loading } = useAuth()
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', display_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      toast.success(t('auth.created'))
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-50 px-4 relative">
      <div className="absolute top-4 right-4 flex gap-1">
        <button onClick={() => setLang('en')} className={`text-xs px-2 py-1 rounded ${lang === 'en' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`} data-testid="lang-en">EN</button>
        <button onClick={() => setLang('ru')} className={`text-xs px-2 py-1 rounded ${lang === 'ru' ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`} data-testid="lang-ru">RU</button>
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg shadow-brand-200">QA</div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{t('auth.create_account')}</h1>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">{t('auth.create_account')}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" data-testid="auth-error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.display_name')}</label>
              <input
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                data-testid="auth-display-name-input"
                className="input-field"
                placeholder="Your Name"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.username')}</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                data-testid="auth-username-input"
                className="input-field"
                placeholder="your_username"
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-zA-Z0-9_]+$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="auth-email-input"
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                data-testid="auth-password-input"
                className="input-field"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="auth-register-btn"
              className="btn-primary w-full"
            >
              {submitting ? t('auth.creating') : t('auth.create_account')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-brand-600 hover:underline">
              {t('auth.signin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
