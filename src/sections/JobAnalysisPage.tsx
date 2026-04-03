import { ArrowLeft, ArrowRight, Building2, MapPin, Wallet, Wrench, Monitor, Target, AlertCircle, Sparkles, Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { JobRequirement } from '../App'

interface JobAnalysisPageProps {
  job: JobRequirement
  hasResume: boolean
  onViewResult: () => void
  onBack: () => void
  onNewAnalysis: () => void
}

export default function JobAnalysisPage({ job, hasResume, onViewResult, onBack, onNewAnalysis }: JobAnalysisPageProps) {
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
            <span className="text-lg font-semibold text-slate-900">岗位解析</span>
          </div>
          <Button variant="outline" size="sm" onClick={onNewAnalysis} className="text-slate-600">
            <Plus className="w-4 h-4 mr-2" />
            新分析
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 岗位基本信息 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
              已解析
            </Badge>
            <span className="text-sm text-slate-500">基于你提供的岗位JD</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {job.company}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {job.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-green-600">{job.salary}</span>
            </div>
          </div>
        </div>

        {/* 一句话总结 */}
        <Card className="mb-8 border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50/50 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">这个岗位到底要什么？</h3>
                <p className="text-slate-700 leading-relaxed">{job.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 行业黑话解读 */}
        {job.jargon && job.jargon.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/30 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-3">这些术语是什么意思？</h3>
                  <ul className="space-y-3">
                    {job.jargon.map((item, index) => (
                      <li key={index} className="text-slate-700 text-sm leading-relaxed">
                        <span className="font-semibold text-amber-700">{index + 1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 核心内容网格 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 核心技能 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <Target className="w-5 h-5 text-blue-600" />
                核心技能要求
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.coreSkills.map((skill, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-slate-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 软件工具 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <Monitor className="w-5 h-5 text-purple-600" />
                需要掌握的软件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.software.map((sw, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                  >
                    {sw}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                不需要全会，但至少要有2-3个是精通的
              </p>
            </CardContent>
          </Card>

          {/* 主要工作内容 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <Wrench className="w-5 h-5 text-green-600" />
                主要工作内容
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.keyResponsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-slate-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 岗位难点 */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-amber-50/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                <AlertCircle className="w-5 h-5" />
                这个岗位的难点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <span className="text-slate-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          {hasResume ? (
            <>
              <p className="text-slate-500 mb-4">
                了解完岗位要求，来看看你的匹配度如何
              </p>
              <Button
                onClick={onViewResult}
                className="px-10 py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
              >
                查看我的匹配度
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-slate-500 mb-4">
                你还没有上传简历，无法查看匹配度
              </p>
              <div className="inline-flex items-center gap-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-700 text-sm">
                  返回上一页上传简历，即可查看完整匹配度分析
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
