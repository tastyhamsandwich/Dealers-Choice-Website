import { NextResponse } from 'next/server';
import { createClient } from '@supaS';
import sharp from 'sharp';
import { imageConfig } from '@/lib/config/image';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('avatar') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Get file extension and validate it's an image
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const { validExtensions, maxSizeInMB } = imageConfig.avatar;
        
        if (!fileExt || !validExtensions.includes(fileExt)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Check file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSizeInMB) {
            return NextResponse.json({ 
                error: `File size must be less than ${maxSizeInMB}MB` 
            }, { status: 400 });
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Process image with sharp using config settings
        const { width, height, format, fit, position } = imageConfig.avatar;
        const processedImageBuffer = await sharp(buffer)
            .resize(width, height, {
                fit,
                position
            })
            .toFormat(format)
            .toBuffer();

        // Initialize Supabase client
        const supabase = await createClient();

        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Create unique filename with user ID for better organization
        const timestamp = Date.now();
        const filename = `avatar-${timestamp}.${format}`;

        // Upload processed image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(`${session.user.id}/${filename}`, processedImageBuffer, {
                contentType: imageConfig.avatar.contentType,
                cacheControl: '3600',
                upsert: true // Allow overwriting old avatars
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(`${session.user.id}/${filename}`);

        // Update user profile with new avatar URL
        const { data: userData, error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', session.user.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            avatar_url: publicUrl,
            user: userData
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 