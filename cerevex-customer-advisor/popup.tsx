import React, { useCallback, useMemo, useState } from 'react'
import './src/styles.css'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

type CommentInput = { content: string; title?: string }
type ProductInsight = {
  summary: string
  buy_recommendation: string
  confidence: number
  top_positive_examples: string[]
  top_negative_examples: string[]
  label_distribution: Record<string, number>
}

const examplePlaceholders = [
  'Sản phẩm dùng rất tốt, pin trâu, sẽ mua lại',
  'Chất lượng ở mức ổn, giao hàng nhanh',
  'Không giống mô tả, màu sắc bị lệch',
  'Đóng gói cẩn thận, hài lòng',
  'Tệ, lỗi sau 2 ngày sử dụng'
]

const apiBase = process.env.ANALYSIS_API_URL || 'http://localhost:8000'

export default function Popup() {
  const [raw, setRaw] = useState('')
  const [comments, setComments] = useState<CommentInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProductInsight | null>(null)

  const parseRaw = useCallback(() => {
    const lines = raw.split(/\n|\r/).map(l => l.trim()).filter(Boolean)
    const parsed = lines.map(l => ({ content: l }))
    setComments(parsed)
  }, [raw])

  const canAnalyze = comments.length > 0 && !loading

  const requestInsight = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`${apiBase}/insights/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: ProductInsight = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const pieData = useMemo(() => {
    if (!data) return null
    const labels = Object.keys(data.label_distribution)
    const values = Object.values(data.label_distribution)
    const palette = labels.map(l => {
      if (/pos|good|\+/i.test(l)) return 'rgba(34,197,94,0.7)'
      if (/neg|bad|-/i.test(l)) return 'rgba(239,68,68,0.7)'
      return 'rgba(148,163,184,0.7)'
    })
    return {
      labels,
      datasets: [
        {
          label: 'Phân bố cảm xúc',
          data: values,
          backgroundColor: palette,
          borderColor: palette.map(c => c.replace('0.7','1')),
          borderWidth: 1
        }
      ]
    }
  }, [data])

  return (
    <div className='w-[420px] max-h-[600px] overflow-auto p-4 bg-background text-foreground'>
      <h1 className='text-xl font-semibold mb-2'>Cerevex Advisor</h1>
      <p className='text-sm text-muted-foreground mb-4'>Dán các bình luận về sản phẩm (mỗi dòng 1 bình luận) để nhận khuyến nghị nên mua hay không.</p>
      <div className='space-y-2 mb-4'>
        <textarea
          className='w-full h-32 text-sm rounded-md border border-border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none'
          placeholder={examplePlaceholders.join('\n')}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onBlur={parseRaw}
        />
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>{comments.length} bình luận</span>
          <button
            onClick={parseRaw}
            className='px-2 py-1 rounded-md border bg-secondary hover:bg-secondary/70 transition'
          >Cập nhật</button>
        </div>
        <button
          disabled={!canAnalyze}
            onClick={requestInsight}
            className='w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition'>
          {loading ? 'Đang phân tích...' : 'Phân tích sản phẩm'}
        </button>
      </div>
      {error && <div className='text-sm text-destructive mb-2'>Lỗi: {error}</div>}
      {data && (
        <div className='space-y-4'>
          <section className='p-3 rounded-lg border bg-card shadow-sm'>
            <h2 className='font-medium mb-1'>Kết luận</h2>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-2'>
                <p className='text-sm leading-snug'>{data.summary}</p>
                <div className='flex items-center gap-2 text-sm'>
                  <span>Đề xuất:</span>
                  <span className={
                    'px-2 py-0.5 rounded-full text-xs font-medium border ' +
                    (data.buy_recommendation === 'buy' ? 'bg-green-100 text-green-700 border-green-300' :
                      data.buy_recommendation === 'hold' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-red-100 text-red-700 border-red-300')
                  }>
                    {data.buy_recommendation.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className='text-center px-3'>
                <div className='text-2xl font-bold'>{(data.confidence * 100).toFixed(0)}%</div>
                <div className='text-[10px] uppercase tracking-wide text-muted-foreground'>Độ tin cậy</div>
              </div>
            </div>
          </section>
          {pieData && (
            <section className='p-3 rounded-lg border bg-card shadow-sm'>
              <h3 className='font-medium mb-2'>Phân bố cảm xúc</h3>
              <div className='h-56'>
                <Pie data={pieData} />
              </div>
              <div className='mt-3'>
                <table className='w-full text-xs'>
                  <thead className='text-muted-foreground'>
                    <tr className='text-left'><th className='py-1 font-medium'>Nhãn</th><th className='py-1 font-medium'>Số</th><th className='py-1 font-medium'>%</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.label_distribution).map(([k,v]) => {
                      const total = Object.values(data.label_distribution).reduce((a,b)=>a+b,0)
                      const pct = total? (v*100/total).toFixed(1):'0'
                      return <tr key={k} className='border-t border-border'>
                        <td className='py-1 capitalize'>{k}</td>
                        <td className='py-1'>{v}</td>
                        <td className='py-1'>{pct}%</td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section className='p-3 rounded-lg border bg-card shadow-sm'>
            <h3 className='font-medium mb-2'>Ví dụ tích cực</h3>
            <ul className='space-y-1 text-sm list-disc list-inside'>
              {data.top_positive_examples.map((e,i)=>(<li key={i}>{e}</li>))}
              {data.top_positive_examples.length === 0 && <li className='list-none text-muted-foreground'>Không có</li>}
            </ul>
          </section>
          <section className='p-3 rounded-lg border bg-card shadow-sm'>
            <h3 className='font-medium mb-2'>Ví dụ tiêu cực</h3>
            <ul className='space-y-1 text-sm list-disc list-inside'>
              {data.top_negative_examples.map((e,i)=>(<li key={i}>{e}</li>))}
              {data.top_negative_examples.length === 0 && <li className='list-none text-muted-foreground'>Không có</li>}
            </ul>
          </section>
        </div>
      )}
      <footer className='pt-4 text-center text-[10px] text-muted-foreground'>v0.0.1 • Powered by Cerevex</footer>
    </div>
  )
}

