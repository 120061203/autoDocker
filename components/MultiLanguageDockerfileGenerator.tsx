'use client'

import { useState } from 'react'
import { Download, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MultiLanguageDockerfileGeneratorProps {
  detectedLanguages: string[]
  files: File[]
  languageAnalysisResults?: Array<{
    language: string
    analysisResult: any
  }>
  onDockerfileGenerated: (language: string, dockerfile: string) => void
}

export default function MultiLanguageDockerfileGenerator({ 
  detectedLanguages, 
  files, 
  languageAnalysisResults,
  onDockerfileGenerated 
}: MultiLanguageDockerfileGeneratorProps) {
  const [generatedDockerfiles, setGeneratedDockerfiles] = useState<{ [key: string]: string }>({})
  const [copiedLanguage, setCopiedLanguage] = useState<string>('')

  const getLanguageDisplayName = (lang: string) => {
    const names: { [key: string]: string } = {
      'nodejs': 'Node.js',
      'python': 'Python',
      'go': 'Go',
      'java': 'Java',
      'rust': 'Rust'
    }
    return names[lang] || lang
  }

  const generateDockerfileForLanguage = async (language: string) => {
    try {
      // 優先使用詳細分析結果，如果沒有則使用模擬數據
      let analysisResult
      
      if (languageAnalysisResults && languageAnalysisResults.length > 0) {
        const languageResult = languageAnalysisResults.find(result => result.language === language)
        if (languageResult) {
          analysisResult = languageResult.analysisResult
          console.log(`使用 ${language} 的詳細分析結果:`, analysisResult)
        } else {
          analysisResult = createMockAnalysisResult(language)
          console.log(`未找到 ${language} 的詳細分析結果，使用模擬數據`)
        }
      } else {
        analysisResult = createMockAnalysisResult(language)
        console.log(`沒有詳細分析結果，使用模擬數據`)
      }
      
      // 調用 Dockerfile 生成 API
      const response = await fetch('/api/generate-dockerfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisResult })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Dockerfile 生成失敗')
      }

      const { dockerfile } = await response.json()
      
      setGeneratedDockerfiles(prev => ({
        ...prev,
        [language]: dockerfile
      }))
      
      onDockerfileGenerated(language, dockerfile)
    } catch (error) {
      console.error(`${language} Dockerfile 生成失敗:`, error)
      alert(`無法為 ${getLanguageDisplayName(language)} 生成 Dockerfile：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  const createMockAnalysisResult = (language: string) => {
    const baseResults = {
      'nodejs': {
        language: 'nodejs',
        framework: 'none',
        version: '18',
        packageManager: 'npm',
        startCmd: 'npm start',
        installCmd: 'npm install'
      },
      'python': {
        language: 'python',
        framework: 'none',
        version: '3.11',
        packageManager: 'pip',
        startCmd: 'python app.py',
        installCmd: 'pip install -r requirements.txt'
      },
      'go': {
        language: 'go',
        framework: 'none',
        version: '1.21',
        packageManager: 'go mod',
        startCmd: './main',
        installCmd: 'go mod download'
      },
      'java': {
        language: 'java',
        framework: 'none',
        version: '17',
        packageManager: 'maven',
        startCmd: 'java -jar target/app.jar',
        installCmd: 'mvn install'
      },
      'rust': {
        language: 'rust',
        framework: 'none',
        version: '1.70',
        packageManager: 'cargo',
        startCmd: './target/release/app',
        installCmd: 'cargo build --release'
      }
    }

    return baseResults[language as keyof typeof baseResults] || {
      language,
      framework: 'none',
      version: 'latest',
      packageManager: 'none',
      startCmd: 'echo "No start command"',
      installCmd: 'echo "No install command"'
    }
  }

  const copyToClipboard = async (language: string, dockerfile: string) => {
    try {
      await navigator.clipboard.writeText(dockerfile)
      setCopiedLanguage(language)
      setTimeout(() => setCopiedLanguage(''), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const downloadDockerfile = (language: string, dockerfile: string) => {
    const blob = new Blob([dockerfile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Dockerfile.${language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">多語言 Dockerfile 生成器</h3>
      <p className="text-gray-600 mb-6">
        為每個檢測到的語言生成對應的 Dockerfile：
      </p>
      
      <div className="space-y-4">
        {detectedLanguages.map((language) => (
          <div key={language} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {getLanguageDisplayName(language)}
                </h4>
                <p className="text-sm text-gray-500">
                  {language} 專案 Dockerfile
                </p>
                
                {/* 顯示原始 zbpack 輸出 */}
                {languageAnalysisResults && languageAnalysisResults.length > 0 && (
                  (() => {
                    const languageResult = languageAnalysisResults.find(result => result.language === language)
                    return languageResult?.analysisResult?.rawOutput ? (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">zbpack 原始輸出</h5>
                        <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{languageResult.analysisResult.rawOutput}</pre>
                        </div>
                      </div>
                    ) : null
                  })()
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!generatedDockerfiles[language] ? (
                  <button
                    onClick={() => generateDockerfileForLanguage(language)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    生成 Dockerfile
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(language, generatedDockerfiles[language])}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{copiedLanguage === language ? '已複製' : '複製'}</span>
                    </button>
                    <button
                      onClick={() => downloadDockerfile(language, generatedDockerfiles[language])}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <Download className="h-4 w-4" />
                      <span>下載</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {generatedDockerfiles[language] && (
              <div className="mt-4">
                <SyntaxHighlighter
                  language="dockerfile"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers
                >
                  {generatedDockerfiles[language]}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
