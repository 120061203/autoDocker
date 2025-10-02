'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle } from 'lucide-react'

interface ProjectAnalyzerProps {
  files: File[]
  onAnalysisComplete: (result: any) => void
  onDockerfileGenerated: (dockerfile: string) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export default function ProjectAnalyzer({
  files,
  onAnalysisComplete,
  onDockerfileGenerated,
  isAnalyzing,
  setIsAnalyzing
}: ProjectAnalyzerProps) {
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const analyzeProject = async () => {
    setIsAnalyzing(true)
    
    try {
      console.log('開始分析，文件數量:', files.length)
      
      // 準備 FormData
      const formData = new FormData()
      files.forEach(file => {
        console.log('添加文件:', file.name, file.type)
        formData.append('files', file)
      })
      
      // 調用分析 API
      console.log('調用分析 API...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })
      
      console.log('API 響應狀態:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 錯誤:', errorText)
        throw new Error(`分析失敗: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('分析結果:', result)
      onAnalysisComplete(result)
      
      // 如果是多語言，則不自動生成 Dockerfile，交由 MultiLanguageDockerfileGenerator 處理
      if (result.detectedLanguages && result.detectedLanguages.length > 1) {
        return
      }
      
      // 如果是多語言模式，也不生成 Dockerfile
      if (result.language === 'multiple') {
        return
      }
      
      // 如果是原始輸出模式，仍然嘗試生成 Dockerfile
      // 但需要先從原始輸出中提取語言信息
      if (result.language === 'raw') {
        // 嘗試從 rawOutput 中提取語言信息
        const rawOutput = result.rawOutput || ''
        let extractedLanguage = null
        
        // 更精確的語言檢測
        if (rawOutput.includes('│ nodejs │') || rawOutput.includes('provider') && rawOutput.includes('nodejs')) {
          extractedLanguage = 'nodejs'
        } else if (rawOutput.includes('│ python │') || rawOutput.includes('provider') && rawOutput.includes('python')) {
          extractedLanguage = 'python'
        } else if (rawOutput.includes('│ go │') || rawOutput.includes('provider') && rawOutput.includes('go')) {
          extractedLanguage = 'go'
        } else if (rawOutput.includes('│ java │') || rawOutput.includes('provider') && rawOutput.includes('java')) {
          extractedLanguage = 'java'
        } else if (rawOutput.includes('│ rust │') || rawOutput.includes('provider') && rawOutput.includes('rust')) {
          extractedLanguage = 'rust'
        }
        
        // 如果還是沒檢測到，嘗試更寬鬆的匹配
        if (!extractedLanguage) {
          if (rawOutput.includes('nodejs')) {
            extractedLanguage = 'nodejs'
          } else if (rawOutput.includes('python')) {
            extractedLanguage = 'python'
          } else if (rawOutput.includes('go')) {
            extractedLanguage = 'go'
          } else if (rawOutput.includes('java')) {
            extractedLanguage = 'java'
          } else if (rawOutput.includes('rust')) {
            extractedLanguage = 'rust'
          }
        }
        
        if (extractedLanguage) {
          // 創建一個臨時的分析結果用於 Dockerfile 生成
          const tempResult = {
            ...result,
            language: extractedLanguage,
            framework: rawOutput.includes('framework') ? 'detected' : 'none',
            version: rawOutput.includes('Version') ? 'latest' : 'latest',
            packageManager: rawOutput.includes('packageManager') ? 'detected' : 'none',
            startCmd: rawOutput.includes('startCmd') ? 'detected' : 'echo "No start command"',
            installCmd: rawOutput.includes('installCmd') ? 'detected' : 'echo "No install command"'
          }
          
          try {
            const dockerfileResponse = await fetch('/api/generate-dockerfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ analysisResult: tempResult })
            })

            if (dockerfileResponse.ok) {
              const { dockerfile } = await dockerfileResponse.json()
              onDockerfileGenerated(dockerfile)
            }
          } catch (error) {
            console.log('Dockerfile 生成失敗，但原始輸出仍會顯示:', error)
          }
        }
        return
      }
      
      // 生成 Dockerfile
      const dockerfileResponse = await fetch('/api/generate-dockerfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisResult: result })
      })
      
      if (!dockerfileResponse.ok) {
        const errorData = await dockerfileResponse.json()
        throw new Error(errorData.error || 'Dockerfile 生成失敗')
      }
      
      const { dockerfile } = await dockerfileResponse.json()
      onDockerfileGenerated(dockerfile)
      
    } catch (error) {
      console.error('分析失敗:', error)
      alert(`分析失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const mockAnalyzeProject = async (files: File[]): Promise<any> => {
    // 模擬分析邏輯
    const fileNames = files.map(f => f.name.toLowerCase())
    
    // 檢測語言
    let language = 'unknown'
    let framework = 'none'
    let version = 'latest'
    let packageManager = 'none'
    
    if (fileNames.some(name => name.includes('package.json'))) {
      language = 'nodejs'
      packageManager = 'npm'
      version = '18'
      if (fileNames.some(name => name.includes('next.config'))) {
        framework = 'nextjs'
      } else if (fileNames.some(name => name.includes('react'))) {
        framework = 'react'
      }
    } else if (fileNames.some(name => name.includes('requirements.txt'))) {
      language = 'python'
      packageManager = 'pip'
      version = '3.11'
    } else if (fileNames.some(name => name.includes('go.mod'))) {
      language = 'go'
      packageManager = 'go mod'
      version = '1.21'
    } else if (fileNames.some(name => name.includes('pom.xml'))) {
      language = 'java'
      packageManager = 'maven'
      version = '17'
    }
    
    return {
      language,
      framework,
      version,
      packageManager,
      startCmd: getStartCommand(language, framework),
      installCmd: getInstallCommand(language, packageManager)
    }
  }

  const getStartCommand = (language: string, framework: string): string => {
    switch (language) {
      case 'nodejs':
        if (framework === 'nextjs') return 'npm start'
        return 'node index.js'
      case 'python':
        return 'python app.py'
      case 'go':
        return './main'
      case 'java':
        return 'java -jar app.jar'
      default:
        return 'echo "No start command configured"'
    }
  }

  const getInstallCommand = (language: string, packageManager: string): string => {
    switch (packageManager) {
      case 'npm':
        return 'npm install'
      case 'yarn':
        return 'yarn install'
      case 'pip':
        return 'pip install -r requirements.txt'
      case 'maven':
        return 'mvn install'
      case 'go mod':
        return 'go mod download'
      default:
        return 'echo "No install command configured"'
    }
  }

  const generateDockerfile = (result: any): string => {
    const { language, framework, version, startCmd, installCmd } = result
    
    let dockerfile = ''
    
    switch (language) {
      case 'nodejs':
        dockerfile = `FROM node:${version}-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["${startCmd}"]`
        break
        
      case 'python':
        dockerfile = `FROM python:${version}-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["${startCmd}"]`
        break
        
      case 'go':
        dockerfile = `FROM golang:${version}-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build the application
RUN go build -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Start command
CMD ["./main"]`
        break
        
      case 'java':
        dockerfile = `FROM openjdk:${version}-jdk-slim

WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build the application
RUN mvn package -DskipTests

# Expose port
EXPOSE 8080

# Start command
CMD ["java", "-jar", "target/app.jar"]`
        break
        
      default:
        dockerfile = `# 無法自動識別專案類型
# 請手動配置 Dockerfile

FROM alpine:latest
WORKDIR /app
COPY . .
CMD ["echo", "請配置適當的啟動命令"]`
    }
    
    return dockerfile
  }

  return (
    <div className="space-y-4">
      {!analysisResult ? (
        <button
          onClick={analyzeProject}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>分析中...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>開始分析</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">分析完成</span>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="text-xs text-gray-500 text-center">
          正在分析 {files.length} 個文件...
        </div>
      )}
    </div>
  )
}
