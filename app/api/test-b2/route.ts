import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
const B2 = require('backblaze-b2');

export async function GET(request: Request) {
  try {
    console.log('Testing B2 connection...');
    const b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!
    });

    await b2.authorize();
    
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      maxFileCount: 1000,
      prefix: 'Images/'
    });

    console.log('Found files in Images folder:', response.data.files);
    return NextResponse.json({ 
      status: 'success',
      files: response.data.files
    });
  } catch (error) {
    console.error('Error listing B2 files:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Create a small test file
    const testData = Buffer.from('Hello B2 Upload Test!');
    
    console.log('Testing B2 upload...');
    const b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!
    });

    // Authenticate
    console.log('Authenticating with:', {
      keyId: process.env.B2_APPLICATION_KEY_ID?.slice(0,5),
      key: process.env.B2_APPLICATION_KEY?.slice(0,5),
      bucketId: process.env.B2_BUCKET_ID?.slice(0,5)
    });
    const auth = await b2.authorize();
    console.log('Got auth response:', {
      downloadUrl: auth.data?.downloadUrl,
      allowed: auth.data?.allowed
    });

    // Get upload URL
    console.log('Getting upload URL...');
    const uploadUrl = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!
    });
    console.log('Got upload URL:', uploadUrl.data);

    // Upload file
    console.log('Uploading test file...');
    const uniqueFileName = `Images/${randomUUID()}-test-upload.txt`;
    console.log('Using filename:', uniqueFileName);
    
    const uploadResult = await b2.uploadFile({
      uploadUrl: uploadUrl.data.uploadUrl,
      uploadAuthToken: uploadUrl.data.authorizationToken,
      fileName: uniqueFileName,
      data: testData,
      contentLength: testData.length
    });

    return NextResponse.json({
      status: 'success',
      uploadResult: uploadResult.data
    });
  } catch (error: any) {
    console.error('Error testing B2:', error);
    console.error('Full error:', JSON.stringify(error.response?.data || error, null, 2));
    const message = error.response?.data?.message || error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
