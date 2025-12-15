import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { fetchPost, updatePost } from '@/services/api';
import { Loader } from 'lucide-react';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [publishedAt, setPublishedAt] = useState<string | null>(null); // Track original publish date

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (!id) return;
        const post = await fetchPost(id);
        
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        
        // Store the original published date to preserve it
        if (post.published_at) {
          setPublishedAt(post.published_at);
        }
        
        // Handle tags - could be array of objects or array of strings
        if (post.tags && post.tags.length > 0) {
          if (typeof post.tags[0] === 'object') {
            setTags(post.tags.map((tag: { name: string }) => tag.name).join(', '));
          } else {
            setTags(post.tags.join(', '));
          }
        }
      } catch (error: unknown) {
          toast({
            title: "Error loading post",
            description: error instanceof Error ? error.message : 'An unexpected error occurred',
            variant: "destructive"
          });
          navigate('/');
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const postData = {
        title,
        content,
        excerpt: excerpt || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        published_at: publishedAt, // Preserve the original publish date
        updated_at: new Date().toISOString() // Add current timestamp as update time
      };
      
      await updatePost(id!, postData);
      
      toast({
        title: "Post updated successfully",
        description: "Your changes have been saved"
      });
      
      navigate(`/post/${id}`);
    } catch (error: unknown) {
      toast({
        title: "Failed to update post",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-32">
          <Loader className="h-10 w-10 animate-spin text-commonminds-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto bg-slate-50 p-6 rounded-lg shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full h-10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt (Optional)</Label>
            <Textarea
              className="w-full min-h-[80px] bg-white resize-none border border-input px-3 py-2 placeholder:text-gray-500"
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Enter a brief excerpt"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">Tags (Optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="w-full h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Content</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here..."
            />
          </div>
          
          {publishedAt && (
            <div className="text-sm text-gray-500">
              <span>Originally published: {new Date(publishedAt).toLocaleDateString()}</span>
              <span className="ml-2">• Editing will update the modification timestamp</span>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(`/post/${id}`)}
              className="w-full sm:w-auto px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto px-6 py-2"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditPost;