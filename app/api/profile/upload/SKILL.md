---
name: Profile Upload Service
description: Service for handling user profile image uploads, processing, and storage.
---

# Profile Upload Service

This service handles the uploading, processing, and storage of user profile images.

## API Endpoint

**POST** `/api/profile/upload`

### Request Body

- `file`: Multipart form data containing the image file.
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Max size: 5MB

### Response

- **Success (200)**:
  ```json
  {
    "success": true,
    "imageUrl": "/uploads/avatars/user-id-timestamp.webp",
    "message": "Profile image updated successfully"
  }
  ```
- **Error (400/401/500)**:
  ```json
  {
    "error": "Error message description"
  }
  ```

## Implementation Details

### Image Processing

- **Library**: `sharp`
- **Transformation**: Resized to 256x256 pixels (cover fit), center cropped.
- **Format**: Converted to WebP format with 85% quality.

### Storage

- **Location**: `/public/uploads/avatars/`
- **Filename**: `[userId]-[timestamp].webp`

### Database Interaction

- Updates the `users` table `image` column with the new file path.
- Uses `updateUserImage(userId, imageUrl)` function in `lib/db/models/user.ts`.

## Related Components

- `components/ProfileImageUpload.tsx`: Client-side component for selecting and previewing images.
- `app/profile/page.tsx`: Displays the profile image and uses the upload component.
