import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json()
    
    // 這裡可以調用外部 zbpack 服務
    // 或者使用模擬數據作為備用方案
    const mockAnalysis = {
      language: 'nodejs',
      framework: 'none',
      version: '22',
      packageManager: 'npm',
      startCmd: 'npm start',
      installCmd: 'npm install',
      rawOutput: 'Mock zbpack output for Vercel deployment'
    }
    
    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error('zbpack proxy error:', error)
    return NextResponse.json(
      { error: 'zbpack analysis failed' },
      { status: 500 }
    )
  }
}
