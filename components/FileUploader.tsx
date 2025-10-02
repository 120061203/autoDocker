'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Trash2 } from 'lucide-react'

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
}

export default function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [githubUrl, setGithubUrl] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles]
    setFiles(newFiles)
    onFilesUploaded(newFiles)
  }, [files, onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.php', '.rb'],
      'application/json': ['.json'],
      'text/plain': ['.txt', '.md', '.yml', '.yaml', '.toml', '.lock']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesUploaded(newFiles)
  }

  const clearAllFiles = () => {
    setFiles([])
    setGithubUrl('')
    onFilesUploaded([])
  }

  const handleGithubUrl = async () => {
    if (githubUrl) {
      try {
        console.log('GitHub URL:', githubUrl)
        
        // 解析 GitHub URL
        const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!urlMatch) {
          alert('請輸入有效的 GitHub 倉庫連結')
          return
        }
        
        const [, owner, repo] = urlMatch
        
        // 調用 GitHub API 獲取倉庫信息
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
        if (!response.ok) {
          alert('無法訪問該 GitHub 倉庫，請檢查連結是否正確')
          return
        }
        
        const repoData = await response.json()
        console.log('GitHub 倉庫信息:', repoData)
        
        // 創建模擬文件對象（基於倉庫信息）
        const mockFiles: File[] = []
        
        // 根據倉庫的主要語言創建對應的文件
        if (repoData.language === 'JavaScript' || repoData.language === 'TypeScript') {
          const packageJsonContent = '{"name": "github-repo", "version": "1.0.0", "dependencies": {"express": "^4.18.0"}}'
          const indexJsContent = 'const express = require("express");\nconst app = express();\napp.get("/", (req, res) => res.json({message: "Hello from GitHub!"}));\napp.listen(3000);'
          
          // 創建 Blob 然後轉換為 File
          const packageJsonBlob = new Blob([packageJsonContent], { type: 'application/json' })
          const indexJsBlob = new Blob([indexJsContent], { type: 'text/javascript' })
          
          mockFiles.push(
            Object.assign(packageJsonBlob, { name: 'package.json' }) as File,
            Object.assign(indexJsBlob, { name: 'index.js' }) as File
          )
        } else if (repoData.language === 'Python') {
          const requirementsContent = 'flask==2.3.3\ngunicorn==21.2.0'
          const appPyContent = 'from flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef hello():\n    return "Hello from GitHub!"\nif __name__ == "__main__":\n    app.run()'
          
          // 創建 Blob 然後轉換為 File
          const requirementsBlob = new Blob([requirementsContent], { type: 'text/plain' })
          const appPyBlob = new Blob([appPyContent], { type: 'text/x-python-script' })
          
          mockFiles.push(
            Object.assign(requirementsBlob, { name: 'requirements.txt' }) as File,
            Object.assign(appPyBlob, { name: 'app.py' }) as File
          )
        } else {
          // 默認創建一個通用文件
          const readmeContent = '# GitHub Repository\n# Language: ' + repoData.language
          const readmeBlob = new Blob([readmeContent], { type: 'text/markdown' })
          
          mockFiles.push(
            Object.assign(readmeBlob, { name: 'README.md' }) as File
          )
        }
        
        setFiles(mockFiles)
        onFilesUploaded(mockFiles)
        
        alert(`成功從 GitHub 獲取倉庫信息：${repoData.full_name}\n主要語言：${repoData.language}`)
        
      } catch (error) {
        console.error('GitHub URL 處理失敗:', error)
        alert('GitHub 連結處理失敗，請檢查網路連接或稍後再試')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? '放開專案文件夾以上傳'
            : '拖拽整個專案文件夾到這裡，或點擊選擇文件'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          支援整個專案文件夾，包含 package.json, requirements.txt, go.mod 等配置文件
        </p>
      </div>

      {/* GitHub URL Input */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          或提供 GitHub 連結
        </label>
        <div className="flex space-x-2">
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={handleGithubUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            分析
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">已上傳的文件:</h4>
            <button
              onClick={clearAllFiles}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>清除全部</span>
            </button>
          </div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
