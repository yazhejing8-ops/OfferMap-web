import { useState, useEffect } from 'react'
import './App.css'
import UploadPage from './sections/UploadPage'
import JobAnalysisPage from './sections/JobAnalysisPage'
import ResultPage from './sections/ResultPage'
import LoginDialog from './components/LoginDialog'
import { analyzeJobDescription, parseResume, analyzeMatch, getSharedAnalysis } from './services/api'
import { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { User as UserIcon } from 'lucide-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export type JobRequirement = {
  title: string
  company: string
  location: string
  salary: string
  coreSkills: string[]
  software: string[]
  keyResponsibilities: string[]
  challenges: string[]
  jargon: string[]
  summary: string
}

export type ResumeAnalysis = {
  name: string
  experience: string
  intention: string
  coreSkills: string[]
  workHighlights: string[]
  achievements: string[]
  potentialStrengths: string[]
  potentialWeaknesses: string[]
}

export type AnalysisData = {
  overallScore: number
  overallLabel: string
  overallComment: string
  dimensions: {
    name: string
    score: number
    fullMark: number
  }[]
  strengths: {
    title: string
    description: string
    score: number
  }[]
  weaknesses: {
    title: string
    description: string
    score: number
  }[]
  actions: {
    period: string
    items: string[]
  }[]
}

// 加载状态组件
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-slate-600">{message}</p>
        <p className="text-sm text-slate-400 mt-2">AI正在分析中，请稍候...</p>
      </div>
    </div>
  )
}

// localStorage 键名
const STORAGE_KEY = 'offermap_analysis_data'
const USER_KEY = 'offermap_user'

function App() {
  const [currentPage, setCurrentPage] = useState<'upload' | 'loading' | 'jobAnalysis' | 'result'>('upload')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [jobData, setJobData] = useState<JobRequirement | null>(null)
  const [resumeData, setResumeData] = useState<ResumeAnalysis | null>(null)
  const [matchData, setMatchData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [isLoadingShare, setIsLoadingShare] = useState(false)

  // 初始化：恢复本地数据、检查登录状态、检查分享链接
  useEffect(() => {
    // 检查分享链接
    const params = new URLSearchParams(window.location.search)
    const shareId = params.get('shareId')
    if (shareId) {
      setIsLoadingShare(true)
      getSharedAnalysis(shareId)
        .then((res) => {
          if (res.data) {
            setJobData(res.data.jobData)
            setResumeData(res.data.resumeData || null)
            setMatchData(res.data.matchData)
            setCurrentPage('result')
          }
        })
        .catch((err) => {
          setError(err.message || '分享链接已失效')
        })
        .finally(() => {
          setIsLoadingShare(false)
        })
      return
    }

    // 恢复本地数据
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.jobData) {
          setJobData(parsed.jobData)
          setResumeData(parsed.resumeData)
          setMatchData(parsed.matchData)
          if (parsed.matchData) {
            setCurrentPage('result')
          } else if (parsed.jobData) {
            setCurrentPage('jobAnalysis')
          }
        }
      } catch (e) {
        console.error('恢复数据失败:', e)
      }
    }

    // 恢复登录用户
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('恢复用户失败:', e)
      }
    }

    // 监听 Supabase 登录状态变化
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem(USER_KEY, JSON.stringify(session.user))
        }
      })
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem(USER_KEY, JSON.stringify(session.user))
        } else {
          setUser(null)
          localStorage.removeItem(USER_KEY)
        }
      })
    }
  }, [])

  // 数据变化时保存到 localStorage
  useEffect(() => {
    const dataToSave = {
      jobData,
      resumeData,
      matchData
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, [jobData, resumeData, matchData])

  const handleAnalyze = async (jobDescription: string, resumeFile: File | null) => {
    try {
      setError(null)
      
      // 第一步：解析岗位JD
      setLoadingMessage('正在解析岗位要求...')
      setCurrentPage('loading')
      
      const jobResult = await analyzeJobDescription(jobDescription)
      setJobData(jobResult.data)
      
      // 如果有简历文件，继续解析
      if (resumeFile) {
        setLoadingMessage('正在解析简历内容...')
        const resumeResult = await parseResume(resumeFile)
        setResumeData(resumeResult.data.analysis)
        
        // 进行匹配度分析
        setLoadingMessage('正在进行匹配度分析...')
        const matchResult = await analyzeMatch(
          resumeResult.data.analysis,
          jobResult.data
        )
        setMatchData(matchResult.data)
      }
      
      // 显示岗位解析页面
      setCurrentPage('jobAnalysis')
    } catch (err: any) {
      setError(err.message || '分析失败，请稍后重试')
      setCurrentPage('upload')
    }
  }

  const handleViewResult = () => {
    if (matchData) {
      setCurrentPage('result')
    }
  }

  const handleBack = () => {
    if (currentPage === 'result') {
      setCurrentPage('jobAnalysis')
    } else if (currentPage === 'jobAnalysis') {
      setCurrentPage('upload')
    }
  }

  const handleNewAnalysis = () => {
    // 在新的标签页开启新的分析，不覆盖当前页面
    localStorage.removeItem(STORAGE_KEY)
    const newUrl = window.location.origin + window.location.pathname
    window.open(newUrl, '_blank')
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser))
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  if (isLoadingShare) {
    return <LoadingScreen message="正在加载分享报告..." />
  }

  if (currentPage === 'loading') {
    return <LoadingScreen message={loadingMessage} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部登录栏 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-end gap-3 text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-600">
                {user.email || user.user_metadata?.full_name || '已登录用户'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 h-8">
                退出
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)} className="text-slate-600 h-8">
              <UserIcon className="w-4 h-4 mr-1" />
              登录 / 注册
            </Button>
          )}
        </div>
      </div>

      {currentPage === 'upload' && (
        <UploadPage 
          onAnalyze={handleAnalyze} 
          error={error}
        />
      )}
      {currentPage === 'jobAnalysis' && jobData && (
        <JobAnalysisPage 
          job={jobData} 
          hasResume={!!resumeData}
          onViewResult={handleViewResult}
          onBack={handleBack}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
      {currentPage === 'result' && matchData && jobData && (
        <ResultPage 
          data={matchData} 
          job={jobData}
          onBack={handleBack}
          onNewAnalysis={handleNewAnalysis}
        />
      )}

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLogin={handleLogin} />
    </div>
  )
}

export default App
