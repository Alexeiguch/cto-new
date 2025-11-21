import { NextResponse } from 'next/server'
import { getDocuments } from '@/app/actions/documents'

export async function GET() {
  try {
    const result = await getDocuments()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}