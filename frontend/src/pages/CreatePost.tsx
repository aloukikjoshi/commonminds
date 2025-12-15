import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/services/api';
import { Loader } from 'lucide-react';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
        cover_image: coverImage || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      };

      await createPost(postData);

      toast({
        title: "Post created successfully",
        description: "Your post has been published"
      });
      
      navigate('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Failed to create post",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
        
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
            <Label htmlFor="coverImage" className="text-sm font-medium">Cover Image URL (Optional)</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Enter image URL"
              className="w-full h-10"
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

          <div className="flex gap-4 mt-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/')}
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
                  Publishing...
                </>
              ) : (
                'Publish Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;