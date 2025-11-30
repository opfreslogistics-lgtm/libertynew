# Logo Display Troubleshooting Guide 🔍

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open your website (homepage or login page)
2. Open browser console (F12 or Right-click → Inspect → Console tab)
3. Look for a message that starts with: **🔍 AuthTopBar Debug:**
4. Check the values shown:
   ```javascript
   {
     theme: 'light' or 'dark',
     logoLight: '...' or '',
     logoDark: '...' or '',
     logoUrl: '...' or '',
     allSettings: { ... }
   }
   ```

### Step 2: Interpret the Results

**Scenario A: Logo URLs are empty strings ('')**
- **Problem**: Logos haven't been uploaded yet
- **Solution**: Upload logos in Admin Settings (see "How to Upload Logos" below)

**Scenario B: Logo URLs have long Supabase URLs**
- **Problem**: Logos are uploaded but not displaying
- **Possible causes**:
  - Image file is corrupted
  - Supabase storage permissions issue
  - Image URL is incorrect

**Scenario C: Settings object is empty or has default values**
- **Problem**: Settings aren't loading from database
- **Possible causes**:
  - Database connection issue
  - `app_settings` table doesn't exist
  - Settings haven't been saved

## How to Upload Logos (Step-by-Step)

### Admin Login
1. Go to: `your-site.com/admin/login`
2. Enter admin credentials
3. Click "Sign In"

### Navigate to Settings
1. In admin sidebar, click **"Settings"**
2. Click on **"Appearance"** tab
3. Scroll to **"Logo & Branding"** section

### Upload Logos
1. **Light Mode Logo**:
   - Click "Choose File" under "Light Mode Logo"
   - Select your PNG/JPG logo (recommended: dark logo on transparent background)
   - Wait for "Upload successful" message

2. **Dark Mode Logo**:
   - Click "Choose File" under "Dark Mode Logo"  
   - Select your PNG/JPG logo (recommended: light/white logo on transparent background)
   - Wait for "Upload successful" message

3. Click **"Save Changes"** at the bottom

### Logo Specifications
- **Format**: PNG (with transparency) or JPG
- **Dimensions**: 200-300px wide × 40-60px tall
- **Aspect Ratio**: Horizontal/landscape
- **File Size**: Under 2MB
- **Background**: Transparent PNG recommended

**Example Logos:**
- **Light Mode**: Dark green/black logo on transparent background
- **Dark Mode**: White/light logo on transparent background

## Common Issues & Solutions

### Issue 1: "No file selected" error
**Cause**: Trying to save without selecting a file  
**Solution**: Click "Choose File" and select an image before clicking save

### Issue 2: "File size exceeds limit" error
**Cause**: Logo file is too large  
**Solution**: Resize/compress your logo to under 2MB

### Issue 3: "Permission denied" error
**Cause**: Not logged in as admin or storage bucket not configured  
**Solution**: 
- Verify you're logged in as admin
- Check that `app-images` storage bucket exists in Supabase

### Issue 4: Logo shows on dashboard but not homepage
**Cause**: Different components using different settings  
**Solution**: This should now be fixed with unified logo logic

### Issue 5: Logo uploaded but still not showing
**Possible Causes:**
1. **Cache Issue**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Wrong Image Format**: Make sure it's PNG/JPG, not WEBP or SVG
3. **Broken Image Link**: URL might be incorrect or image deleted from storage

## Database Check (For Technical Users)

### Verify Logo URLs in Database
If you have database access, run this SQL query:

```sql
SELECT setting_key, setting_value 
FROM app_settings 
WHERE setting_key IN ('app_logo', 'app_logo_light', 'app_logo_dark')
ORDER BY setting_key;
```

**Expected Results:**
```
app_logo       | https://[your-supabase-url].supabase.co/storage/v1/object/public/app-images/...
app_logo_dark  | https://[your-supabase-url].supabase.co/storage/v1/object/public/app-images/...
app_logo_light | https://[your-supabase-url].supabase.co/storage/v1/object/public/app-images/...
```

### Check Storage Bucket
1. Go to Supabase Dashboard
2. Navigate to Storage → Buckets
3. Verify `app-images` bucket exists
4. Check that `app-settings/` folder has your uploaded images

### Verify Storage Policies
Make sure these RLS policies exist on `app-images` bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-images' AND auth.role() = 'authenticated');
```

## Testing Checklist

After uploading logos, verify:
- [ ] Homepage shows logo
- [ ] Login page shows logo
- [ ] Signup page shows logo
- [ ] Dashboard shows logo (when logged in)
- [ ] Footer shows logo
- [ ] Logo changes with dark/light mode toggle
- [ ] Logo looks good on mobile devices
- [ ] Logo displays in all major browsers

## Still Not Working?

### Quick Fixes to Try:
1. **Clear Browser Cache**: Settings → Clear browsing data → Cached images
2. **Try Incognito Mode**: Eliminates cache issues
3. **Different Browser**: Test in Chrome, Firefox, Safari
4. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Get More Information:
1. Open browser console (F12)
2. Look for any red error messages
3. Check the **🔍 AuthTopBar Debug** log
4. Take screenshots of:
   - Console logs
   - Admin settings page showing logos
   - Page where logo isn't appearing

### What to Share for Help:
If logos still aren't working, share:
1. Console log output from **🔍 AuthTopBar Debug**
2. Screenshot of Admin → Settings → Appearance page
3. Which pages logo shows/doesn't show
4. Browser and device being used

## Expected Behavior (After Fix)

### Homepage
- ✅ Logo appears in top-left corner
- ✅ Clickable, links to homepage
- ✅ Shows correct logo for theme
- ✅ Responsive sizing

### Login/Signup Pages
- ✅ Logo appears in top-left corner
- ✅ Clickable, links to homepage
- ✅ Shows correct logo for theme
- ✅ Smaller than main nav logo

### Dashboard (Logged In)
- ✅ Logo appears in sidebar
- ✅ Shows correct logo for theme
- ✅ Consistent branding

### Footer
- ✅ Footer logo (if uploaded)
- ✅ Falls back to header logo if no footer logo
- ✅ Shows correct logo for theme

## Debug Mode (Temporary)

The debug logging added will show:
- What theme is active
- What logo URLs are loaded
- Full settings object

**To disable debug logging later:**
Remove the `useEffect` block with `console.log` from `/components/auth/AuthTopBar.tsx`

---

**Last Updated**: November 30, 2025  
**Status**: Debug logging active  
**Next Step**: Check browser console for logo URLs
