import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getAllPosts,
  getLatestPosts,
  getUserPosts,
  searchPosts,
  getCurrentUser,
  signIn,
  signOut,
  createUser,
  createVideoPost,
  uploadFile,
  getFilePreview
} from "../lib/appwrite";

/** 🔥 Common default options for all post queries */
const defaultOptions = {
  staleTime: 1000 * 60 * 3, // 3 minutes
  cacheTime: 1000 * 60 * 10, // Keep cached data 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
  keepPreviousData: true,
};

/** 🏠 Get all posts (Home Feed) */
export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
    ...defaultOptions,
  });

/** 🚀 Get latest posts (Trending Section) */
export const useLatestPosts = () =>
  useQuery({
    queryKey: ["latest-posts"],
    queryFn: getLatestPosts,
    ...defaultOptions,
  });

/** 👤 Get posts by a specific user (Profile) */
export const useUserPosts = (userId) =>
  useQuery({
    queryKey: ["user-posts", userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId, // Only runs when userId exists
    ...defaultOptions,
    staleTime: 0, // Always fresh for user content
  });

  /** 🔍 Search posts */
export const useSearchPosts = (query) =>
  useQuery({
    queryKey: ["search-posts", query],
    queryFn: () => searchPosts(query),
    enabled: !!query && query.length > 0,
    ...defaultOptions,
  });

/** 👤 Get current logged-in user */
export const useCurrentUser = () =>
  useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    ...defaultOptions,
  });

/* -------------------------------------------------------------------------- */
/* ✍️  WRITE HOOKS (Mutations) */

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries(["current-user"]);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, username }) =>
      createUser(email, password, username),
    onSuccess: () => {
      queryClient.invalidateQueries(["current-user"]);
    },
  });
};

export const useCreateVideoPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVideoPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["latest-posts"]);
      queryClient.invalidateQueries(["user-posts"]);
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, type }) => uploadFile(file, type),
  });
};

export const useFilePreview = (fileId, type) =>
  useQuery({
    queryKey: ["file-preview", fileId, type],
    queryFn: () => getFilePreview(fileId, type),
    enabled: !!fileId && !!type, // only run when valid
    ...defaultOptions,
  });