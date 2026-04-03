// API 服务
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 解析岗位JD
export async function analyzeJobDescription(jobDescription: string) {
  const response = await fetch(`${API_BASE_URL}/analyze-job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '解析失败');
  }

  return response.json();
}

// 解析简历PDF
export async function parseResume(file: File) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE_URL}/parse-resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '简历解析失败');
  }

  return response.json();
}

// 匹配度分析
export async function analyzeMatch(resumeAnalysis: any, jobAnalysis: any) {
  const response = await fetch(`${API_BASE_URL}/match-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeAnalysis, jobAnalysis }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '分析失败');
  }

  return response.json();
}

// 保存分析结果（用于分享和短期存储）
export async function saveAnalysis(payload: {
  jobData: any;
  resumeData?: any;
  matchData: any;
  userId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/save-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '保存失败');
  }

  return response.json();
}

// 根据分享ID获取分析结果
export async function getSharedAnalysis(shareId: string) {
  const response = await fetch(`${API_BASE_URL}/analysis/${shareId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '获取分享结果失败');
  }

  return response.json();
}

// 健康检查
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
