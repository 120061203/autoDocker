import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 檢查 zbpack 是否可用
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    try {
      await execAsync('zbpack --version')
      return NextResponse.json({ 
        status: 'healthy',
        zbpack: 'available',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return NextResponse.json({ 
        status: 'degraded',
        zbpack: 'unavailable',
        error: 'zbpack command not found',
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}