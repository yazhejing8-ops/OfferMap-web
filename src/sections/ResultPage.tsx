import { useRef, useState } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, Download, Share2, ThumbsUp, AlertTriangle, Lightbulb, Clock, Rocket, Sparkles, Building2, MapPin, Wallet, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { AnalysisData, JobRequirement } from '../App'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAnalysis } from '../services/api'

interface ResultPageProps {
  data: AnalysisData
  job: JobRequirement
  onBack: () => void
  onNewAnalysis: () => void
}

// 获取总体匹配度颜色（柠檬黄方案）
const getOverallScoreColor = (score: number) => {
  if (score >= 95) return '#22c55e'
  if (score >= 85) return '#84cc16'
  if (score >= 70) return '#eab308'
  if (score >= 60) return '#f97316'
  return '#ef4444'
}

// 获取总体评价文案
const getOverallLabel = (score: number) => {
  if (score >= 95) return '非常匹配'
  if (score >= 85) return '相对匹配'
  if (score >= 70) return '勉强匹配'
  if (score >= 60) return '不太匹配'
  return '完全不匹配'
}

const getOverallComment = (score: number) => {
  if (score >= 95) return '可以直接投递，成功率很高'
  if (score >= 85) return '比及格好了一点，但还有提升空间'
  if (score >= 70) return '基本达标，但需要重点补强短板'
  if (score >= 60) return '差距有点大，建议再积累一下'
  return '建议换个岗位试试，这个不太合适'
}

// 雷达图维度颜色
const getDimensionColor = (score: number) => {
  if (score >= 90) return '#ef4444'
  if (score >= 80) return '#f97316'
  if (score >= 70) return '#eab308'
  if (score >= 60) return '#22c55e'
  return '#3b82f6'
}

// 默认数据
const defaultDimensions = [
  { name: 'AIGC工具', score: 70, fullMark: 100 },
  { name: '影像编辑', score: 70, fullMark: 100 },
  { name: '工作流搭建', score: 70, fullMark: 100 },
  { name: '审美创意', score: 70, fullMark: 100 },
  { name: '品牌思维', score: 70, fullMark: 100 },
  { name: '导演思维', score: 70, fullMark: 100 }
]

const defaultStrengths = [{
  title: '有一定基础',
  description: '你的简历显示你具备相关领域的基础知识和经验，这是一个好的起点。建议继续深耕，积累更多实战项目经验，逐步提升自己的核心竞争力。',
  score: 70
}]

const defaultWeaknesses = [{
  title: '还有提升空间',
  description: '与岗位要求相比，你在某些方面还有差距。建议针对性地学习提升，弥补短板，增强自己的职场竞争力。',
  score: 60
}]

const defaultActions = [
  {
    period: '今天就能做的事',
    items: ['整理你的项目作品集', '更新简历突出核心技能']
  }
]

