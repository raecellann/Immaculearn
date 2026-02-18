import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services/postService';
import { PostCreateData, CommentCreateData } from '../types/post';

// Query keys for caching
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (spaceId: string) => [...postKeys.lists(), spaceId] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: () => [...postKeys.all, 'comments'] as const,
  commentsList: (postId: string) => [...postKeys.comments(), postId] as const,
};

// Custom hooks for post queries
export const usePostQueries = {
  // Get all posts for a space
  useGetPosts: (spaceId: string) => {
    return useQuery({
      queryKey: postKeys.list(spaceId),
      queryFn: () => postService.getPosts(spaceId),
      enabled: !!spaceId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  // Get all comments for a post
  useGetComments: (postId: string) => {
    return useQuery({
      queryKey: postKeys.commentsList(postId),
      queryFn: () => postService.getComments(postId),
      enabled: !!postId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

// Custom hooks for post mutations
export const usePostMutations = {
  // Create post mutation
  useCreatePost: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (postData: PostCreateData) => postService.createPost(postData),
      onSuccess: (data, variables) => {
        // Invalidate and refetch posts for the space
        queryClient.invalidateQueries({
          queryKey: postKeys.list(variables.space_id),
        });
      },
      onError: (error) => {
        console.error('Failed to create post:', error);
      },
    });
  },

  // Create comment mutation
  useCreateComment: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (commentData: CommentCreateData) => postService.createComment(commentData),
      onSuccess: (data, variables) => {
        // Invalidate and refetch comments for the specific post
        queryClient.invalidateQueries({
          queryKey: postKeys.commentsList(variables.post_id),
        });
      },
      onError: (error) => {
        console.error('Failed to create comment:', error);
      },
    });
  },
};

// Combined hook for convenience
export const usePosts = (spaceId: string) => {
  const getPosts = usePostQueries.useGetPosts(spaceId);
  const createPost = usePostMutations.useCreatePost();
  const createComment = usePostMutations.useCreateComment();

  return {
    posts: getPosts.data?.data || [],
    isLoadingPosts: getPosts.isLoading,
    postsError: getPosts.error,
    refetchPosts: getPosts.refetch,
    createPost,
    createComment,
  };
};
