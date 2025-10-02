import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('收到分析請求')
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const selectedLanguage = formData.get('selectedLanguage') as string

    console.log('接收到的文件數量:', files.length)
    console.log('用戶選擇的語言:', selectedLanguage)
    files.forEach(file => {
      console.log('文件:', file.name, file.size, file.type)
    })

    if (!files || files.length === 0) {
      console.log('沒有提供文件')
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // 這裡應該調用實際的 zbpack 分析邏輯
    // 由於 zbpack 是 Go 程序，我們需要通過子進程或 API 調用
    console.log('開始分析...')
    const analysisResult = await analyzeWithZbpack(files, selectedLanguage)
    console.log('分析完成:', analysisResult)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function analyzeWithZbpack(files: File[], selectedLanguage?: string): Promise<any> {
  const fs = require('fs').promises
  const path = require('path')
  const os = require('os')
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)
  
  // 創建臨時目錄
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zbpack-'))
  
  try {
    // 保存文件到臨時目錄
    for (const file of files) {
      const filePath = path.join(tempDir, file.name)
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)
    }
    
    console.log('調用 zbpack 分析:', tempDir)
    
    // 調用 zbpack 分析
    const { stdout, stderr } = await execAsync(`zbpack --info "${tempDir}"`)
    
    if (stderr) {
      console.error('zbpack 錯誤:', stderr)
    }
    
    console.log('zbpack 輸出:', stdout)
    
    // 解析 zbpack 輸出
    const analysisResult = parseZbpackOutput(stdout)
    
    return analysisResult
    
  } finally {
    // 清理臨時目錄
    try {
      await fs.rm(tempDir, { recursive: true })
    } catch (error) {
      console.error('清理臨時目錄失敗:', error)
    }
  }
}

function parseZbpackOutput(output: string): any {
  console.log('解析 zbpack 輸出:', output)
  
  const lines = output.split('\n')
  let language = 'unknown'
  let framework = 'none'
  let version = 'latest'
  let packageManager = 'none'
  let startCmd = 'echo "No start command"'
  let installCmd = 'echo "No install command"'
  
  // 解析 zbpack 的表格輸出
  for (const line of lines) {
    if (line.includes('│ provider')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match) {
        language = match[1]
      }
    } else if (line.includes('│ nodeVersion')) {
      const match = line.match(/│\s*(\d+)\s*│/)
      if (match) {
        version = match[1]
      }
    } else if (line.includes('│ framework')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match && match[1] !== 'none') {
        framework = match[1]
      }
    } else if (line.includes('│ packageManager')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match && match[1] !== 'unknown') {
        packageManager = match[1]
      }
    } else if (line.includes('│ startCmd')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        startCmd = match[1].trim()
      }
    } else if (line.includes('│ installCmd')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        installCmd = match[1].trim()
      }
    }
  }
  
  // 根據語言類型調整包管理器
  if (language === 'nodejs') {
    if (packageManager === 'unknown') {
      packageManager = 'npm'
    }
  } else if (language === 'python') {
    packageManager = 'pip'
  } else if (language === 'go') {
    packageManager = 'go mod'
  } else if (language === 'java') {
    packageManager = 'maven'
  } else if (language === 'rust') {
    packageManager = 'cargo'
  }
  
  return {
    language,
    framework,
    version,
    packageManager,
    startCmd,
    installCmd,
    detectedLanguages: [language],
    buildPlan: {
      provider: language,
      startCmd,
      packageManager,
      framework,
      version,
      installCmd
    }
  }
}
