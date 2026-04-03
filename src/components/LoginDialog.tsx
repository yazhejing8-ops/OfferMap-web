import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (user: User) => void
}

export default function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [supabaseReady, setSupabaseReady] = useState(!!supabase)

  useEffect(() => {
    setSupabaseReady(!!supabase)
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setMessage('登录服务未配置，请联系管理员')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('注册成功！请查收验证邮件（如未开启验证可直接登录）')
        if (data.user) {
          onLogin(data.user)
          onOpenChange(false)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          onLogin(data.user)
          onOpenChange(false)
        }
      }
    } catch (err: any) {
      setMessage(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = async () => {
    if (!supabase) {
      setMessage('登录服务未配置')
      return
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'wechat',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setMessage('微信登录初始化失败: ' + error.message)
    } else if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? '注册账号' : '登录账号'}</DialogTitle>
          <DialogDescription>
            登录后可保存分析记录，随时查看历史报告
          </DialogDescription>
        </DialogHeader>

        {!supabaseReady && (
          <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg border border-amber-200">
            ⚠️ 登录服务暂未配置。如需启用，请在后台配置 Supabase 并填写环境变量。
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !supabaseReady}>
            {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">或者</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleWechatLogin}
          disabled={!supabaseReady}
        >
          <svg className="w-5 h-5 mr-2 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.87a.968.968 0 0 1 .965.972.968.968 0 0 1-.965.972.968.968 0 0 1-.965-.972c0-.537.432-.972.965-.972zm4.844 0a.968.968 0 0 1 .965.972.968.968 0 0 1-.965.972.968.968 0 0 1-.965-.972c0-.537.432-.972.965-.972z"/>
          </svg>
          微信登录
        </Button>
        <p className="text-xs text-slate-400 text-center">
          微信登录需要在 Supabase 中配置微信开放平台参数
        </p>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
