'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const BACKBLAZE_ENDPOINT = process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT || 's3.us-east-005.backblazeb2.com'
const BACKBLAZE_REGION = process.env.NEXT_PUBLIC_BACKBLAZE_REGION || 'us-east-1'
const BACKBLAZE_KEY_ID = process.env.NEXT_PUBLIC_BACKBLAZE_KEY_ID || ''
const BACKBLAZE_APP_KEY = process.env.NEXT_PUBLIC_BACKBLAZE_APP_KEY || ''
const BUCKET_NAME = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET || 'stlouis-media'

const s3Client = new S3Client({
    endpoint: `https://${BACKBLAZE_ENDPOINT}`,
    region: BACKBLAZE_REGION,
    credentials: {
        accessKeyId: BACKBLAZE_KEY_ID,
        secretAccessKey: BACKBLAZE_APP_KEY,
    },
})

export async function uploadToBackblaze(
    fileData: {
        bytes: number[]
        name: string
        type: string
        folder: string
    }
) {
    try {
        console.log('=== Server Action Upload ===')
        console.log('File:', fileData.name, 'Size:', fileData.bytes.length, 'Type:', fileData.type)
        console.log('Folder:', fileData.folder)

        if (fileData.bytes.length === 0) {
            throw new Error('File is empty')
        }

        // Convert number array back to Buffer
        const buffer = Buffer.from(fileData.bytes)

        console.log('Buffer created, size:', buffer.length)

        // Generate unique filename
        const fileExt = fileData.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const key = `${fileData.folder}/${fileName}`

        console.log('Uploading to Backblaze:', {
            bucket: BUCKET_NAME,
            key,
            endpoint: BACKBLAZE_ENDPOINT,
            bufferSize: buffer.length
        })

        // Upload to Backblaze
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: fileData.type,
        })

        const response = await s3Client.send(command)
        console.log('S3 Response:', response)

        // Generate public URL
        const publicUrl = `https://${BUCKET_NAME}.${BACKBLAZE_ENDPOINT}/${key}`

        console.log('Upload successful! Public URL:', publicUrl)

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error('=== Upload Error ===')
        console.error('Error:', error)
        return { success: false, error: error.message }
    }
}
