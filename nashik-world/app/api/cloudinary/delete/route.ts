import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'

const cloudinaryAPI = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`
const cloudinaryKey = process.env.CLOUDINARY_API_KEY
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET

export async function POST(request: Request) {
  try {
    // Verify the request is authenticated
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    await auth.verifyIdToken(token)

    // Get the public_id from the request body
    const { public_id } = await request.json()
    if (!public_id) {
      return NextResponse.json({ error: 'Missing public_id' }, { status: 400 })
    }

    // Create timestamp and signature for Cloudinary
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = require('crypto')
      .createHash('sha1')
      .update(`public_id=${public_id}&timestamp=${timestamp}${cloudinarySecret}`)
      .digest('hex')

    // Make the request to Cloudinary
    const response = await fetch(cloudinaryAPI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id,
        timestamp,
        api_key: cloudinaryKey,
        signature,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/cloudinary/delete:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
