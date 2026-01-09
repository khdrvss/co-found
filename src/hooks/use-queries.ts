/**
 * Advanced React Query hooks with optimized caching strategies
 * Provides better data management and performance optimization
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';

// Query key factory for consistent key generation
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (page: number, limit: number) => [...queryKeys.users.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    list: (page: number, limit: number) => [...queryKeys.profiles.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.profiles.all, 'detail', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (page: number, limit: number) => [...queryKeys.projects.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
    byUser: (userId: string) => [...queryKeys.projects.all, 'byUser', userId] as const,
  },
  messages: {
    all: ['messages'] as const,
    private: (partnerId: string) => [...queryKeys.messages.all, 'private', partnerId] as const,
  },
};

/**
 * Hook to fetch current user with automatic caching
 */
export function useMe(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.get('/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    ...options,
  });
}

/**
 * Hook to fetch projects list with pagination and caching
 */
export function useProjects(page: number = 1, limit: number = 20, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.projects.list(page, limit),
    queryFn: () => api.get(`/projects?page=${page}&limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook to fetch people list with pagination and caching
 */
export function usePeople(page: number = 1, limit: number = 20, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.profiles.list(page, limit),
    queryFn: () => api.get(`/people?page=${page}&limit=${limit}`),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(projectId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => api.get(`/projects/${projectId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!projectId,
    retry: 1,
    ...options,
  });
}

/**
 * Hook to fetch a single profile
 */
export function useProfile(userId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId),
    queryFn: () => api.get(`/profiles/${userId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
    retry: 1,
    ...options,
  });
}

/**
 * Hook to fetch private messages
 */
export function usePrivateMessages(partnerId: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.messages.private(partnerId),
    queryFn: () => api.get(`/messages/private/${partnerId}`),
    staleTime: 0, // Messages should always be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!partnerId,
    retry: 1,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
    ...options,
  });
}

/**
 * Hook to create a project with automatic cache updates
 */
export function useCreateProject(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: (newProject) => {
      // Invalidate projects list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      // Optionally add to cache if you want instant update
      queryClient.setQueryData(
        queryKeys.projects.detail(newProject.id),
        newProject
      );
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
    },
    ...options,
  });
}

/**
 * Hook to update a project with automatic cache updates
 */
export function useUpdateProject(projectId: string, options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put(`/projects/${projectId}`, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        queryKeys.projects.detail(projectId),
        updatedProject
      );
      // Invalidate projects list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
    ...options,
  });
}

/**
 * Hook to delete a project with automatic cache updates
 */
export function useDeleteProject(projectId: string, options?: UseMutationOptions<any, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
    },
    ...options,
  });
}

/**
 * Hook to send a private message with automatic cache updates
 */
export function useSendPrivateMessage(partnerId: string, options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/messages/private', { ...data, receiverId: partnerId }),
    onSuccess: (newMessage) => {
      // Update the messages cache with new message
      queryClient.setQueryData(
        queryKeys.messages.private(partnerId),
        (oldData: any) => {
          if (!oldData) return [newMessage];
          return [...oldData.messages, newMessage];
        }
      );
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
    ...options,
  });
}

/**
 * Hook to update user profile with automatic cache updates
 */
export function useUpdateProfile(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: (updatedProfile) => {
      // Invalidate current user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      // Update profile cache
      queryClient.setQueryData(
        queryKeys.profiles.detail(updatedProfile.id),
        updatedProfile
      );
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
    ...options,
  });
}

/**
 * Hook to refresh all queries (useful for manual sync)
 */
export function useRefreshAll() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries();
    },
    refreshProjects: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    refreshPeople: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
    refreshMe: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  };
}

/**
 * Hook to prefetch projects for pagination optimization
 */
export function usePrefetchProjects() {
  const queryClient = useQueryClient();

  return (page: number, limit: number = 20) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.list(page, limit),
      queryFn: () => api.get(`/projects?page=${page}&limit=${limit}`),
      staleTime: 3 * 60 * 1000,
    });
  };
}

/**
 * Hook to prefetch people for pagination optimization
 */
export function usePrefetchPeople() {
  const queryClient = useQueryClient();

  return (page: number, limit: number = 20) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.profiles.list(page, limit),
      queryFn: () => api.get(`/people?page=${page}&limit=${limit}`),
      staleTime: 3 * 60 * 1000,
    });
  };
}
