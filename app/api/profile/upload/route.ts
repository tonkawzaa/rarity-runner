import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import sharp from 'sharp';
import { updateUserImage, getUserByEmail } from '@/lib/db/models/user';

// Maximum file size: 20MB (sharp will resize to 256x256 on the server)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp - resize and convert to WebP
    const processedImage = await sharp(buffer)
      .resize(256, 256, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Convert to Base64 data URL for database storage
    const base64 = processedImage.toString('base64');
    const imageUrl = `data:image/webp;base64,${base64}`;

    // Update database
    const updatedUser = await updateUserImage(user.id, imageUrl);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Profile image updated successfully'
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
