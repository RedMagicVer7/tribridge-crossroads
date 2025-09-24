/**
 * 通用异步数据获取Hook
 * 统一处理数据获取、加载状态、错误处理和缓存
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { errorToast } from '../lib/toast-utils';
import type { UseAsyncState, AppError } from '../lib/types';

interface UseAsyncDataOptions<T> {
  // 初始数据
  initialData?: T | null;
  // 是否在mount时立即获取数据
  immediate?: boolean;
  // 缓存时间（毫秒）
  cacheTime?: number;
  // 重试次数
  retryCount?: number;
  // 重试延迟（毫秒）
  retryDelay?: number;
  // 是否显示错误提示
  showErrorToast?: boolean;
  // 依赖项，当依赖项变化时重新获取数据
  deps?: any[];
}

/**
 * 通用异步数据获取Hook
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncState<T> & {
  mutate: (data: T | null) => void;
  retry: () => Promise<void>;
} {
  const {
    initialData = null,
    immediate = true,
    cacheTime = 0,
    retryCount = 0,
    retryDelay = 1000,
    showErrorToast = true,
    deps = []
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  
  const cacheRef = useRef<{ data: T | null; timestamp: number } | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // 检查缓存是否有效
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current || cacheTime <= 0) return false;
    return Date.now() - cacheRef.current.timestamp < cacheTime;
  }, [cacheTime]);

  // 获取数据函数
  const fetchData = useCallback(async (): Promise<void> => {
    // 如果有有效缓存，直接使用缓存数据
    if (isCacheValid() && cacheRef.current) {
      setData(cacheRef.current.data);
      return;
    }

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (!isMountedRef.current) return;

      setData(result);
      setError(null);
      retryCountRef.current = 0;

      // 更新缓存
      if (cacheTime > 0) {
        cacheRef.current = {
          data: result,
          timestamp: Date.now()
        };
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const appError: AppError = {
        code: err instanceof Error ? err.name : 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : '未知错误',
        details: err,
        timestamp: new Date().toISOString()
      };

      setError(appError);

      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData();
          }
        }, retryDelay);
        return;
      }

      // 显示错误提示
      if (showErrorToast) {
        errorToast(appError);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, isCacheValid, cacheTime, retryCount, retryDelay, showErrorToast]);

  // 手动重试
  const retry = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  // 手动更新数据
  const mutate = useCallback((newData: T | null) => {
    setData(newData);
    setError(null);
    
    // 更新缓存
    if (cacheTime > 0) {
      cacheRef.current = {
        data: newData,
        timestamp: Date.now()
      };
    }
  }, [cacheTime]);

  // 依赖项变化时重新获取数据
  useEffect(() => {
    if (immediate && deps.length > 0) {
      fetchData();
    }
  }, deps);

  // 初始化时获取数据
  useEffect(() => {
    if (immediate && deps.length === 0) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
    retry
  };
}

/**
 * 分页数据获取Hook
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UseAsyncDataOptions<{ items: T[]; total: number }> & {
    pageSize?: number;
  } = {}
) {
  const { pageSize = 10, ...restOptions } = options;
  const [page, setPage] = useState(1);

  const {
    data,
    loading,
    error,
    refetch,
    mutate
  } = useAsyncData(
    () => fetchFn(page, pageSize),
    {
      ...restOptions,
      deps: [page, pageSize, ...(restOptions.deps || [])]
    }
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const reset = useCallback(() => {
    setPage(1);
    mutate(null);
  }, [mutate]);

  return {
    // 数据
    items: data?.items || [],
    total: data?.total || 0,
    loading,
    error,
    
    // 分页信息
    currentPage: page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // 分页操作
    goToPage,
    nextPage,
    previousPage,
    reset,
    
    // 数据操作
    refetch,
    mutate: (newData: { items: T[]; total: number } | null) => mutate(newData)
  };
}

/**
 * 无限滚动数据获取Hook
 */
export function useInfiniteData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: UseAsyncDataOptions<T[]> & {
    pageSize?: number;
  } = {}
) {
  const { pageSize = 10, ...restOptions } = options;
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: refetchPage
  } = useAsyncData(
    () => fetchFn(page, pageSize),
    {
      immediate: false,
      deps: [page, pageSize],
      cacheTime: restOptions.cacheTime,
      retryCount: restOptions.retryCount,
      retryDelay: restOptions.retryDelay,
      showErrorToast: restOptions.showErrorToast
    }
  );

  // 加载下一页
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setPage(prev => prev + 1);
  }, [loading, hasMore]);

  // 重置数据
  const reset = useCallback(() => {
    setPage(1);
    setAllItems([]);
    setHasMore(true);
  }, []);

  // 刷新数据
  const refresh = useCallback(async () => {
    reset();
    await refetchPage();
  }, [reset, refetchPage]);

  // 处理新数据
  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllItems(data.items);
      } else {
        setAllItems(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
    }
  }, [data, page]);

  // 初始加载
  useEffect(() => {
    refetchPage();
  }, []);

  return {
    items: allItems,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    reset
  };
}

/**
 * 表单数据提交Hook
 */
export function useAsyncSubmit<T, R = any>(
  submitFn: (data: T) => Promise<R>,
  options: {
    onSuccess?: (result: R) => void;
    onError?: (error: AppError) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    resetOnSuccess?: boolean;
  } = {}
) {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    resetOnSuccess = false
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [result, setResult] = useState<R | null>(null);

  const submit = useCallback(async (data: T): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await submitFn(data);
      setResult(response);

      if (onSuccess) {
        onSuccess(response);
      }

      if (showSuccessToast) {
        // 可以根据需要自定义成功提示
      }

      if (resetOnSuccess) {
        setResult(null);
      }

      return response;
    } catch (err) {
      const appError: AppError = {
        code: err instanceof Error ? err.name : 'SUBMIT_ERROR',
        message: err instanceof Error ? err.message : '提交失败',
        details: err,
        timestamp: new Date().toISOString()
      };

      setError(appError);

      if (onError) {
        onError(appError);
      }

      if (showErrorToast) {
        errorToast(appError);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [submitFn, onSuccess, onError, showSuccessToast, showErrorToast, resetOnSuccess]);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    submit,
    loading,
    error,
    result,
    reset
  };
}