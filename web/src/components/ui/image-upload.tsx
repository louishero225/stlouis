'use client'

import { useState, useRef } from 'react'
import { uploadToBackblaze } from '@/actions/upload'
import { optimizeImage, blobToFile } from '@/lib/image-optimizer'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
    disabled?: boolean
    folder: 'events' | 'announcements' | 'notifications' | 'groups' | 'team' | 'parishes' | 'avatars' | 'books' | 'gallery' | 'homelies'
    className?: string
    maxWidth?: number
    maxHeight?: number
    quality?: number
}

export function ImageUpload({
    value,
    onChange,
    disabled = false,
    folder,
    className,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [optimizing, setOptimizing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0]
            if (!file) return

            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image')
                return
            }

            setOptimizing(true)

            console.log('Original file:', { name: file.name, size: file.size, type: file.type })

            // Optimize image
            const optimizedBlob = await optimizeImage(file, maxWidth, maxHeight, quality)
            const optimizedFile = blobToFile(optimizedBlob, file.name)

            console.log('Optimized file:', {
                name: optimizedFile.name,
                size: optimizedFile.size,
                reduction: `${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(1)}%`
            })

            setOptimizing(false)
            setUploading(true)

            // Read file as ArrayBuffer and convert to number array (serializable)
            const arrayBuffer = await optimizedFile.arrayBuffer()
            const bytes = Array.from(new Uint8Array(arrayBuffer))

            console.log('Uploading to Backblaze...', bytes.length, 'bytes')

            // Upload via Server Action with serializable data
            const result = await uploadToBackblaze({
                bytes,
                name: optimizedFile.name,
                type: optimizedFile.type,
                folder
            })

            if (!result.success) {
                throw new Error(result.error || 'Upload failed')
            }

            console.log('Upload successful:', result.url)
            onChange(result.url!)
        } catch (error: any) {
            console.error('Error uploading image:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setOptimizing(false)
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemove = () => {
        onChange('')
    }

    const handleTriggerUpload = () => {
        fileInputRef.current?.click()
    }

    const isLoading = uploading || optimizing

    return (
        <div className={`space-y-4 w-full flex flex-col items-center justify-center ${className}`}>
            <div className="relative group w-full h-64 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-[var(--primary)] hover:bg-gray-100 dark:hover:bg-gray-800">

                {value ? (
                    <>
                        <div className="relative w-full h-full">
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-opacity group-hover:opacity-75"
                            />
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleRemove}
                                disabled={disabled || isLoading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        {/* Image info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="truncate">{value.split('/').pop()}</p>
                        </div>
                    </>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full"
                        onClick={handleTriggerUpload}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-[var(--primary)] animate-spin mb-4" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    {optimizing ? 'Optimisation...' : 'Téléchargement vers Backblaze...'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {optimizing ? 'Compression et redimensionnement' : 'Upload en cours'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-[var(--primary)]/10 rounded-full mb-4">
                                    <Upload className="h-8 w-8 text-[var(--primary)]" />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    Cliquez pour ajouter une image
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    PNG, JPG, WEBP
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Max {maxWidth}x{maxHeight}px • Qualité {quality * 100}%
                                </p>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                    accept="image/*"
                    disabled={disabled || isLoading}
                />
            </div>
        </div>
    )
}
