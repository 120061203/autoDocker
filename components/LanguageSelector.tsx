'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface LanguageSelectorProps {
  detectedLanguages: string[]
  onLanguageSelected: (language: string) => void
}

export default function LanguageSelector({ detectedLanguages, onLanguageSelected }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  const handleSelect = (language: string) => {
    setSelectedLanguage(language)
  }

  const handleConfirm = () => {
    if (selectedLanguage) {
      onLanguageSelected(selectedLanguage)
    }
  }

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

  const getLanguageDescription = (lang: string) => {
    const descriptions: { [key: string]: string } = {
      'nodejs': 'JavaScript/TypeScript 運行環境',
      'python': 'Python 解釋器',
      'go': 'Go 編譯器',
      'java': 'Java 虛擬機',
      'rust': 'Rust 編譯器'
    }
    return descriptions[lang] || ''
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">檢測到多種語言</h3>
      <p className="text-gray-600 mb-6">
        您的專案包含多種程式語言，請選擇主要語言來生成對應的 Dockerfile：
      </p>
      
      <div className="space-y-3">
        {detectedLanguages.map((lang) => (
          <div
            key={lang}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedLanguage === lang
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSelect(lang)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === lang
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedLanguage === lang && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {getLanguageDisplayName(lang)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getLanguageDescription(lang)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={!selectedLanguage}
          className={`px-6 py-2 rounded-md font-medium ${
            selectedLanguage
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          確認選擇
        </button>
      </div>
    </div>
  )
}
