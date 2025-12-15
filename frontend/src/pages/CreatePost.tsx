import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { createPost, uploadImage } from '@/services/api';
import { Loader, Upload, X } from 'lucide-react';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setCoverImageFile(file);
    
    // Upload immediately
    try {
      setUploadingImage(true);
      const result = await uploadImage(file);
      setCoverImage(result.url);
      toast({
        title: "Image uploaded",
        description: "Cover image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive"
      });
      setCoverImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImage('');
    setCoverImageFile(null);
  };

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
            <Label htmlFor="coverImage" className="text-sm font-medium">Cover Image (Optional)</Label>
            {coverImage ? (
              <div className="relative">
                <img 
                  src={coverImage} 
                  alt="Cover preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeCoverImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label 
                  htmlFor="coverImage" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingImage ? (
                    <>
                      <Loader className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload cover image</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                    </>
                  )}
                </label>
              </div>
            )}
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