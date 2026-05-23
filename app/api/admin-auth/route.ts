import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const correct = process.env.ADMIN_PASSWORD
    if (!correct || password !== correct) {
      await new Promise(r => setTimeout(r, 300))
      return NextResponse.json({ ok: false }, { status: 401 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}