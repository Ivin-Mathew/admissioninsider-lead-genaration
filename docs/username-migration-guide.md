# Username Migration Guide

## Overview
This guide outlines the changes made to replace email display with usernames throughout the application, and the database migration required to support this change.

## ⚠️ IMPORTANT: Database Migration Required

Before the application will work properly, you **MUST** run the database migration to add the username column to the profiles table.

### Step 1: Run the Database Migration

1. **Open your Supabase SQL Editor**
2. **Copy and paste the contents of `supabase/add-username-migration.sql`**
3. **Execute the migration**

The migration will:
- Add a `username` column to the `profiles` table
- Create a unique index on usernames
- Populate existing profiles with usernames based on their emails
- Update the trigger function to handle usernames for new users
- Update RLS policies for proper access control

### Step 2: Verify Migration Success

Run these verification queries in Supabase SQL Editor:

```sql
-- Check that all profiles have usernames
SELECT id, username, role FROM profiles LIMIT 10;

-- Verify no duplicate usernames
SELECT username, COUNT(*) FROM profiles GROUP BY username HAVING COUNT(*) > 1;

-- Check that username column is NOT NULL
SELECT COUNT(*) FROM profiles WHERE username IS NULL;
```

## Changes Made to the Codebase

### 🔄 **Database Schema Updates**

#### Updated Types (`src/types/supabase.ts`)
- Added `username: string` to profiles table Row type
- Added `username: string` to profiles table Insert type  
- Added `username?: string` to profiles table Update type

### 🎯 **Hook Updates**

#### `src/hooks/useCounselors.ts`
- **CounselorStats interface**: Changed `email: string` → `username: string`
- **CounselorOption interface**: Changed `email: string` → `username: string`
- **fetchCounselorsWithStats()**: Now fetches usernames directly from profiles table
- **fetchCounselorOptions()**: Simplified to fetch usernames from profiles (no more auth calls)
- **createCounselor()**: Now includes username in profile creation

#### `src/hooks/useApplicationsData.ts`
- **fetchApplicationsWithCounselors()**: Now fetches counselor usernames from profiles table
- **updateApplication()**: Now fetches counselor usernames instead of emails
- Removed all `supabase.auth.admin.getUserById()` calls for better performance

### 🎨 **UI Component Updates**

#### `src/components/applications/EditApplicationModal.tsx`
- Dropdown now displays counselor usernames instead of emails
- Updated placeholder text and labels

#### `src/app/(authenitacted)/users/page.tsx`
- Counselor cards now display usernames as titles instead of emails
- Statistics remain the same but are now associated with usernames

#### `src/components/layout/RoleBasedLayout.tsx`
- Header now displays `user.name` (username) instead of `user.email`
- Avatar initials now use username instead of email
- Updated `getInitials()` function parameter name for clarity

### 🔐 **Authentication Updates**

#### `src/context/AuthContext.tsx`
- **signup()**: Now stores username in profiles table during registration
- Profile creation now uses `username` field instead of `name`

## Benefits of This Change

### 🚀 **Performance Improvements**
- **Eliminated auth API calls**: No more `supabase.auth.admin.getUserById()` calls
- **Faster queries**: Direct username fetching from profiles table
- **Reduced network overhead**: Single query instead of multiple auth lookups

### 🔒 **Better Privacy**
- **No email exposure**: Usernames are displayed instead of sensitive email addresses
- **Consistent identification**: Users are identified by chosen usernames
- **Professional appearance**: Cleaner UI without email clutter

### 🛠️ **Improved Maintainability**
- **Simplified data flow**: All user display data comes from profiles table
- **Consistent data source**: No mixing of auth and profiles data
- **Better caching**: TanStack Query can cache username data more effectively

## User Experience Changes

### 👥 **For Admins**
- **Users page**: Counselor cards show usernames instead of emails
- **Application management**: Counselor assignments show usernames
- **User creation**: Must provide username when creating counselors

### 👨‍💼 **For Counselors**
- **Navigation**: Header shows username instead of email
- **Application views**: Assigned counselor shows as username
- **Profile display**: Identified by username throughout the app

### 🎯 **For All Users**
- **Cleaner interface**: No email addresses cluttering the UI
- **Professional appearance**: Username-based identification
- **Better privacy**: Email addresses not exposed in the interface

## Testing Checklist

After running the migration, test these features:

### ✅ **User Management**
- [ ] Admin can view counselors page with usernames displayed
- [ ] Admin can create new counselors with usernames
- [ ] Counselor creation form validates username uniqueness

### ✅ **Application Management**
- [ ] Applications show counselor usernames (not emails)
- [ ] Admin can assign counselors by username
- [ ] Edit application modal shows counselor usernames in dropdown

### ✅ **Authentication & Navigation**
- [ ] User signup creates profile with username
- [ ] Header displays username instead of email
- [ ] Avatar shows correct initials from username

### ✅ **Data Consistency**
- [ ] All existing users have usernames
- [ ] No duplicate usernames in the system
- [ ] TanStack Query DevTools show username data in cache

## Rollback Plan (If Needed)

If you need to rollback these changes:

1. **Revert code changes** using git
2. **Keep the username column** in the database (it won't hurt)
3. **Update the code** to use emails again if necessary

However, the username approach is recommended for better UX and performance.

## Next Steps

1. **Run the database migration** (`supabase/add-username-migration.sql`)
2. **Test the application** thoroughly
3. **Verify all usernames** are properly populated
4. **Monitor performance** improvements in TanStack Query DevTools

The application is now fully configured to use usernames instead of emails for all user identification and display purposes!
