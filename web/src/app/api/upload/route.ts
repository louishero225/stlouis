import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configure Next.js to handle file uploads
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export async function POST(request: NextRequest) {
    try {
        console.log('=== Upload API Called ===')
        console.log('Content-Type:', request.headers.get('content-type'))

        const formData = await request.formData()
        console.log('FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? `File: ${v.name}` : v]))

        const file = formData.get('file') as File
        const folder = formData.get('folder') as string

        if (!file) {
            console.error('No file in formData')
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!folder) {
            console.error('No folder specified')
            return NextResponse.json(
                { error: 'No folder specified' },
                { status: 400 }
            )
        }

        console.log('=== Server-side Upload ===')
        console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)
        console.log('Folder:', folder)

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const key = `${folder}/${fileName}`

        console.log('Uploading to:', {
            bucket: BUCKET_NAME,
            key,
            endpoint: BACKBLAZE_ENDPOINT
        })

        // Upload to Backblaze
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read', // Make file public
        })

        await s3Client.send(command)

        // Generate public URL
        const publicUrl = `https://${BUCKET_NAME}.${BACKBLAZE_ENDPOINT}/${key}`

        console.log('Upload successful:', publicUrl)

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}
