import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
}
const ALLOWED_TYPES = Object.keys(MIME_TO_EXT)
const MAX_BYTES     = 5 * 1024 * 1024  // 5 MB

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File))
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Faqat JPG, PNG yoki WEBP rasm yuklang' }, { status: 415 })
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: 'Rasm hajmi 5MB dan oshmasligi kerak' }, { status: 413 })

    const ext      = MIME_TO_EXT[file.type]
    const rand     = Math.random().toString(36).slice(2, 10)
    const fileName = `products/${Date.now()}-${rand}.${ext}`
    const buffer   = Buffer.from(await file.arrayBuffer())
    const supabase = getAdminClient()

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType:  file.type,
        upsert:       false,
        cacheControl: '31536000',
      })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Yuklashda xatolik' }, { status: 500 })
  }
}
