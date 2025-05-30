# React Query DevTools Guide

## Overview
React Query DevTools is now set up in your project to help you debug and monitor your TanStack Query state, cache, and network requests.

## How to Access DevTools

### 1. Development Mode Only
The DevTools are only available in development mode (`NODE_ENV === 'development'`). They won't appear in production builds.

### 2. DevTools Button
- Look for a **React Query** logo button in the **bottom-left corner** of your screen
- Click this button to open/close the DevTools panel

### 3. DevTools Panel
- The panel opens at the **bottom** of your screen
- You can resize it by dragging the top border
- Click the button again or the X to close it

## DevTools Features

### 📊 **Query Inspector**
- **Active Queries**: See all currently active queries
- **Inactive Queries**: View cached but inactive queries
- **Query Status**: Fresh, Fetching, Stale, Inactive, etc.
- **Data Preview**: Inspect the actual data returned by queries

### 🔄 **Cache Management**
- **Cache Time**: See how long data stays in cache
- **Stale Time**: View when data becomes stale
- **Refetch Triggers**: Monitor when queries refetch
- **Manual Actions**: Invalidate, refetch, or remove queries

### 🚀 **Mutations**
- **Active Mutations**: See ongoing mutations
- **Mutation Status**: Idle, Loading, Success, Error
- **Variables**: Inspect mutation input data
- **Results**: View mutation results and errors

### 🎯 **Performance Monitoring**
- **Network Requests**: Monitor API calls
- **Loading States**: Track loading indicators
- **Error States**: Debug failed requests
- **Cache Hits**: See when data comes from cache vs network

## Your Current Query Keys

Based on your implementation, here are the query keys you can monitor:

### Counselors
- `["counselors", "stats"]` - Counselors with application statistics
- `["counselors", "options"]` - Counselors for dropdown selections

### Applications
- `["applications", "with-counselors", userId, isAdmin, isCounselor]` - Applications with counselor names
- `["dashboardData", userId, isAdmin, isCounselor, isAgent]` - Dashboard statistics

## Useful DevTools Actions

### 🔄 **Refetch Query**
- Click the "Refetch" button next to any query
- Forces a fresh network request

### ❌ **Invalidate Query**
- Click "Invalidate" to mark query as stale
- Will trigger refetch on next access

### 🗑️ **Remove Query**
- Click "Remove" to delete query from cache
- Next access will fetch fresh data

### 📋 **Copy Query Key**
- Click the copy icon to copy query key
- Useful for debugging in code

## Configuration

### Current Settings
```typescript
// Query Client Configuration
{
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
}

// DevTools Configuration
{
  initialIsOpen: false,        // Starts closed
  buttonPosition: "bottom-left", // Button location
  position: "bottom",          // Panel position
}
```

## Debugging Tips

### 🐛 **Common Issues**
1. **Query not updating**: Check if query key includes all dependencies
2. **Stale data**: Verify staleTime configuration
3. **Too many requests**: Check if query key is changing unnecessarily
4. **Cache not working**: Ensure query keys are consistent

### 🔍 **What to Look For**
- **Query Status**: Should transition from `fetching` → `success`
- **Cache Hits**: Data should come from cache when possible
- **Error States**: Red indicators show failed requests
- **Invalidation**: Watch queries invalidate after mutations

### 📈 **Performance Monitoring**
- Monitor network tab alongside DevTools
- Check if queries are being called unnecessarily
- Verify cache is being utilized effectively
- Look for query waterfalls or race conditions

## Keyboard Shortcuts

- **Toggle DevTools**: Click the floating button
- **Close Panel**: Press `Escape` or click X
- **Refresh Data**: Use browser refresh to reset all queries

## Best Practices

1. **Keep DevTools open** while developing query-related features
2. **Monitor cache invalidation** after mutations
3. **Check query dependencies** in query keys
4. **Verify loading states** are working correctly
5. **Test error scenarios** and watch error handling

## Troubleshooting

### DevTools Not Showing
- Ensure you're in development mode
- Check browser console for errors
- Verify React Query DevTools package is installed

### Performance Issues
- Close DevTools in production (automatically handled)
- Limit number of queries shown in DevTools
- Use query filters if needed

The DevTools are now ready to use! Start your development server and look for the React Query button in the bottom-left corner of your screen.
