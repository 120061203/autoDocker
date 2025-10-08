import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, githubUrl, branch = 'main' } = await request.json()
    
    console.log('開始下載 GitHub 倉庫:', { owner, repo, githubUrl, branch })
    
    // 創建特定格式的目錄名稱
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14) // YYYYMMDDHHMMSS
    const projectDir = `${owner}_${repo}_${branch}_${timestamp}`
    
    // 創建項目目錄
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), projectDir + '-'))
    console.log('項目目錄:', tempDir)
    
    try {
      // 克隆 GitHub 倉庫到臨時子目錄
      console.log('正在克隆倉庫...')
      const cloneDir = path.join(tempDir, 'repo')
      const cloneCommand = `git clone --depth 1 --branch ${branch} "${githubUrl}.git" "${cloneDir}"`
      console.log('執行命令:', cloneCommand)
      
      const { stdout, stderr } = await execAsync(cloneCommand)
      console.log('git clone 輸出:', stdout)
      if (stderr) console.log('git clone 錯誤:', stderr)
      
      // 檢查克隆是否成功
      const stats = await fs.stat(cloneDir)
      if (!stats.isDirectory()) {
        throw new Error('克隆失敗：目標目錄不存在')
      }
      
      // 讀取倉庫中的關鍵文件
      const files = await readProjectFiles(cloneDir)
      
      console.log(`成功下載 ${files.length} 個文件`)
      
      // 返回文件列表和項目信息
      const response = NextResponse.json({
        success: true,
        files,
        projectInfo: {
          owner,
          repo,
          branch,
          timestamp,
          projectDir,
          downloadPath: tempDir
        },
        message: `成功下載 ${files.length} 個文件到 ${projectDir}`
      })
      
      // 清理臨時目錄
      await fs.rm(tempDir, { recursive: true })
      console.log('已清理臨時目錄')
      
      return response
      
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
    console.error('錯誤詳情:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isNetworkError = errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')
    const isGitError = errorMessage.includes('git clone') || errorMessage.includes('fatal:')
    
    let userMessage = 'GitHub 下載失敗'
    if (isNetworkError) {
      userMessage = '網絡連接失敗，請檢查網絡連接'
    } else if (isGitError) {
      userMessage = 'Git 克隆失敗，請檢查倉庫 URL 是否正確'
    }
    
    return NextResponse.json(
      { 
        error: userMessage, 
        details: errorMessage,
        type: isNetworkError ? 'network' : isGitError ? 'git' : 'unknown'
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
  
  // 遞歸讀取整個項目目錄，保持文件結構
  await readDirectoryRecursively(dir, '', files)
  
  return files
}

async function readDirectoryRecursively(dir: string, basePath: string, files: any[]): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(basePath, entry.name)
      
      if (entry.isDirectory()) {
        // 遞歸讀取子目錄
        await readDirectoryRecursively(fullPath, relativePath, files)
      } else if (entry.isFile()) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8')
          const fileType = getFileType(entry.name)
          
          files.push({
            name: relativePath,
            content,
            type: fileType,
            size: content.length
          })
        } catch (error) {
          // 靜默跳過無法讀取的文件
        }
      }
    }
  } catch (error) {
    // 靜默跳過無法讀取的目錄
  }
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
