import { useState, useEffect, useCallback } from 'react';
import { Post, fetchPosts, fetchUserPosts } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { PostActions } from '@/components/posts/PostActions';
import { useAuth } from '@/contexts/AuthContext';
import { stripHtmlTags, truncateText } from '@/utils/text';

interface PostGridProps {
  initialPosts?: Post[];
  showLoadMore: boolean;
  userId?: string;
  showEditDelete?: boolean;
}

const PostGrid = ({
  initialPosts,
  userId,
  showLoadMore = true,
  showEditDelete = false,
}: PostGridProps) => {
  const { user } = useAuth(); // Get the current user
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (userId) {
        // Fetch posts only for the specific user
        response = await fetchUserPosts(userId, pageNum, 10);
      } else {
        // Fetch all posts if no userId is specified
        response = await fetchPosts(pageNum, 10);
      }
      
      if (pageNum === 1) {
        setPosts(response.items || []);
      } else {
        setPosts(prev => [...prev, ...(response.items || [])]);
      }
      
      setHasMore((response.total || 0) > (pageNum * 10));
    } catch (err: unknown) {
      console.error('Failed to load posts:', err);
      setError((err as Error).message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    // Reload posts when userId changes or when not using initialPosts
    if (!initialPosts) {
      loadPosts(1);
    }
  }, [initialPosts, userId, loadPosts]);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };
  
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="h-8 w-8 animate-spin text-commonminds-600" />
      </div>
    );
  }
  
  if (error && posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load posts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => loadPosts()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600">
          {userId ? "This user hasn't published any posts yet." : "Check back later for new content"}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative">
            {/* Only show edit/delete options if showEditDelete is true AND 
                the current user is the post author */}
            {showEditDelete && user && post.author.id === user.id && (
              <PostActions 
                postId={post.id} 
                onDelete={() => {
                  // Remove the post from the local state after deletion
                  setPosts(posts.filter(p => p.id !== post.id));
                }} 
              />
            )}

            {post.cover_image && (
              <Link to={`/post/${post.id}`}>
                <div className="mb-4 rounded-md overflow-hidden aspect-video w-full">
                  <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            )}
            <h3 className="text-xl font-semibold mb-3 pr-8">
              <Link to={`/post/${post.id}`} className="hover:text-commonminds-600 transition-colors">
                {post.title}
              </Link>
            </h3>
            
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>
                  {post.author.username[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link 
                  to={`/profile/${post.author.id}`}
                  className="text-sm font-medium hover:text-commonminds-600"
                >
                  {post.author.username}
                </Link>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {truncateText(stripHtmlTags(post.excerpt || post.content), 150)}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
              <span>
                {format(new Date(post.published_at), 'MMM d, yyyy')}
              </span>
              {post.updated_at && new Date(post.updated_at).getTime() > new Date(post.published_at).getTime() + 60000 && (
                <span className="text-gray-500 italic">
                  Edited {format(new Date(post.updated_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showLoadMore && hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6"
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostGrid;