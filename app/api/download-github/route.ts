import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, githubUrl } = await request.json()
    
    console.log('開始下載 GitHub 倉庫:', { owner, repo, githubUrl })
    
    // 創建臨時目錄
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'github-download-'))
    console.log('臨時目錄:', tempDir)
    
    try {
      // 克隆 GitHub 倉庫
      console.log('正在克隆倉庫...')
      await execAsync(`git clone --depth 1 ${githubUrl}.git "${tempDir}"`)
      
      // 讀取倉庫中的關鍵文件
      const files = await readProjectFiles(tempDir)
      
      console.log(`成功下載 ${files.length} 個文件`)
      
      // 清理臨時目錄
      await fs.rm(tempDir, { recursive: true })
      console.log('已清理臨時目錄')
      
      return NextResponse.json({
        success: true,
        files,
        message: `成功下載 ${files.length} 個文件`
      })
      
    } catch (error) {
      // 確保清理臨時目錄
      try {
        await fs.rm(tempDir, { recursive: true })
      } catch (cleanupError) {
        console.error('清理臨時目錄失敗:', cleanupError)
      }
      throw error
    }
    
  } catch (error) {
    console.error('GitHub 下載失敗:', error)
    return NextResponse.json(
      { 
        error: 'GitHub 下載失敗', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function readProjectFiles(dir: string): Promise<any[]> {
  const files: any[] = []
  
  // 定義要讀取的關鍵文件
  const keyFiles = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'requirements.txt',
    'Pipfile',
    'pyproject.toml',
    'go.mod',
    'go.sum',
    'pom.xml',
    'build.gradle',
    'Cargo.toml',
    'Cargo.lock',
    'composer.json',
    'Gemfile',
    'Gemfile.lock',
    'Dockerfile',
    'docker-compose.yml',
    '.gitignore',
    'README.md'
  ]
  
  // 讀取關鍵文件
  for (const fileName of keyFiles) {
    try {
      const filePath = path.join(dir, fileName)
      const content = await fs.readFile(filePath, 'utf-8')
      const fileType = getFileType(fileName)
      
      files.push({
        name: fileName,
        content,
        type: fileType,
        size: content.length
      })
      
      console.log(`讀取文件: ${fileName} (${content.length} bytes)`)
    } catch (error) {
      // 文件不存在，跳過
      console.log(`文件不存在: ${fileName}`)
    }
  }
  
  // 如果沒有找到關鍵文件，嘗試讀取根目錄下的所有文件
  if (files.length === 0) {
    console.log('沒有找到關鍵文件，讀取根目錄所有文件')
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.')) {
          try {
            const filePath = path.join(dir, entry.name)
            const content = await fs.readFile(filePath, 'utf-8')
            const fileType = getFileType(entry.name)
            
            files.push({
              name: entry.name,
              content,
              type: fileType,
              size: content.length
            })
            
            console.log(`讀取文件: ${entry.name} (${content.length} bytes)`)
          } catch (error) {
            console.log(`無法讀取文件: ${entry.name}`)
          }
        }
      }
    } catch (error) {
      console.error('讀取目錄失敗:', error)
    }
  }
  
  return files
}

function getFileType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  
  const typeMap: { [key: string]: string } = {
    '.json': 'application/json',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.jsx': 'text/javascript',
    '.tsx': 'text/typescript',
    '.py': 'text/x-python-script',
    '.go': 'text/x-go',
    '.java': 'text/x-java-source',
    '.rs': 'text/x-rust',
    '.php': 'text/x-php',
    '.rb': 'text/x-ruby',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.yml': 'text/yaml',
    '.yaml': 'text/yaml',
    '.toml': 'text/x-toml',
    '.lock': 'text/plain',
    '.xml': 'text/xml',
    '.gradle': 'text/x-gradle',
    '.dockerfile': 'text/x-dockerfile',
    '.gitignore': 'text/plain'
  }
  
  return typeMap[ext] || 'text/plain'
}
