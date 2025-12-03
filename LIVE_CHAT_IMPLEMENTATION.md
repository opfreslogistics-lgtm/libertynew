# Live Chat System Implementation

This document describes the complete real-time live chat feature implementation for the banking project.

## Overview

The live chat system allows users to instantly chat with admin (customer support) in real-time. Both users and admins have dedicated chat widget interfaces with real-time messaging capabilities.

## Features

### User Side (Customer)
- ✅ Chat widget appears on Support page
- ✅ "Start Live Chat" button triggers chat popup from bottom-right
- ✅ Real-time two-way messaging
- ✅ Typing indicators
- ✅ Auto-scroll to latest messages
- ✅ Message timestamps
- ✅ Notification sounds
- ✅ Mobile & desktop responsive

### Admin Side
- ✅ Persistent chat widget at bottom-right in admin dashboard
- ✅ List of all active chats
- ✅ Click to open real-time chat window
- ✅ Support notifications (sound, badge with unread count)
- ✅ Typing indicator
- ✅ Auto-assign to first available admin
- ✅ View chat history

### Chat Session Lifecycle
- ✅ Automatic session creation when chat begins
- ✅ Session status tracking (active, ended, waiting)
- ✅ Email transcript sent to both user and admin when chat ends
- ✅ Complete chat history in email

## Database Schema

### Tables Created

1. **chat_sessions**
   - `id` (UUID, Primary Key)
   - `chat_id` (TEXT, Unique)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `admin_id` (UUID, Foreign Key to auth.users, nullable)
   - `status` (TEXT: 'active', 'ended', 'waiting')
   - `started_at` (TIMESTAMPTZ)
   - `ended_at` (TIMESTAMPTZ, nullable)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

2. **chat_messages**
   - `id` (UUID, Primary Key)
   - `chat_id` (TEXT, Foreign Key to chat_sessions)
   - `sender_id` (UUID, Foreign Key to auth.users)
   - `receiver_id` (UUID, Foreign Key to auth.users, nullable)
   - `message` (TEXT)
   - `is_read` (BOOLEAN)
   - `timestamp` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)

### Security (RLS Policies)

- Users can only view their own chat sessions
- Admins can view all chat sessions
- Users can create their own chat sessions
- Admins can update any chat session
- Users can update their own chat sessions
- Messages follow similar RLS rules based on chat session ownership

### Realtime

Both tables are enabled for Supabase Realtime subscriptions to provide instant updates.

## Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```bash
# Execute the SQL file
database_create_chat_system.sql
```

This will create:
- `chat_sessions` table
- `chat_messages` table
- All necessary indexes
- RLS policies
- Realtime subscriptions

### 2. Environment Variables

Ensure your `.env.local` file has the following email configuration (for chat transcripts):

```env
# Email Configuration (for chat transcripts)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Liberty National Bank <noreply@libertybank.com>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Note:** For Gmail, you need to use an App Password, not your regular password.

### 3. Components

The following components have been created:

- `components/chat/UserChatWidget.tsx` - User-facing chat widget
- `components/chat/AdminChatWidget.tsx` - Admin chat dashboard widget

### 4. API Routes

- `app/api/chat/send-transcript/route.ts` - Sends email transcripts when chat ends

### 5. Integration

#### User Side
The chat widget is integrated into `app/support/page.tsx`:
- The "Start Live Chat" button dispatches a custom event
- The widget listens for this event and opens automatically
- Widget is always rendered but hidden until opened

#### Admin Side
The admin chat widget is integrated into `components/layout/AdminLayout.tsx`:
- Widget is always visible in the admin dashboard
- Shows unread message count badge
- Lists all active chats
- Allows admins to select and respond to chats

## Usage

### For Users

1. Navigate to the Support page (`/support`)
2. Click "Start Live Chat" button in the banner
3. Chat widget opens from bottom-right corner
4. Type messages and send
5. Receive real-time responses from admin
6. Click "End Chat" when done
7. Receive email transcript automatically

### For Admins

