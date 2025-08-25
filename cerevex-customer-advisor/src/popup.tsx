import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './styles.css'
import { ANALYSIS_API_URL, THIRD_PARTY_WEB_URL, THIRD_PARTY_API_URL, ENTERPRISE_API_URL } from './config'
// Removed pie chart dependencies for a leaner UI

type CommentInput = { content: string; title?: string }
type ProductInsight = {
  summary: string
  buy_recommendation: string
  confidence: number
  top_positive_examples: string[]
  top_negative_examples: string[]
  label_distribution: Record<string, number>
}

const apiBase = ANALYSIS_API_URL

export default function Popup() {
  const [comments, setComments] = useState<CommentInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProductInsight | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [productId, setProductId] = useState('')
  const [fetchingComments, setFetchingComments] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [supportChecking, setSupportChecking] = useState(false)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [supportMessage, setSupportMessage] = useState<string>('')

  // Get active tab URL
  useEffect(() => {
    try {
      chrome?.tabs?.query({ active: true, currentWindow: true }, tabs => {
        const url = tabs?.[0]?.url || ''
        setCurrentUrl(url)
      })
    } catch (_) {}
  }, [])

  // Extract product id from supported domain
  useEffect(() => {
    if (!THIRD_PARTY_WEB_URL || !currentUrl) return
    if (!currentUrl.startsWith(THIRD_PARTY_WEB_URL)) { setProductId(''); return }
    const rel = currentUrl.substring(THIRD_PARTY_WEB_URL.length)
    const m = rel.match(/\/product\/(\w[\w-]*)/)
    if (m) {
      setProductId(m[1])
    } else {
      setProductId('')
    }
  }, [currentUrl])

  // Check support status when productId changes
  useEffect(() => {
    if (!productId) { setSupported(null); setSupportMessage(''); return }
    if (!ENTERPRISE_API_URL) { setSupported(null); return }
    let cancelled = false
    const run = async () => {
      setSupportChecking(true)
      try {
        const res = await fetch(`${ENTERPRISE_API_URL}/enterprise/public/products/support-status/${productId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        setSupported(!!json.supported)
        setSupportMessage(json.message || '')
      } catch (e:any) {
        if (cancelled) return
        setSupported(null)
        setSupportMessage('Không kiểm tra được trạng thái hỗ trợ')
      } finally {
        if (!cancelled) setSupportChecking(false)
      }
    }
    run()
  return () => { cancelled = true }
  }, [productId])

  const fetchComments = useCallback(async () => {
    if (!productId) return
    if (!THIRD_PARTY_API_URL) { setError('Chưa cấu hình THIRD_PARTY_API_URL'); return }
    setFetchingComments(true)
    setError(null)
    setData(null)
    try {
      const url = `${THIRD_PARTY_API_URL}/products/${productId}/comments`
      console.log('[cerevex] Fetch comments', url)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const arr = Array.isArray(json) ? json : (json.comments || [])
      const norm: CommentInput[] = arr.map((c:any) => ({ content: String(c.content || c.text || '').trim(), title: c.title })).filter(c=>c.content)
      setComments(norm)
      if (!norm.length) setError('Không tìm thấy bình luận')
    } catch (e:any) {
      setError(e.message || 'Lỗi tải bình luận')
    } finally { setFetchingComments(false) }
  }, [productId])

  const canAnalyze = comments.length > 0 && !loading && (supported || supported === null)
  const canFetch = !!productId && !fetchingComments && !loading && (supported || supported === null)

  const requestInsight = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      if (!navigator.onLine) {
        throw new Error('Offline: kiểm tra kết nối mạng')
      }
  const res = await fetch(`${apiBase}/analyze/public-product-insight`, {
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

  const sentimentDistribution = useMemo(() => {
    if (!data) return null
    const dist = data.label_distribution
    let pos=0, neg=0, neu=0
    for (const [k,v] of Object.entries(dist)) {
      const key = k.toLowerCase()
      if (/(pos|good|\+)/.test(key)) pos+=v
      else if (/(neg|bad|-)/.test(key)) neg+=v
      else if (/(neu|neutral)/.test(key)) neu+=v
      else neu+=v
    }
    const total = pos+neg+neu || 1
    return { pos, neg, neu, total, posPct: pos*100/total, neuPct: neu*100/total, negPct: neg*100/total }
  }, [data])

  const recommendationInfo = useMemo(() => {
    if (!data) return null
    const txt = data.buy_recommendation.toLowerCase()
    if (txt.includes('not')) return { tone: 'bad', label: 'KHÔNG NÊN MUA', explain: 'Tỷ lệ phản hồi tiêu cực cao hơn đáng kể.' }
    if (txt.includes('consider alternatives')) return { tone: 'warn', label: 'XEM XÉT LỰA CHỌN KHÁC', explain: 'Cân bằng nghiêng nhẹ về tiêu cực.' }
    if (txt.includes('likely')) return { tone: 'neutral', label: 'KHẢ NĂNG NÊN MUA', explain: 'Chưa vượt trội nhưng tín hiệu không xấu.' }
    if (txt.includes('recommended')) return { tone: 'good', label: 'NÊN MUA', explain: 'Đa số đánh giá tích cực vượt trội.' }
    return { tone: 'neutral', label: data.buy_recommendation.toUpperCase(), explain: '' }
  }, [data])

  const distributionRows = useMemo(() => {
    if (!data) return []
    const total = Object.values(data.label_distribution).reduce((a,b)=>a+b,0) || 1
    return Object.entries(data.label_distribution)
      .map(([k,v]) => ({
        key: k,
        count: v,
        pct: (v*100/total)
      }))
      .sort((a,b)=>b.count-a.count)
  }, [data])

  const toneClass = (tone?: string) => {
    switch (tone) {
      case 'good': return 'bg-green-100 text-green-700 border-green-300'
      case 'bad': return 'bg-red-100 text-red-700 border-red-300'
      case 'warn': return 'bg-amber-100 text-amber-700 border-amber-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const lowData = comments.length > 0 && comments.length < 3
  const lowConfidence = data && data.confidence < 0.18
  const confidenceLabel = useMemo(()=>{
    if (!data) return ''
    if (data.confidence < 0.18) return 'Thấp'
    if (data.confidence < 0.45) return 'TB'
    if (data.confidence < 0.7) return 'Khá'
    return 'Cao'
  }, [data])
  const topPos = (data?.top_positive_examples||[]).slice(0,2)
  const topNeg = (data?.top_negative_examples||[]).slice(0,2)

  return (
    <div className='w-[430px] max-h-[600px] overflow-auto p-4 bg-background text-foreground'>
      <h1 className='text-xl font-semibold mb-1'>Cerevex Advisor</h1>
      <p className='text-xs text-muted-foreground mb-3'>Tự động nhận diện sản phẩm & phân tích cảm xúc bình luận.</p>
      <div className='space-y-3 mb-4'>
        <div className='text-xs break-all border rounded-md p-2 bg-muted/30'>URL: {currentUrl || '—'}</div>
        <div className='flex flex-wrap items-center gap-2 text-[11px]'>
          {!THIRD_PARTY_WEB_URL && <span className='text-red-600'>Chưa cấu hình domain</span>}
          {THIRD_PARTY_WEB_URL && currentUrl && !currentUrl.startsWith(THIRD_PARTY_WEB_URL) && <span className='text-amber-600'>Không phải trang hỗ trợ</span>}
          {currentUrl.startsWith(THIRD_PARTY_WEB_URL || '') && !productId && <span className='text-amber-600'>Không tìm thấy product id</span>}
          {productId && <span className='text-green-600 font-medium'>Product ID: {productId}</span>}
          {productId && supportChecking && <span className='text-slate-500 animate-pulse'>Đang kiểm tra hỗ trợ…</span>}
          {productId && supported === false && <span className='text-red-600 font-medium'>Chưa được hỗ trợ</span>}
        </div>
    <div className='flex gap-2'>
          <button
      disabled={!canFetch || supported === false}
            onClick={fetchComments}
            className='flex-1 inline-flex items-center justify-center rounded-md bg-secondary text-foreground text-sm font-medium h-9 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/70 transition'>
            {fetchingComments ? 'Đang lấy...' : 'Lấy bình luận'}
          </button>
          <button
      disabled={!canAnalyze || supported === false}
            onClick={requestInsight}
            className='flex-1 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition'>
            {loading ? 'Phân tích...' : 'Phân tích'}
          </button>
        </div>
        <div className='text-xs text-muted-foreground flex justify-between'>
          <span>{comments.length} bình luận</span>
          {lowData && !loading && comments.length>0 && <span className='text-amber-600'>Ít dữ liệu</span>}
        </div>
      </div>
      {error && (
        <div className='text-sm text-destructive mb-2'>
          {error}
          {error.includes('Offline') && (
            <div className='mt-1 text-xs text-muted-foreground'>Hãy kết nối lại internet rồi thử lại.</div>
          )}
        </div>
      )}
      {supported === false && (
        <div className='p-3 rounded-lg border bg-card text-sm mb-3'>
          <p className='mb-1 font-medium'>Không khả dụng</p>
          <p className='text-xs text-muted-foreground'>{supportMessage || 'Rất tiếc, người bán này hiện chưa được hỗ trợ tính năng này.'}</p>
        </div>
      )}
      {loading && (
        <div className='space-y-4 animate-pulse'>
          <div className='p-3 rounded-lg border bg-card shadow-sm space-y-3'>
            <div className='h-4 w-28 bg-muted rounded'/>
            <div className='space-y-2'>
              <div className='h-3 w-full bg-muted rounded'/>
              <div className='h-3 w-5/6 bg-muted rounded'/>
              <div className='h-3 w-1/2 bg-muted rounded'/>
            </div>
            <div className='flex justify-between pt-1'>
              <div className='h-5 w-24 bg-muted rounded-full'/>
              <div className='h-10 w-14 bg-muted rounded'/>
            </div>
          </div>
          <div className='p-3 rounded-lg border bg-card shadow-sm'>
            <div className='h-4 w-40 bg-muted rounded mb-3'/>
            <div className='mx-auto h-40 w-40 bg-muted rounded-full'/>
            <div className='mt-4 space-y-2'>
              <div className='h-3 w-full bg-muted rounded'/>
              <div className='h-3 w-11/12 bg-muted rounded'/>
              <div className='h-3 w-10/12 bg-muted rounded'/>
            </div>
          </div>
          <div className='p-3 rounded-lg border bg-card shadow-sm space-y-2'>
            <div className='h-4 w-32 bg-muted rounded'/>
            <div className='space-y-1'>
              <div className='h-3 w-full bg-muted rounded'/>
              <div className='h-3 w-5/6 bg-muted rounded'/>
              <div className='h-3 w-4/6 bg-muted rounded'/>
            </div>
          </div>
          <div className='p-3 rounded-lg border bg-card shadow-sm space-y-2'>
            <div className='h-4 w-36 bg-muted rounded'/>
            <div className='space-y-1'>
              <div className='h-3 w-full bg-muted rounded'/>
              <div className='h-3 w-2/3 bg-muted rounded'/>
              <div className='h-3 w-1/2 bg-muted rounded'/>
            </div>
          </div>
        </div>
      )}
  {data && !loading && supported !== false && (
        <div className='space-y-4'>
          <section className='p-3 rounded-lg border bg-card shadow-sm'>
            <h2 className='font-medium mb-3'>Đánh giá nhanh</h2>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3 flex-wrap'>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${toneClass(recommendationInfo?.tone)}`}>{recommendationInfo?.label}</span>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='uppercase tracking-wide text-muted-foreground'>Độ tin cậy:</span>
                  <div className='h-2 w-28 rounded bg-muted overflow-hidden'>
                    <div className={`h-full transition-all ${lowConfidence? 'bg-amber-500': 'bg-primary'}`} style={{ width: `${Math.min(100, Math.round((data.confidence||0)*100))}%` }} />
                  </div>
                  <span className='text-[11px]'>{confidenceLabel}</span>
                </div>
                <span className='text-xs text-muted-foreground'>({comments.length} đánh giá)</span>
              </div>
              {sentimentDistribution && (
                <div className='space-y-1 text-xs w-full'>
                  <div className='flex justify-between'><span>Phân bố cảm xúc</span><span>{sentimentDistribution.total} tổng</span></div>
                  <div className='h-3 w-full rounded bg-muted overflow-hidden flex'>
                    <div className='bg-green-500/80' style={{width: `${sentimentDistribution.posPct}%`}} />
                    <div className='bg-slate-400/70' style={{width: `${sentimentDistribution.neuPct}%`}} />
                    <div className='bg-red-500/80' style={{width: `${sentimentDistribution.negPct}%`}} />
                  </div>
                  <div className='flex justify-between text-[10px] text-muted-foreground'>
                    <span>Pos {sentimentDistribution.posPct.toFixed(0)}%</span>
                    <span>Neu {sentimentDistribution.neuPct.toFixed(0)}%</span>
                    <span>Neg {sentimentDistribution.negPct.toFixed(0)}%</span>
                  </div>
                </div>
              )}
              {(lowData || lowConfidence) && <div className='text-[11px] text-amber-600'>Dữ liệu ít hoặc phân cực thấp – cân nhắc xem thêm bình luận.</div>}
              {recommendationInfo?.explain && <p className='text-xs text-muted-foreground'>{recommendationInfo.explain}</p>}
            </div>
          </section>
          <section className='p-3 rounded-lg border bg-card shadow-sm'>
            <h3 className='font-medium mb-2'>Ví dụ tiêu biểu</h3>
            <div className='grid grid-cols-2 gap-4 text-xs'>
              <div>
                <p className='font-semibold text-green-600 mb-1'>Tích cực</p>
                <ul className='space-y-1 list-disc list-inside'>
                  {topPos.map((e,i)=>(<li key={i}>{e}</li>))}
                  {topPos.length===0 && <li className='list-none text-muted-foreground'>—</li>}
                </ul>
              </div>
              <div>
                <p className='font-semibold text-red-600 mb-1'>Tiêu cực</p>
                <ul className='space-y-1 list-disc list-inside'>
                  {topNeg.map((e,i)=>(<li key={i}>{e}</li>))}
                  {topNeg.length===0 && <li className='list-none text-muted-foreground'>—</li>}
                </ul>
              </div>
            </div>
            <button onClick={()=>setShowDetails(s=>!s)} className='mt-3 text-[11px] underline text-muted-foreground hover:text-foreground'>
              {showDetails? 'Ẩn chi tiết' : 'Hiện chi tiết phân bố & thêm ví dụ'}
            </button>
            {showDetails && (
              <div className='mt-3 space-y-3'>
                <div>
                  <h4 className='text-xs font-semibold mb-1'>Phân bố nhãn đầy đủ</h4>
                  <table className='w-full text-[11px]'>
                    <thead className='text-muted-foreground'>
                      <tr className='text-left'><th className='py-1 font-medium'>Nhãn</th><th className='py-1 font-medium'>Số</th><th className='py-1 font-medium'>%</th></tr>
                    </thead>
                    <tbody>
                      {distributionRows.map(r => (
                        <tr key={r.key} className='border-t border-border'>
                          <td className='py-1 capitalize'>{r.key}</td>
                          <td className='py-1'>{r.count}</td>
                          <td className='py-1'>{r.pct.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='grid grid-cols-2 gap-4 text-[11px]'>
                  <div>
                    <p className='font-semibold mb-1'>Thêm tích cực</p>
                    <ul className='space-y-1 list-disc list-inside'>
                      {data.top_positive_examples.slice(2).map((e,i)=>(<li key={i}>{e}</li>))}
                      {data.top_positive_examples.slice(2).length===0 && <li className='list-none text-muted-foreground'>—</li>}
                    </ul>
                  </div>
                  <div>
                    <p className='font-semibold mb-1'>Thêm tiêu cực</p>
                    <ul className='space-y-1 list-disc list-inside'>
                      {data.top_negative_examples.slice(2).map((e,i)=>(<li key={i}>{e}</li>))}
                      {data.top_negative_examples.slice(2).length===0 && <li className='list-none text-muted-foreground'>—</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
      <footer className='pt-4 text-center text-[10px] text-muted-foreground'>v0.0.1 • Powered by Cerevex</footer>
    </div>
  )
}
