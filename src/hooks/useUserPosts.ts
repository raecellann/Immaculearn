import { useContext } from 'react';
import { UserContext } from '../contexts/user/userContext';
import { PostCreateData, CommentCreateData } from '../types/post';

export const useUserPosts = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUserPosts must be used within a UserProvider');
  }

  return {
    createPost: context.createPost,
    createComment: context.createComment,
    getPosts: context.getPosts,
    getComments: context.getComments,
  };
};
