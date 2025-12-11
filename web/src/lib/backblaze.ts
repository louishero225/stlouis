import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const BACKBLAZE_ENDPOINT = process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT || 's3.us-west-004.backblazeb2.com'
const BACKBLAZE_REGION = process.env.NEXT_PUBLIC_BACKBLAZE_REGION || 'us-west-004'
const BACKBLAZE_KEY_ID = process.env.NEXT_PUBLIC_BACKBLAZE_KEY_ID || ''
const BACKBLAZE_APP_KEY = process.env.NEXT_PUBLIC_BACKBLAZE_APP_KEY || ''
export const BUCKET_NAME = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET || 'stlouis-media'

const s3Client = new S3Client({
    endpoint: `https://${BACKBLAZE_ENDPOINT}`,
    region: BACKBLAZE_REGION,
    credentials: {
        accessKeyId: BACKBLAZE_KEY_ID,
        secretAccessKey: BACKBLAZE_APP_KEY,
    },
})

/**
 * Upload a file to Backblaze B2
 */
export async function uploadToBackblaze(
    file: File,
    folder: string
): Promise<string> {
    try {
        console.log('=== Backblaze Upload Start ===')
        console.log('Environment check:', {
            hasEndpoint: !!BACKBLAZE_ENDPOINT,
            hasKeyId: !!BACKBLAZE_KEY_ID,
            hasAppKey: !!BACKBLAZE_APP_KEY,
            hasBucket: !!BUCKET_NAME,
            endpoint: BACKBLAZE_ENDPOINT,
            region: BACKBLAZE_REGION,
            bucket: BUCKET_NAME,
            keyIdLength: BACKBLAZE_KEY_ID?.length,
            appKeyLength: BACKBLAZE_APP_KEY?.length
        })

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const key = `${folder}/${fileName}`

        console.log('Upload details:', {
            fileName,
            key,
            fileSize: buffer.length,
            contentType: file.type
        })

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        })

        console.log('Sending command to S3...')
        const response = await s3Client.send(command)
        console.log('S3 Response:', response)

        // Return public URL - Use the bucket's endpoint
        // Format: https://stlouis-media.s3.us-east-005.backblazeb2.com/folder/file.jpg
        const publicUrl = `https://${BUCKET_NAME}.${BACKBLAZE_ENDPOINT}/${key}`
        console.log('Upload successful! Public URL:', publicUrl)
        return publicUrl
    } catch (error: any) {
        console.error('=== Backblaze Upload Error ===')
        console.error('Error name:', error?.name)
        console.error('Error message:', error?.message)
        console.error('Error code:', error?.code)
        console.error('Error $metadata:', error?.$metadata)
        console.error('Full error:', JSON.stringify(error, null, 2))

        // Rethrow with more context
        throw new Error(`Backblaze upload failed: ${error?.message || 'Unknown error'}`)
    }
}

/**
 * Delete a file from Backblaze B2
 */
export async function deleteFromBackblaze(fileUrl: string): Promise<void> {
    try {
        // Extract the key from the URL
        const url = new URL(fileUrl)
        const key = url.pathname.slice(1) // Remove leading '/'

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })

        await s3Client.send(command)
    } catch (error) {
        console.error('Error deleting from Backblaze:', error)
        throw error
    }
}

/**
 * Get the folder name based on the upload context
 */
export function getFolderForContext(context:
    | 'events'
    | 'announcements'
    | 'notifications'
    | 'groups'
    | 'team'
    | 'parishes'
    | 'avatars'
    | 'books'
    | 'gallery'
    | 'homelies'
): string {
    return context
}
