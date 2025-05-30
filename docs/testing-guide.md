# Testing Guide for Updated Application

This guide will help you test all the new features and ensure everything is working correctly after the restructuring.

## Prerequisites

1. **Database Migration**: Run the migration script in Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migration.sql
   ```

2. **Supabase Configuration**:
   - Disable email confirmation in Authentication > Providers
   - Ensure email provider is enabled

## Test Scenarios

### 1. User Authentication

#### Test Admin Signup
1. Go to `/signup`
2. Enter email: `admin@test.com`
3. Enter password: `password123`
4. Select role: **Admin**
5. Click "Sign Up"
6. Should redirect to login page with success message

#### Test Counselor Signup
1. Go to `/signup`
2. Enter email: `counselor@test.com`
3. Enter password: `password123`
4. Select role: **Counselor**
5. Click "Sign Up"
6. Should redirect to login page with success message

#### Test Login
1. Go to `/login`
2. Login with both accounts created above
3. Verify correct role-based navigation appears

### 2. Admin Features

#### Test Admin Dashboard
1. Login as admin
2. Go to `/dashboard`
3. Verify you see:
   - Total applications count
   - Status breakdown (Started, Processing, etc.)
   - Total counselors count
   - Application data table

#### Test Admin Applications View
1. Login as admin
2. Go to `/applications`
3. Verify you see:
   - All applications in the system
   - Counselor assignments (if any)
   - Ability to view application details
   - Notes functionality in application details

#### Test Admin Users Page
1. Login as admin
2. Go to `/users`
3. Verify you see:
   - List of all counselors
   - Application statistics per counselor
   - Completion rates
   - Status breakdown per counselor

### 3. Counselor Features

#### Test Counselor Dashboard
1. Login as counselor
2. Go to `/dashboard`
3. Verify you see:
   - Only applications assigned to this counselor
   - Status breakdown for assigned applications
   - Application creation button

#### Test Application Creation
1. Login as counselor
2. Go to `/dashboard` or `/applications`
3. Click "New Application" button
4. Fill out the form:
   - Client Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "1234567890"
   - Completed Course: Select any option
   - Add planned courses, locations, etc.
5. Submit the form
6. Verify:
   - Application is created with status "Started"
   - Application appears in counselor's list
   - Admin can see the application with counselor assignment

#### Test Application Status Management
1. Login as counselor
2. Go to `/applications`
3. Find an application assigned to you
4. Change the status using the dropdown:
   - Started → Processing
   - Processing → Documents Submitted
   - Documents Submitted → Payments Processed
   - Payments Processed → Completed
5. Verify status updates are saved and reflected in dashboard

#### Test Notes Functionality
1. Login as counselor
2. Go to `/applications`
3. Click "View Details" on any application
4. In the notes section:
   - Add a note: "Initial consultation completed"
   - Click "Add Note"
   - Verify note appears with timestamp and counselor name
   - Add another note: "Documents requested"
   - Verify both notes are displayed in chronological order

### 4. Role-Based Access Control

#### Test Counselor Restrictions
1. Login as counselor
2. Verify you CANNOT see:
   - Applications not assigned to you
   - Users page (should not appear in navigation)
   - Other counselors' statistics

#### Test Admin Access
1. Login as admin
2. Verify you CAN see:
   - All applications regardless of assignment
   - Users page with counselor statistics
   - All application details and notes

### 5. Data Persistence

#### Test Application Notes Persistence
1. Add notes to an application as a counselor
2. Logout and login again
3. View the same application
4. Verify notes are still there with correct timestamps

#### Test Status Updates Persistence
1. Update application status as counselor
2. Logout and login as admin
3. Verify status change is reflected in admin view
4. Check dashboard statistics are updated

### 6. Error Handling

#### Test Invalid Login
1. Try to login with incorrect credentials
2. Verify appropriate error message is shown

#### Test Unauthorized Access
1. Login as counselor
2. Try to manually navigate to `/users`
3. Verify access is denied

#### Test Empty States
1. Login as a new counselor with no applications
2. Verify appropriate "no applications" message is shown

## Expected Results Summary

### Admin User Should See:
- ✅ All applications with counselor assignments
- ✅ Users page with counselor statistics
- ✅ Complete dashboard with all statistics
- ✅ All application notes from all counselors

### Counselor User Should See:
- ✅ Only their assigned applications
- ✅ Ability to create new applications
- ✅ Ability to update application status
- ✅ Ability to add notes to applications
- ✅ Dashboard with their application statistics only

### Application Status Flow:
- ✅ Started (default for new applications)
- ✅ Processing
- ✅ Documents Submitted
- ✅ Payments Processed
- ✅ Completed

### Notes System:
- ✅ Notes stored as JSONB array in applications table
- ✅ Each note has timestamp and counselor attribution
- ✅ Notes displayed in chronological order
- ✅ Real-time updates when notes are added

## Troubleshooting

If you encounter issues:

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Verify migration** was run successfully
4. **Check RLS policies** are correctly set up
5. **Ensure environment variables** are set correctly

## Performance Testing

1. Create multiple applications (10-20)
2. Add multiple notes to each application
3. Test loading times for:
   - Dashboard
   - Applications page
   - Application details modal
   - Users page (admin)

All pages should load within 2-3 seconds with reasonable amounts of data.
