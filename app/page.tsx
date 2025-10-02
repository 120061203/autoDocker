'use client'

import { useState } from 'react'
import { Upload, FileText, Download, Code, Github, Container } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import DockerfilePreview from '@/components/DockerfilePreview'
import ProjectAnalyzer from '@/components/ProjectAnalyzer'
import MultiLanguageDockerfileGenerator from '@/components/MultiLanguageDockerfileGenerator'

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [dockerfile, setDockerfile] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showMultiLanguageGenerator, setShowMultiLanguageGenerator] = useState(false)

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setAnalysisResult(null)
    setDockerfile('')
  }

  const handleAnalysisComplete = (result: any) => {
    console.log('主頁面收到分析結果:', result)
    setAnalysisResult(result)
    setIsAnalyzing(false)
    
    // 如果檢測到多種語言，直接顯示多語言生成器
    if (result.detectedLanguages && result.detectedLanguages.length > 1) {
      setShowMultiLanguageGenerator(true)
    }
  }


  const handleDockerfileGenerated = (dockerfileContent: string) => {
    setDockerfile(dockerfileContent)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Container className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AutoDocker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/zeabur/zbpack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Github className="h-5 w-5" />
                <span>基於 zbpack</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            智能 Dockerfile 生成器
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            基於 zbpack 技術，智能分析您的專案並生成最優的 Dockerfile
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>智能分析</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>自動生成</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>下載使用</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Step 1: Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">1. 上傳專案</h3>
            </div>
            <p className="text-gray-600 mb-4">
              上傳您的專案文件或提供 GitHub 連結
            </p>
            <FileUploader onFilesUploaded={handleFilesUploaded} />
          </div>

          {/* Step 2: Analyze */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">2. 智能分析</h3>
            </div>
            <p className="text-gray-600 mb-4">
              自動識別語言、框架和依賴
            </p>
            {uploadedFiles.length > 0 && (
              <ProjectAnalyzer
                files={uploadedFiles}
                onAnalysisComplete={handleAnalysisComplete}
                onDockerfileGenerated={handleDockerfileGenerated}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            )}
          </div>
        </div>

        {/* Results */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">分析結果</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">語言</div>
                <div className="font-semibold text-gray-900">{analysisResult.language || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">框架</div>
                <div className="font-semibold text-gray-900">{analysisResult.framework || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">版本</div>
                <div className="font-semibold text-gray-900">{analysisResult.version || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">包管理器</div>
                <div className="font-semibold text-gray-900">{analysisResult.packageManager || 'N/A'}</div>
              </div>
            </div>
            
            {/* 顯示檢測到的所有語言 */}
            {analysisResult.detectedLanguages && analysisResult.detectedLanguages.length > 1 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-2">檢測到的所有語言：</div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.detectedLanguages.map((lang: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-blue-500 mt-2">
                  檢測到多種語言，可以為每個語言生成對應的 Dockerfile。
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-Language Dockerfile Generator */}
        {showMultiLanguageGenerator && analysisResult?.detectedLanguages && analysisResult.detectedLanguages.length > 1 && (
          <MultiLanguageDockerfileGenerator
            detectedLanguages={analysisResult.detectedLanguages}
            files={uploadedFiles}
            onDockerfileGenerated={(language, dockerfile) => {
              console.log(`Generated Dockerfile for ${language}`)
            }}
          />
        )}

        {/* Dockerfile Preview */}
        {dockerfile && (
          <DockerfilePreview dockerfile={dockerfile} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>基於 <a href="https://github.com/zeabur/zbpack" className="text-blue-600 hover:underline">zbpack</a> 技術構建</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
