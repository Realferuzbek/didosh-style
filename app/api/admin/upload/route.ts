import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

// Map MIME type → file extension (never trust the filename from client)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
}

const ALLOWED_TYPES = Object.keys(MIME_TO_EXT)
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    // Type guard — must be a File object
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }

    // Validate MIME type (checked server-side — client can lie about this)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Faqat JPG, PNG yoki WEBP rasm yuklang' },
        { status: 415 }
      )
    }

    // Validate size
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Rasm hajmi 5MB dan oshmasligi kerak" },
        { status: 413 }
      )
    }

    // Extension from MIME — never from the original filename
    const ext = MIME_TO_EXT[file.type]

    // Collision-resistant name: timestamp + 8 random chars
    const randomPart = Math.random().toString(36).slice(2, 10)
    const fileName = `products/${Date.now()}-${randomPart}.${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const supabase = getAdminClient()

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        // Cache for 1 year in CDN — images are immutable (new name = new upload)
        cacheControl: '31536000',
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: 'Yuklashda xatolik' }, { status: 500 })
  }
}