export default function ResultPage({ data, job, onBack, onNewAnalysis }: ResultPageProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // 使用实际数据或默认数据
  const dimensions = data.dimensions?.length > 0 ? data.dimensions : defaultDimensions
  const strengths = data.strengths?.length > 0 ? data.strengths : defaultStrengths
  const weaknesses = data.weaknesses?.length > 0 ? data.weaknesses : defaultWeaknesses
  const actions = data.actions?.length > 0 ? data.actions : defaultActions

  const scoreColor = getOverallScoreColor(data.overallScore)
  const overallLabel = getOverallLabel(data.overallScore)
  const overallComment = getOverallComment(data.overallScore)

  const ringData = [
    { name: '匹配度', value: data.overallScore, color: scoreColor },
    { name: '剩余', value: 100 - data.overallScore, color: '#e2e8f0' },
  ]

  const maxScore = Math.max(...dimensions.map(d => d.score))
  const minScore = Math.min(...dimensions.map(d => d.score))

  // 导出PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return
    try {
      setIsExporting(true)
      const element = reportRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      let imgY = 10
      let position = imgY

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      const heightLeft = imgHeight * ratio - (pdfHeight - 20)

      if (heightLeft > 0) {
        let currentHeightLeft = heightLeft
        while (currentHeightLeft > 0) {
          position = currentHeightLeft - imgHeight * ratio + 10
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
          currentHeightLeft -= (pdfHeight - 20)
        }
      }

      pdf.save(`职脉匹配报告-${job.title || '岗位分析'}.pdf`)
    } catch (err) {
      console.error('PDF导出失败:', err)
      alert('PDF导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  // 生成分享链接
  const handleShare = async () => {
    try {
      setShareLoading(true)
      const result = await saveAnalysis({
        jobData: job,
        matchData: data,
      })
      const url = `${window.location.origin}${window.location.pathname}?shareId=${result.shareId}`
      setShareUrl(url)
      setShareDialogOpen(true)
    } catch (err: any) {
      alert('生成分享链接失败: ' + (err.message || '未知错误'))
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-lg font-semibold text-slate-900">匹配度分析</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onNewAnalysis} className="text-slate-600">
              <Plus className="w-4 h-4 mr-2" />
              新分析
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={shareLoading} className="text-slate-600">
              <Share2 className="w-4 h-4 mr-2" />
              {shareLoading ? '生成中...' : '分享'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="text-slate-600">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? '导出中...' : '导出PDF'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - PDF导出区域 */}
      <main ref={reportRef} className="max-w-6xl mx-auto px-6 py-8 bg-white">
        {/* 岗位信息卡片 */}
        <Card className="mb-8 bg-slate-50/50 border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {job.company || '未知公司'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location || '未知地点'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    {job.salary || '薪资面议'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 顶部概览区 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* 总体匹配度 */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">总体匹配度</h2>
                <p className="text-slate-500">基于简历与岗位JD的智能分析</p>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-56 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ringData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {ringData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold" style={{ color: scoreColor }}>
                      {data.overallScore}
                    </span>
                    <span className="text-sm text-slate-400 mt-1">满分100</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div 
                  className="inline-block px-4 py-2 rounded-full text-lg font-semibold"
                  style={{ backgroundColor: scoreColor + '15', color: scoreColor }}
                >
                  {overallLabel}
                </div>
                <p className="text-slate-600">{overallComment}</p>
                <p className="text-sm text-slate-400">超过95分才能算&quot;非常匹配&quot;</p>
              </div>
            </CardContent>
          </Card>

          {/* 能力雷达图 */}
          <Card>
            <CardContent className="p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">能力六维图</h2>
                <p className="text-slate-500 text-sm">
                  <span className="text-red-500 font-medium">红色=强项</span> · 
                  <span className="text-blue-500 font-medium ml-2">蓝色=弱项</span>
                </p>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dimensions}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                      tickCount={6}
                    />
                    <Radar
                      name="你的能力"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="#6366f1"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              {/* 能力维度列表 */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {dimensions.map((dim) => {
                  const color = getDimensionColor(dim.score)
                  const isMax = dim.score === maxScore
                  const isMin = dim.score === minScore
                  
                  return (
                    <div 
                      key={dim.name} 
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ backgroundColor: color + '10' }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 truncate">{dim.name}</p>
                        <p className="text-sm font-bold" style={{ color }}>
                          {dim.score}
                          {isMax && <span className="text-xs ml-1">👍</span>}
                          {isMin && <span className="text-xs ml-1">⚠️</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 优势与短板 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* 还不错的地方 */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50/30 to-emerald-50/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                <ThumbsUp className="w-5 h-5" />
                还不错的地方
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strengths.map((strength, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-4 border border-green-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm">{strength.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {strength.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 差强人意的部分 */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-amber-50/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                <AlertTriangle className="w-5 h-5" />
                差强人意的部分
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weaknesses.map((weakness, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm">{weakness.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {weakness.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 改进行动清单 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              接下来你可以这样做
            </CardTitle>
            <p className="text-indigo-100 text-sm mt-1">
              不用等，现在就能动手
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {actions.map((action, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {index === 0 ? <Clock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{action.period}</h3>
                  </div>
                  <ul className="space-y-3 ml-13">
                    {action.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          index === 0 ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <span className={`text-xs font-bold ${
                            index === 0 ? 'text-red-600' : 'text-blue-600'
                          }`}>{itemIndex + 1}</span>
                        </div>
                        <span className="text-slate-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 底部CTA */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="text-left">
              <p className="font-semibold text-slate-900">想要更详细的分析？</p>
              <p className="text-sm text-slate-500">获取完整版报告 + 简历优化建议</p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              了解更多
            </Button>
          </div>
        </div>
      </main>

      {/* 分享弹窗 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享匹配报告</DialogTitle>
            <DialogDescription>
              链接有效期为 48 小时，过期后自动失效
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50"
            />
            <Button onClick={handleCopyLink} size="sm" className="shrink-0">
              {copied ? <Check className="w-4 h-4 mr-1" /> : null}
              {copied ? '已复制' : '复制链接'}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            你也可以先导出 PDF，再把 PDF 文件直接发给朋友
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
