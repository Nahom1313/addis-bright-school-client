import { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';

/**
 * PrintExportButton
 * - Print: opens a new window and triggers print dialog (desktop only — hidden on mobile/WebView)
 * - Download PDF: uses html2canvas + jsPDF, works on all platforms including Capacitor Android
 */
export default function PrintExportButton({ printRef, filename = 'document' }) {
  const [exporting, setExporting] = useState(false);

  const handlePrint = () => {
    const content = printRef?.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return; // blocked in WebView — silently skip
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <title>${filename}</title>
      <style>* { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Segoe UI',sans-serif; color:#1c1917; background:white; }
      @media print { @page { size:A4; margin:18mm 16mm; }
      body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const handlePDF = async () => {
    const content = printRef?.current;
    if (!content) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(content, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW  = pdf.internal.pageSize.getWidth();
      const pageH  = pdf.internal.pageSize.getHeight();
      const imgH   = (canvas.height * pageW) / canvas.width;
      let posY = 0;
      pdf.addImage(imgData, 'PNG', 0, posY, pageW, imgH);
      while (posY + imgH > pageH) {
        posY -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, posY, pageW, imgH);
      }
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden on mobile — window.open is blocked in Capacitor WebView */}
      <button onClick={handlePrint}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-800 transition-colors">
        <Printer className="w-3.5 h-3.5" /> Print
      </button>

      {/* Works on all platforms including Capacitor Android */}
      <button onClick={handlePDF} disabled={exporting}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 transition-colors">
        {exporting
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting…</>
          : <><Download className="w-3.5 h-3.5" /> Download PDF</>
        }
      </button>
    </div>
  );
}
