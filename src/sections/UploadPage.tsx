import { useState, useCallback } from 'react'
import { Upload, FileText, Briefcase, Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UploadPageProps {
  onAnalyze: (jobDescription: string, resumeFile: File | null) => void
  error: string | null
}

export default function UploadPage({ onAnalyze, error }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (isPdf) {
        setResumeFile(file)
      } else {
        alert('请上传 PDF 格式的文件')
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      // 检查文件类型
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('请上传 PDF 格式的文件')
        return
      }
      setResumeFile(file)
    }
  }

  const handleAnalyze = () => {
    if (jobDescription.length < 50) {
      return
    }
    onAnalyze(jobDescription, resumeFile)
  }

  const hasJD = jobDescription.length >= 50

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              职脉匹配
            </span>
          </div>
          <nav className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">产品功能</a>
            <a href="#" className="hover:text-blue-600 transition-colors">使用指南</a>
            <a href="#" className="hover:text-blue-600 transition-colors">关于我们</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Hero Text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              AI智能分析你的
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                岗位匹配度
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              上传简历，粘贴岗位JD，AI为你生成可视化匹配报告，
              精准定位优势与短板，提供改进行动清单
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <Card className={`border-2 transition-all duration-300 ${
              resumeFile 
                ? 'border-green-400 bg-green-50/50' 
                : isDragging 
                  ? 'border-blue-400 bg-blue-50/50' 
                  : 'border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
            }`}>
              <CardContent className="p-8">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="cursor-pointer"
                  onClick={() => document.getElementById('resume-input')?.click()}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                      resumeFile 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {resumeFile ? (
                        <FileText className="w-8 h-8 text-green-600" />
                      ) : (
                        <Upload className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {resumeFile ? '简历已上传' : '上传你的简历'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {resumeFile 
                        ? resumeFile.name
                        : '支持 PDF 格式（可选）'}
                    </p>
                    {!resumeFile && (
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                        选择文件
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>

            {/* JD Input */}
            <Card className={`border-2 transition-all duration-300 ${
              hasJD 
                ? 'border-green-400 bg-green-50/50' 
                : 'border-dashed border-slate-300 hover:border-purple-400 hover:bg-slate-50/50'
            }`}>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    hasJD 
                      ? 'bg-green-100' 
                      : 'bg-purple-100'
                  }`}>
                    {hasJD ? (
                      <Briefcase className="w-8 h-8 text-green-600" />
                    ) : (
                      <Briefcase className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {hasJD ? '岗位JD已填写' : '粘贴岗位JD'}
                  </h3>
                  <textarea
                    placeholder="在这里粘贴BOSS直聘、拉勾网等平台的岗位描述..."
                    className="w-full h-24 p-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                    onChange={(e) => setJobDescription(e.target.value)}
                    value={jobDescription}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    {jobDescription.length}/50 字（至少50字）
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyze Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleAnalyze}
              disabled={!hasJD}
              className={`px-12 py-6 text-lg font-semibold rounded-xl transition-all ${
                hasJD
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              解析岗位要求
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-4 text-sm text-slate-500">
              先帮你读懂这个岗位到底要什么
            </p>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">可视化报告</h4>
              <p className="text-sm text-slate-500">雷达图、进度环直观展示匹配度</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">精准定位</h4>
              <p className="text-sm text-slate-500">AI识别优势短板，量化评分</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">行动清单</h4>
              <p className="text-sm text-slate-500">给出可执行的改进步骤</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
