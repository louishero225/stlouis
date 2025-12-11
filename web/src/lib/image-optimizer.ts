/**
 * Optimize and compress an image file
 * @param file - The original image file
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Optimized image as Blob
 */
export async function optimizeImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width
                let height = img.height

                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Use better image smoothing
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log('Image optimized:', {
                                original: `${(file.size / 1024).toFixed(2)}KB`,
                                optimized: `${(blob.size / 1024).toFixed(2)}KB`,
                                reduction: `${(((file.size - blob.size) / file.size) * 100).toFixed(1)}%`
                            })
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to create blob'))
                        }
                    },
                    file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                    quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Convert Blob to File
 */
export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type })
}
