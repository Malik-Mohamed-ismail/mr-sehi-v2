import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, RefreshCw, Wallet, Scale, LineChart, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { DatePicker } from '../../components/ui/DatePicker'
import { staggerContainer, staggerItem } from '../../lib/animations'

const today = new Date().toISOString().split('T')[0]

// Define Account type matching backend flat structure
interface AccountItem {
  code: string
  name_ar: string
  type: string
  balance: string // backend decimals are often strings
}

export default function BalanceSheetPage() {
  const { t } = useTranslation()
  const [date, setDate] = useState(today)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['balance-sheet', date],
    queryFn: async () => {
      const res = await api.get('/reports/balance-sheet', { params: { date } })
      return res.data.data
    },
  })

  const handleExport = () => {
    if (!data) return
    import('xlsx').then(XLSX => {
      const rows: any[] = []
      
      rows.push(['ميزانية عمومية', `كما في تاريخ: ${new Date(date).toLocaleDateString('ar-SA')}`])
      rows.push([])
      
      rows.push(['الأصول'])
      rows.push(['رمز الحساب', 'اسم الحساب', 'الرصيد'])
      data.assets?.forEach((a: any) => rows.push([a.code, a.name_ar, Number(a.balance)]))
      rows.push(['إجمالي الأصول', '', Number(data.total_assets)])
      rows.push([])

      rows.push(['الالتزامات'])
      rows.push(['رمز الحساب', 'اسم الحساب', 'الرصيد'])
      data.liabilities?.forEach((l: any) => rows.push([l.code, l.name_ar, Number(l.balance)]))
      rows.push(['إجمالي الالتزامات', '', Number(data.total_liabilities)])
      rows.push([])

      rows.push(['حقوق الملكية'])
      rows.push(['رمز الحساب', 'اسم الحساب', 'الرصيد'])
      data.equity?.forEach((e: any) => rows.push([e.code, e.name_ar, Number(e.balance)]))
      rows.push(['إجمالي حقوق الملكية', '', Number(data.total_equity)])
      rows.push([])

      rows.push(['إجمالي الالتزامات وحقوق الملكية', '', Number(data.total_liabilities) + Number(data.total_equity)])

      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws['!dir'] = 'rtl'
      
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'الميزانية العمومية')
      XLSX.writeFile(wb, `balance-sheet-${date}.xlsx`)
    })
  }

  const tat = Number(data?.total_assets ?? 0)
  const ttl = Number(data?.total_liabilities ?? 0)
  const tte = Number(data?.total_equity ?? 0)
  const isBalanced = data?.is_balanced ?? false

  const renderAccountRow = (item: AccountItem, index: number) => (
    <div key={item.code} style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '12px 16px', 
      borderTop: index === 0 ? 'none' : '1px dashed var(--border-color)', 
      fontSize: 14 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="number" style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: '40px' }}>{item.code}</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name_ar}</span>
      </div>
      <span className="number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {Number(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
      </span>
    </div>
  )

  return (
    <PageTransition>
      <div style={{ padding: 24, paddingBottom: 64 }}>
        {/* Editorial Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
           <div>
              <h1 className="display-text" style={{ fontSize: 40, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                 <FileText size={40} color="var(--color-primary)" />
                 ميزانية عمومية
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>كما في تاريخ {new Date(date).toLocaleDateString('ar-SA')}</p>
           </div>
           
           <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--glass-bg)', padding: '8px 16px', borderRadius: 2, border: '1px solid var(--border-color)', backdropFilter: 'var(--glass-blur)', position: 'relative', zIndex: 20 }}>
             <div style={{ marginBottom: 0 }}>
               <DatePicker date={date} onChange={setDate} />
             </div>
             
             <button className="btn btn-ghost" style={{ height: 44, width: 44, padding: 0, justifyContent: 'center' }} onClick={() => refetch()} title={t('common.refresh')}>
               <RefreshCw size={16} />
             </button>
             <button className="btn btn-secondary" onClick={handleExport} style={{ gap: 8, height: 44, paddingInline: 16 }} disabled={!data}>
               <Download size={16} /> تصدير Excel
             </button>
           </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
             <div className="skeleton" style={{ height: 140, borderRadius: 2 }} />
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
               {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 2 }} />)}
             </div>
          </div>
        ) : data ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
              
              {/* Assets Card */}
              <motion.div variants={staggerItem} className="card" style={{ 
                position: 'relative', overflow: 'hidden', padding: 24, 
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', 
                borderRadius: 2, borderBottom: '4px solid var(--color-success)',
                boxShadow: 'var(--shadow-glow-success)'
              }}>
                 <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, background: 'var(--color-success)', opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)' }} />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-success)' }}>
                      <Wallet size={20} />
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>إجمالي الأصول</span>
                   </div>
                   <div className="hero-kpi-value" style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-success)' }}>
                      <AnimatedNumber value={tat} suffix=" ر.س" />
                   </div>
                 </div>
              </motion.div>

              {/* Liabilities Card */}
              <motion.div variants={staggerItem} className="card" style={{ 
                position: 'relative', overflow: 'hidden', padding: 24, 
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', 
                borderRadius: 2, borderBottom: '4px solid var(--color-danger)',
                boxShadow: 'var(--shadow-glow-danger)'
              }}>
                 <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, background: 'var(--color-danger)', opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)' }} />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)' }}>
                      <Scale size={20} />
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>إجمالي الالتزامات</span>
                   </div>
                   <div className="hero-kpi-value" style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-danger)' }}>
                      <AnimatedNumber value={ttl} suffix=" ر.س" />
                   </div>
                 </div>
              </motion.div>

              {/* Equity Card */}
              <motion.div variants={staggerItem} className="card" style={{ 
                position: 'relative', overflow: 'hidden', padding: 24, 
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', 
                borderRadius: 2, borderBottom: '4px solid var(--color-info)',
                boxShadow: '0 0 20px rgba(74,144,226,0.15)'
              }}>
                 <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, background: 'var(--color-info)', opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)' }} />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-info)' }}>
                      <LineChart size={20} />
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>إجمالي حقوق الملكية</span>
                   </div>
                   <div className="hero-kpi-value" style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-info)' }}>
                      <AnimatedNumber value={tte} suffix=" ر.س" />
                   </div>
                 </div>
              </motion.div>
            </div>

            {/* Document Board (2-column Layout) */}
            <motion.div variants={staggerItem} className="card" style={{ 
               background: 'var(--bg-surface)', borderRadius: 2, padding: '40px', 
               boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' 
            }}>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: 24, marginBottom: 32 }}>
                 <h2 className="display-text" style={{ fontSize: 28, color: 'var(--text-primary)' }}>تفاصيل الميزانية العمومية</h2>
                 <div style={{ display: 'flex', gap: 12 }}>
                    {isBalanced ? (
                      <span style={{ padding: '6px 16px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 2, fontSize: 14, fontWeight: 700 }}>متوازنة</span>
                    ) : (
                      <span style={{ padding: '6px 16px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 2, fontSize: 14, fontWeight: 700 }}>غير متوازنة</span>
                    )}
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
                 
                 {/* Column 1: Liabilities & Equity */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    {/* Equity Section */}
                    <div>
                       <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-info)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>حقوق الملكية</h3>
                       <div style={{ background: 'var(--bg-surface-2)', borderRadius: 2, padding: '8px 0' }}>
                          {data.equity?.length > 0 
                             ? data.equity.map((item: AccountItem, i: number) => renderAccountRow(item, i))
                             : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>لا يوجد بيانات</div>
                          }
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 8px', marginTop: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>إجمالي حقوق الملكية</span>
                          <span className="number" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                             {tte.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                          </span>
                       </div>
                    </div>

                    {/* Liabilities Section */}
                    <div>
                       <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-danger)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>الالتزامات</h3>
                       <div style={{ background: 'var(--bg-surface-2)', borderRadius: 2, padding: '8px 0' }}>
                          {data.liabilities?.length > 0 
                             ? data.liabilities.map((item: AccountItem, i: number) => renderAccountRow(item, i))
                             : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>لا يوجد بيانات</div>
                          }
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 8px', marginTop: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>إجمالي الالتزامات</span>
                          <span className="number" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                             {ttl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                          </span>
                       </div>
                    </div>

                    {/* Total Liab & Equity */}
                    <div style={{ marginTop: 'auto', background: 'var(--color-primary-light)', borderRadius: 2, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-primary)' }}>
                       <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>إجمالي الالتزامات وحقوق الملكية</span>
                       <span className="number display-text" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>
                          {(ttl + tte).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                       </span>
                    </div>

                 </div>

                 {/* Column 2: Assets */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    {/* Assets Section */}
                    <div>
                       <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-success)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>الأصول</h3>
                       <div style={{ background: 'var(--bg-surface-2)', borderRadius: 2, padding: '8px 0' }}>
                          {data.assets?.length > 0 
                             ? data.assets.map((item: AccountItem, i: number) => renderAccountRow(item, i))
                             : <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>لا يوجد بيانات</div>
                          }
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 8px', marginTop: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>مجموع الأصول المتداولة والثابتة</span>
                          <span className="number" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)' }}>
                             {tat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                          </span>
                       </div>
                    </div>

                    {/* Total Assets */}
                    <div style={{ marginTop: 'auto', background: 'var(--color-success-bg)', borderRadius: 2, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-success)' }}>
                       <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>إجمالي الأصول</span>
                       <span className="number display-text" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)' }}>
                          {tat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                       </span>
                    </div>

                 </div>

               </div>

            </motion.div>

          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderRadius: 2, border: '1px dashed var(--border-color)' }}>
             <Scale size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
             <p>{t('common.noData')}</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
