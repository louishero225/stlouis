/**
 * Migration script: Supabase Storage → Backblaze B2
 * 
 * This script migrates all images from Supabase Storage to Backblaze B2
 * and updates the database URLs accordingly.
 * 
 * Usage: node scripts/migrate-to-backblaze.js
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fetch from 'node-fetch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BACKBLAZE_ENDPOINT = process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT!
const BACKBLAZE_REGION = process.env.NEXT_PUBLIC_BACKBLAZE_REGION!
const BACKBLAZE_KEY_ID = process.env.NEXT_PUBLIC_BACKBLAZE_KEY_ID!
const BACKBLAZE_APP_KEY = process.env.NEXT_PUBLIC_BACKBLAZE_APP_KEY!
const BUCKET_NAME = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const s3Client = new S3Client({
    endpoint: `https://${BACKBLAZE_ENDPOINT}`,
    region: BACKBLAZE_REGION,
    credentials: {
        accessKeyId: BACKBLAZE_KEY_ID,
        secretAccessKey: BACKBLAZE_APP_KEY,
    },
})

// Tables and columns to migrate
const TABLES_TO_MIGRATE = [
    { table: 'events', column: 'image_url' },
    { table: 'announcements', column: 'image_url' },
    { table: 'groups', column: 'image_url' },
    { table: 'team_members', column: 'photo_url' },
    { table: 'parishes', column: 'logo_url' },
]

async function migrateImage(supabaseUrl: string): Promise<string | null> {
    try {
        console.log(`Migrating: ${supabaseUrl}`)

        // Download from Supabase
        const response = await fetch(supabaseUrl)
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())

        // Extract path from Supabase URL
        const urlPath = new URL(supabaseUrl).pathname
        const pathMatch = urlPath.match(/\/media\/(.+)$/)
        if (!pathMatch) {
            console.warn(`Could not extract path from: ${supabaseUrl}`)
            return null
        }

        const key = pathMatch[1] // e.g., "events/file.jpg"

        // Determine content type
        const contentType = supabaseUrl.endsWith('.png') ? 'image/png' :
            supabaseUrl.endsWith('.webp') ? 'image/webp' :
                'image/jpeg'

        console.log(`Uploading to Backblaze: ${key}`)

        // Upload to Backblaze
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })

        await s3Client.send(command)

        // Generate new URL
        const newUrl = `https://${BUCKET_NAME}.${BACKBLAZE_ENDPOINT}/${key}`
        console.log(`✓ Migrated to: ${newUrl}`)

        return newUrl
    } catch (error) {
        console.error(`✗ Failed to migrate ${supabaseUrl}:`, error)
        return null
    }
}

async function migrateTable(tableName: string, columnName: string) {
    console.log(`\n=== Migrating table: ${tableName}.${columnName} ===\n`)

    try {
        // Fetch all records with Supabase URLs
        const { data: records, error } = await supabase
            .from(tableName)
            .select(`id, ${columnName}`)
            .not(columnName, 'is', null)
            .like(columnName, '%supabase.co%')

        if (error) {
            console.error(`Error fetching ${tableName}:`, error)
            return
        }

        if (!records || records.length === 0) {
            console.log(`No Supabase URLs found in ${tableName}`)
            return
        }

        console.log(`Found ${records.length} images to migrate in ${tableName}`)

        let migrated = 0
        let failed = 0

        for (const record of records) {
            const supabaseUrl = record[columnName]
            const newUrl = await migrateImage(supabaseUrl)

            if (newUrl) {
                // Update database
                const { error: updateError } = await supabase
                    .from(tableName)
                    .update({ [columnName]: newUrl })
                    .eq('id', record.id)

                if (updateError) {
                    console.error(`Failed to update ${tableName}#${record.id}:`, updateError)
                    failed++
                } else {
                    migrated++
                }
            } else {
                failed++
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        console.log(`\n${tableName}: ${migrated} migrated, ${failed} failed\n`)
    } catch (error) {
        console.error(`Error migrating ${tableName}:`, error)
    }
}

async function main() {
    console.log('='.repeat(60))
    console.log('Supabase → Backblaze B2 Migration')
    console.log('='.repeat(60))
    console.log(`Backblaze bucket: ${BUCKET_NAME}`)
    console.log(`Backblaze endpoint: ${BACKBLAZE_ENDPOINT}`)
    console.log('='.repeat(60))

    for (const { table, column } of TABLES_TO_MIGRATE) {
        await migrateTable(table, column)
    }

    console.log('\n' + '='.repeat(60))
    console.log('Migration complete!')
    console.log('='.repeat(60))
}

main().catch(console.error)
