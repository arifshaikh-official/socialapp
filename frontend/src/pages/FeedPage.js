import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import api from '../utils/api';

const FILTERS = [
  { label: 'All Posts', value: 'latest' },
  { label: 'For You', value: 'foryou' },
  { label: 'Most Liked', value: 'mostLiked' },
  { label: 'Most Commented', value: 'mostCommented' },
];

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const loaderRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum = 1, sortFilter = filter, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=10&sort=${sortFilter}`);
      const newPosts = res.data.posts;
      setPosts(prev => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts(1, filter, true);
  }, [filter]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          fetchPosts(page + 1, filter);
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, filter, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  // Client-side search filter
  const displayedPosts = searchQuery.trim()
    ? posts.filter(p =>
        p.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  return (
    <div className="feed-layout">
      <Navbar onSearch={setSearchQuery} />

      <div className="feed-container">
        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-tab ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <CircularProgress />
            <p style={{ color: '#65676B', marginTop: 12 }}>Loading posts...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>
              {searchQuery ? 'No posts match your search' : 'No posts yet!'}
            </h3>
            <p style={{ fontSize: '0.9rem' }}>
              {searchQuery ? 'Try different keywords' : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          <>
            {displayedPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
              />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={loaderRef} style={{ height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {loadingMore && <CircularProgress size={28} />}
              {!loadingMore && page >= totalPages && posts.length > 0 && (
                <p style={{ color: '#65676B', fontSize: '0.85rem' }}>You've seen all posts ✨</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
