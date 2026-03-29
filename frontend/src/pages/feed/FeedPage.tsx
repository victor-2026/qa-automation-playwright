import { useCallback, useEffect, useState } from 'react'
import { postsApi } from '../../api/posts'
import PostCard from '../../components/post/PostCard'
import PostComposer from '../../components/post/PostComposer'
import { useI18n } from '../../lib/i18n'
import type { Post } from '../../types'

export default function FeedPage() {
  const { t } = useI18n()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = useCallback(async (p: number = 1) => {
    try {
      const res = await postsApi.feed({ page: p, per_page: 20 })
      if (p === 1) {
        setPosts(res.data.items)
      } else {
        setPosts((prev) => [...prev, ...res.data.items])
      }
      setHasMore(p < res.data.pages)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPosts(1) }, [loadPosts])

  const handleRefresh = () => { setPage(1); setLoading(true); loadPosts(1) }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadPosts(next)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('feed.title')}</h1>
      <PostComposer onCreated={handleRefresh} />

      {loading ? (
        <div className="text-center py-8 text-gray-400">{t('feed.loading')}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('feed.empty')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('feed.empty_hint')}</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={handleRefresh} />
          ))}
          {hasMore && (
            <button onClick={loadMore} className="btn-secondary w-full mt-2">
              {t('feed.load_more')}
            </button>
          )}
        </>
      )}
    </div>
  )
}
