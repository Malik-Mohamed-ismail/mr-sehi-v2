import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import i18n from './i18n'

export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) {
    toast.error(i18n.t('common.noData', 'No data to export'))
    return
  }
  
  try {
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Auto-adjust column widths based on the content (basic estimation)
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(item => String(item[key]).length)
      )
      return { wch: Math.min(maxLength + 2, 50) } // cap at 50 wide
    })
    ws['!cols'] = colWidths
    
    // RTL direction tag
    if(!ws['!views']) ws['!views'] = []
    ws['!views'].push({ rightToLeft: true })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات')
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: arSA })
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`)
    toast.success(i18n.t('common.success', 'Exported successfully'))
  } catch (error) {
    toast.error(i18n.t('common.error', 'Export error'))
    console.error('Excel Export Error:', error)
  }
}
