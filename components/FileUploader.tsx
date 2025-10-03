'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Trash2, Download } from 'lucide-react'

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
}

export default function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<string>('')
  const [isFileListExpanded, setIsFileListExpanded] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // 構建文件樹結構
  const buildFileTree = (files: File[]) => {
    const tree: any = {}
    
    files.forEach((file, index) => {
      const pathParts = file.name.split('/')
      let current = tree
      
      pathParts.forEach((part, i) => {
        if (i === pathParts.length - 1) {
          // 這是文件
          current[part] = { type: 'file', file, index }
        } else {
          // 這是目錄
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} }
          }
          current = current[part].children
        }
      })
    })
    
    return tree
  }

  // 渲染文件樹
  const renderFileTree = (tree: any, level = 0, path = '') => {
    const items: JSX.Element[] = []
    
    Object.entries(tree).forEach(([name, node]: [string, any]) => {
      const currentPath = path ? `${path}/${name}` : name
      const indent = '  '.repeat(level)
      
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(currentPath)
        const hasChildren = Object.keys(node.children).length > 0
        
        items.push(
          <div key={currentPath} className="select-none">
            <div 
              className="flex items-center space-x-1 py-1 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                const newExpanded = new Set(expandedFolders)
                if (isExpanded) {
                  newExpanded.delete(currentPath)
                } else {
                  newExpanded.add(currentPath)
                }
                setExpandedFolders(newExpanded)
              }}
            >
              <span className="text-gray-500 font-mono text-xs">{indent}</span>
              <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">{name}</span>
            </div>
            {isExpanded && hasChildren && (
              <div>
                {renderFileTree(node.children, level + 1, currentPath)}
              </div>
            )}
          </div>
        )
      } else {
        // 文件
        items.push(
          <div key={currentPath} className="select-none">
            <div className="flex items-center justify-between py-1 hover:bg-gray-50">
              <div 
                className="flex items-center space-x-1 flex-1 cursor-pointer"
                onClick={() => viewFile(node.file)}
                title="點擊查看文件內容"
              >
                <span className="text-gray-500 font-mono text-xs">{indent}</span>
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{name}</span>
                <span className="text-xs text-gray-500">
                  ({(node.file.size / 1024).toFixed(1)} KB)
                </span>
                <span className="text-xs text-blue-500 hover:text-blue-700">
                  點擊查看
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadFile(node.file)
                  }}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 rounded transition-colors"
                  title="下載文件"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFile(node.index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  title="刪除文件"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      }
    })
    
    return items
  }

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

  const viewFile = async (file: File) => {
    try {
      const content = await file.text()
      const blob = new Blob([content], { type: file.type })
      const url = URL.createObjectURL(blob)
      
      // 創建新窗口顯示文件內容
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { 
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                  margin: 20px; 
                  background: #f5f5f5;
                }
                .header {
                  background: #333;
                  color: white;
                  padding: 10px 20px;
                  margin: -20px -20px 20px -20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .filename {
                  font-weight: bold;
                  font-size: 16px;
                }
                .file-info {
                  font-size: 12px;
                  opacity: 0.8;
                }
                .content {
                  background: white;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                  white-space: pre-wrap;
                  overflow-x: auto;
                }
                .actions {
                  margin-top: 20px;
                  text-align: center;
                }
                .btn {
                  background: #007bff;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  cursor: pointer;
                  margin: 0 10px;
                  text-decoration: none;
                  display: inline-block;
                }
                .btn:hover {
                  background: #0056b3;
                }
                .btn-secondary {
                  background: #6c757d;
                }
                .btn-secondary:hover {
                  background: #545b62;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="filename">${file.name}</div>
                  <div class="file-info">${file.type} • ${(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <div class="content">${escapeHtml(content)}</div>
              <div class="actions">
                <a href="${url}" download="${file.name}" class="btn">下載文件</a>
                <button onclick="window.close()" class="btn btn-secondary">關閉</button>
              </div>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    } catch (error) {
      console.error('查看文件失敗:', error)
      alert('無法查看文件內容')
    }
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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
        
        // 顯示下載進度
        setDownloadProgress('🔄 正在下載 GitHub 倉庫...')
        
        // 調用後端 API 下載 GitHub 倉庫
        const response = await fetch('/api/download-github', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owner,
            repo,
            githubUrl
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '下載失敗')
        }
        
        const result = await response.json()
        console.log('GitHub 下載結果:', result)
        
        setDownloadProgress('📁 正在讀取文件...')
        
        // 將下載的文件轉換為 File 對象
        const downloadedFiles: File[] = []
        
        for (const file of result.files) {
          const blob = new Blob([file.content], { type: file.type })
          const fileObj = Object.assign(blob, { 
            name: file.name,
            lastModified: Date.now()
          }) as File
          downloadedFiles.push(fileObj)
        }
        
        setFiles(downloadedFiles)
        onFilesUploaded(downloadedFiles)
        
        // 顯示項目信息（命令行風格）
        const projectInfo = result.projectInfo
        const projectDir = projectInfo?.projectDir || '未知'
        const branch = projectInfo?.branch || 'main'
        
        setDownloadProgress(`✅ 成功下載 ${downloadedFiles.length} 個文件到 ${projectDir}`)
        console.log(`✅ 成功下載 ${downloadedFiles.length} 個文件`)
        console.log(`📁 項目目錄: ${projectDir}`)
        console.log(`🌿 分支: ${branch}`)
        console.log(`📄 文件列表: ${result.files.map(f => f.name).join(', ')}`)
        
        // 3秒後清除進度信息
        setTimeout(() => setDownloadProgress(''), 3000)
        
      } catch (error) {
        console.error('GitHub URL 處理失敗:', error)
        setDownloadProgress('❌ GitHub 連結處理失敗')
        alert(`GitHub 連結處理失敗：${error.message}`)
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

      {/* Download Progress */}
      {downloadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800 font-mono">{downloadProgress}</span>
          </div>
        </div>
      )}

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
            <button
              onClick={() => setIsFileListExpanded(!isFileListExpanded)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>已上傳的文件 ({files.length}):</span>
              <div className={`transform transition-transform ${isFileListExpanded ? 'rotate-180' : ''}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <button
              onClick={clearAllFiles}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>清除全部</span>
            </button>
          </div>
          
          {isFileListExpanded && (
            <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-md p-2">
              <div className="font-mono text-xs text-gray-600 mb-2">
                📁 項目文件結構
              </div>
              {renderFileTree(buildFileTree(files))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
