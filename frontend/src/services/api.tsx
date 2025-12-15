import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published_at: string;
  updated_at?: string; // Add this properly to your interface
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  tags?: Array<{ name: string }>;
  // other properties...
}

export type CreatePostData = {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
};

export type UpdatePostData = Partial<CreatePostData>;

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper for API errors
const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast.error(message);
  throw error;
};

// Fetch all posts (with optional pagination and userId filter)
export const fetchPosts = async (page = 1, limit = 10, userId?: string) => {
  try {
    let url = `${API_URL}/posts?page=${page}&limit=${limit}&sort=-published_at`;
    
    // Add userId filter if provided
    if (userId) {
      url += `&author_id=${userId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch posts');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch a single post by ID
export const fetchPost = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/posts/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch post');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new post
export const createPost = async (postData: CreatePostData) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('You must be logged in to create a post');
  }
  
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create post');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Update a post
export const updatePost = async (postId: string, postData: UpdatePostData) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('You must be logged in to update a post');
  }
  
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update post');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const uploadImage = async (file: File) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('You must be logged in to upload images');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    // Don't try to parse response as JSON if status is 204
    if (response.status === 404) {
      throw new Error('Post not found or you do not have permission to delete it');
    }
    
    // Only try to parse as JSON if there's likely to be a response body
    if (response.status !== 204 && response.headers.get('content-length') !== '0') {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete post');
      } catch (e) {
        throw new Error(`Failed to delete post: Status ${response.status}`);
      }
    } else {
      throw new Error(`Failed to delete post: Status ${response.status}`);
    }
  }
  
  return true;
};

// Add this function to fetch posts for a specific user
export const fetchUserPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/posts?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user posts');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
