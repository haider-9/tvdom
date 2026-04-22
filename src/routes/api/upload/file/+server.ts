import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { storage } from '$lib/appwrite.js';

const BUCKET_ID = '69e8ff9f0028fa5accf6';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileId = formData.get('fileId') as string;
    const bucket = formData.get('bucket') as string;
    
    if (!file || !fileId) {
      return json({ error: 'File and file ID are required' }, { status: 400 });
    }

    // Upload file to Appwrite Storage
    const uploadedFile = await storage.createFile(
      BUCKET_ID,
      fileId,
      file
    );

    // Get file URL
    const fileUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
    
    return json({ 
      success: true,
      fileId: uploadedFile.$id,
      url: fileUrl, // fileUrl is already a string
      name: uploadedFile.name,
      size: uploadedFile.sizeOriginal
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    if (error.code === 400) {
      return json({ error: 'Invalid file data' }, { status: 400 });
    }
    
    return json({ error: 'Failed to upload file' }, { status: 500 });
  }
};