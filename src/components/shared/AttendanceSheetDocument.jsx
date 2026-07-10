import { forwardRef } from 'react';
import { format, parseISO } from 'date-fns';

const STATUS_LABEL = { present:'P', absent:'A', late:'L', excused:'E' };
const STATUS_COLOR = {
  present:'#15803d', absent:'#b91c1c', late:'#b45309', excused:'#1d4ed8',
};

/**
 * AttendanceSheetDocument
 * Printable attendance sheet.
 * Props: student, records[], stats{}, schoolInfo
 */
const AttendanceSheetDocument = forwardRef(({ student, records = [], stats = {}, schoolInfo }, ref) => {
  const printed = format(new Date(), 'MMMM d, yyyy');
  const attendanceRate = stats.total
    ? Math.round(((stats.present + (stats.late || 0)) / stats.total) * 100)
    : null;

  return (
    <div ref={ref} style={{
      background:'#fff', color:'#1c1917',
      fontFamily:"'Segoe UI', sans-serif",
      padding:'32px 40px', maxWidth:'760px', margin:'0 auto',
    }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', paddingBottom:'20px', borderBottom:'2px solid #f59e0b' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'12px', background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:800, color:'#fff', flexShrink:0 }}>AB</div>
          <div>
            <div style={{ fontSize:'18px', fontWeight:800, color:'#1c1917', letterSpacing:'-0.3px' }}>{schoolInfo?.name || 'Addis Bright Academy'}</div>
            <div style={{ fontSize:'12px', color:'#78716c', marginTop:'2px' }}>{schoolInfo?.address || 'Addis Ababa, Ethiopia'}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'18px', fontWeight:800, color:'#1c1917', letterSpacing:'-0.3px' }}>ATTENDANCE SHEET</div>
          <div style={{ fontSize:'12px', color:'#78716c', marginTop:'2px' }}>Last 90 Days</div>
          <div style={{ fontSize:'11px', color:'#a8a29e', marginTop:'1px' }}>Printed: {printed}</div>
        </div>
      </div>

      {/* Student info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px' }}>
        {[
          ['Student Name', `${student?.firstName || ''} ${student?.lastName || ''}`],
          ['Student ID',   student?.studentCode || student?._id?.slice(-6)?.toUpperCase() || '—'],
          ['Section',      student?.sectionId?.name || '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ background:'#fafaf9', borderRadius:'10px', padding:'12px 14px', border:'1px solid #f5f5f4' }}>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>{label}</div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#1c1917' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      {stats.total > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total Days', value:stats.total,   bg:'#fafaf9', border:'#e7e5e4',  color:'#1c1917' },
            { label:'Present',    value:stats.present||0, bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d' },
            { label:'Absent',     value:stats.absent||0,  bg:'#fef2f2', border:'#fecaca', color:'#b91c1c' },
            { label:'Late',       value:stats.late||0,    bg:'#fffbeb', border:'#fde68a', color:'#b45309' },
            { label:'Rate',       value:`${attendanceRate}%`, bg:'#eff6ff', border:'#bfdbfe', color:'#1d4ed8' },
          ].map(({ label, value, bg, border, color }) => (
            <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:'10px', padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:800, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:'10px', fontWeight:600, color:'#78716c', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Records table */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Attendance Records</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#f5f5f4' }}>
              {['#','Date','Day','Status','Note'].map(h => (
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e7e5e4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:'20px', textAlign:'center', color:'#a8a29e' }}>No records found</td></tr>
            ) : records.map((rec, i) => {
              const d = parseISO(rec.date);
              const color = STATUS_COLOR[rec.status] || '#1c1917';
              return (
                <tr key={rec._id || i} style={{ borderBottom:'1px solid #f5f5f4', background: i%2===0 ? '#fff' : '#fafaf9' }}>
                  <td style={{ padding:'9px 12px', color:'#a8a29e', fontSize:'12px' }}>{i+1}</td>
                  <td style={{ padding:'9px 12px', color:'#44403c', fontWeight:500 }}>{format(d,'MMM d, yyyy')}</td>
                  <td style={{ padding:'9px 12px', color:'#78716c', fontSize:'12px' }}>{format(d,'EEEE')}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:700, color, background:color+'15', padding:'3px 9px', borderRadius:'6px' }}>
                      {STATUS_LABEL[rec.status] || '?'} · {rec.status?.charAt(0).toUpperCase() + rec.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding:'9px 12px', color:'#78716c', fontSize:'12px', fontStyle: rec.note ? 'normal':'italic' }}>{rec.note || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:'20px', marginBottom:'24px', background:'#fafaf9', padding:'12px 16px', borderRadius:'10px', border:'1px solid #f5f5f4' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.05em', marginRight:'4px' }}>Legend:</span>
        {[['P','Present','#15803d'],['A','Absent','#b91c1c'],['L','Late','#b45309'],['E','Excused','#1d4ed8']].map(([code,label,color]) => (
          <span key={code} style={{ fontSize:'12px', color:'#57534e' }}>
            <strong style={{ color }}>{code}</strong> = {label}
          </span>
        ))}
      </div>

      {/* Signature */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid #f5f5f4' }}>
        {["Class Teacher's Signature", "Director's Signature"].map(label => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ height:'40px', borderBottom:'1px solid #d6d3d1', marginBottom:'6px' }}/>
            <div style={{ fontSize:'11px', color:'#78716c' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop:'20px', textAlign:'center', fontSize:'11px', color:'#a8a29e', borderTop:'1px solid #f5f5f4', paddingTop:'12px' }}>
        {schoolInfo?.name || 'Addis Bright Academy'} · {schoolInfo?.phone || ''} · Printed on {printed}
      </div>
    </div>
  );
});

AttendanceSheetDocument.displayName = 'AttendanceSheetDocument';
export default AttendanceSheetDocument;
