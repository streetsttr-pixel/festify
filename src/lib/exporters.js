// ────────────────────────────────────────────────────────────
// Exportação da lista de presença (WhatsApp texto + PDF)
// ────────────────────────────────────────────────────────────
import { isNative, shareFile } from './native'
import { formatDateLong, formatTime, formatDateTime, sumRsvps, slugify } from './utils'

// Fontes padrão do PDF usam WinAnsi: remove emojis e símbolos fora do Latin-1
const pdfSafe = (str = '') =>
  String(str)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

export function buildWhatsAppText(party, rsvps) {
  const t = sumRsvps(rsvps)
  const sorted = [...rsvps].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  const lines = [
    `🎉 *LISTA DE CONVIDADOS*`,
    `*${party.title}*`,
    `📅 ${formatDateLong(party)} às ${formatTime(party)}`,
    party.venueName ? `📍 ${party.venueName}` : null,
    '',
    `👥 *Total: ${t.total} pessoas* (${t.adults} adultos · ${t.children} crianças)`,
    '',
    ...sorted.map((r, i) => {
      const parts = []
      if (r.adults) parts.push(`${r.adults} ad.`)
      if (r.children) parts.push(`${r.children} cri.`)
      return `${String(i + 1).padStart(2, '0')}. ${r.name} — ${parts.join(' + ') || '0'}`
    }),
    '',
    `_Gerado por Festify em ${new Date().toLocaleString('pt-BR')}_`,
  ]
  return lines.filter((l) => l !== null).join('\n')
}

export async function downloadGuestPdf(party, rsvps) {
  // Import dinâmico: jsPDF só é baixado quando o anfitrião exporta
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const t = sumRsvps(rsvps)
  const sorted = [...rsvps].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  const W = doc.internal.pageSize.getWidth()

  // Cabeçalho
  doc.setFillColor(168, 21, 214)
  doc.rect(0, 0, W, 86, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Lista de Convidados - Portaria', 40, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(pdfSafe(party.title), 40, 58)
  doc.text(
    pdfSafe(`${formatDateLong(party)} às ${formatTime(party)}${party.venueName ? ' · ' + party.venueName : ''}`),
    40,
    74
  )

  // Resumo
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(
    `Total: ${t.total} pessoas   |   Adultos: ${t.adults}   |   Crianças: ${t.children}   |   Confirmações: ${t.responses}`,
    40,
    112
  )

  autoTable(doc, {
    startY: 126,
    head: [['#', 'Convidado', 'Adultos', 'Crianças', 'Total', 'Confirmado em', 'Check-in']],
    body: sorted.map((r, i) => [
      i + 1,
      pdfSafe(r.name),
      r.adults,
      r.children,
      r.adults + r.children,
      formatDateTime(r.createdAt),
      '',
    ]),
    foot: [['', 'TOTAL', t.adults, t.children, t.total, '', '']],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [40, 20, 60] },
    footStyles: { fillColor: [243, 232, 255], textColor: [40, 20, 60], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 252] },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      6: { cellWidth: 60 },
    },
    didDrawCell: (data) => {
      // Caixinha de check-in para a portaria
      if (data.section === 'body' && data.column.index === 6) {
        const s = 11
        doc.setDrawColor(150)
        doc.rect(data.cell.x + data.cell.width / 2 - s / 2, data.cell.y + data.cell.height / 2 - s / 2, s, s)
      }
    },
  })

  // Recados
  const withMsg = sorted.filter((r) => r.message)
  if (withMsg.length) {
    let y = doc.lastAutoTable.finalY + 30
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Recados dos convidados', 40, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 16
    for (const r of withMsg) {
      const lines = doc.splitTextToSize(`${pdfSafe(r.name)}: "${pdfSafe(r.message)}"`, W - 80)
      if (y + lines.length * 13 > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        y = 50
      }
      doc.text(lines, 40, y)
      y += lines.length * 13 + 6
    }
  }

  // Rodapé com paginação
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(140)
    doc.text(
      `Festify · gerado em ${new Date().toLocaleString('pt-BR')} · página ${i}/${pages}`,
      40,
      doc.internal.pageSize.getHeight() - 20
    )
  }

  const filename = `lista-convidados-${slugify(party.title) || 'festa'}.pdf`
  if (isNative()) {
    // WebView do Android não baixa blobs: salva no app e abre o compartilhamento
    const base64 = doc.output('datauristring').split(',')[1]
    await shareFile(filename, base64, 'Lista de convidados')
  } else {
    doc.save(filename)
  }
}