1. Log into admin dashboard
2. Chat widget appears in bottom-right corner
3. Click widget to see list of active chats
4. Select a chat to open conversation
5. Respond to user messages in real-time
6. Click "End Chat" to close conversation
7. Receive email transcript automatically

## Real-time Features

The system uses Supabase Realtime to provide:

- **Instant message delivery** - Messages appear immediately without refresh
- **Typing indicators** - Shows when someone is typing (UI ready, can be enhanced)
- **Live status updates** - Chat status changes reflect immediately
- **Unread notifications** - Badge shows unread message count for admins

## Email Transcripts

When a chat session ends:

1. System fetches all messages from the session
2. Formats them into a beautiful HTML email template
3. Sends email to:
   - User (customer)
   - Admin (support agent)
4. Email includes:
   - Chat ID
   - Start and end times
   - Participant names
   - Complete message history
   - Professional formatting

## Technical Details

### Real-time Subscriptions

The system uses Supabase Realtime channels:

```typescript
// User widget subscribes to their chat
supabase
  .channel(`chat:${chatId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'chat_messages' }, ...)
  .subscribe()

// Admin widget subscribes to all chats
supabase
  .channel('admin-chats')
  .on('postgres_changes', { event: '*', table: 'chat_sessions' }, ...)
  .subscribe()
```

### Notification Sounds

Simple audio notification using Web Audio API:
- Plays when new message arrives
- Non-intrusive sine wave tone
- Only plays for received messages (not sent)

### Auto-scroll

Messages container automatically scrolls to bottom:
- On new message arrival
- On typing indicator change
- Uses smooth scroll behavior

## Security Considerations

1. **Authentication Required**
   - Only authenticated users can start chats
   - Only admins can view all chats

2. **RLS Policies**
   - All database operations protected by Row Level Security
   - Users can only access their own chats
   - Admins have elevated permissions

3. **Input Validation**
   - Messages are trimmed before sending
   - Empty messages are rejected
   - SQL injection protection via Supabase client

## Customization

### Styling

Both widgets use Tailwind CSS and can be customized:
- User widget: Green theme (`bg-green-700`)
- Admin widget: Red/Orange theme (`bg-red-600`)

### Email Template

The email transcript template can be customized in:
`app/api/chat/send-transcript/route.ts`

### Notification Sound

The notification sound can be customized in the `playNotificationSound()` function in both widgets.

## Troubleshooting

### Chat widget not appearing
- Check if user is authenticated
- Verify Supabase connection
- Check browser console for errors

### Messages not sending
- Verify RLS policies are set correctly
- Check Supabase logs
- Ensure user has proper permissions

### Email transcripts not sending
- Verify email environment variables
- Check Nodemailer configuration
- Review email service provider settings (Gmail requires App Password)

### Real-time not working
- Ensure Realtime is enabled in Supabase dashboard
- Verify tables are added to Realtime publication
- Check network connectivity

## Future Enhancements

Potential improvements:
- [ ] File attachments
- [ ] Emoji support
- [ ] Message reactions
- [ ] Chat history search
- [ ] Multiple admin assignment
- [ ] Chat queue management
- [ ] Automated responses
- [ ] Chat ratings/feedback
- [ ] Screen sharing
- [ ] Voice/video calls

## Files Created/Modified

### New Files
- `database_create_chat_system.sql` - Database schema
- `components/chat/UserChatWidget.tsx` - User chat widget
- `components/chat/AdminChatWidget.tsx` - Admin chat widget
- `app/api/chat/send-transcript/route.ts` - Email transcript API

### Modified Files
- `app/support/page.tsx` - Added chat widget integration
- `components/layout/AdminLayout.tsx` - Added admin chat widget

## Support

For issues or questions:
1. Check Supabase dashboard for database errors
2. Review browser console for client-side errors
3. Check server logs for API errors
4. Verify environment variables are set correctly

---

**Implementation Date:** 2024
**Version:** 1.0.0
**Status:** ✅ Complete and Ready for Use






