import { getAuth } from "firebase/auth"

const uploadToCloudinary = async (file: File, options: { folder?: string; publicId?: string } = {}): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'nashik-world')
    
    // Add optional parameters
    if (options.folder) formData.append('folder', options.folder)
    if (options.publicId) formData.append('public_id', options.publicId)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
}

const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const urlPath = new URL(imageUrl).pathname
    const matches = urlPath.match(/\/([^/]+)\/upload\/(?:v\d+\/)?(.+)$/)
    if (!matches) {
      throw new Error('Invalid Cloudinary URL format')
    }
    
    const [, cloudName, publicIdWithExt] = matches
    const publicId = publicIdWithExt.split('.')[0]

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          upload_preset: 'nashik-world',
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          timestamp: Math.floor(Date.now() / 1000).toString()
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    // Don't throw here - we want to continue with Firestore update even if Cloudinary delete fails
    // The image might already be deleted or the URL might be invalid
  }
}

export { uploadToCloudinary, deleteFromCloudinary }
