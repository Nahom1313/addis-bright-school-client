import { forwardRef } from 'react';
import { format } from 'date-fns';

const getGrade = (score, max) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return { letter:'A+', color:'#15803d' };
  if (pct >= 80) return { letter:'A',  color:'#15803d' };
  if (pct >= 70) return { letter:'B',  color:'#1d4ed8' };
  if (pct >= 60) return { letter:'C',  color:'#b45309' };
  if (pct >= 50) return { letter:'D',  color:'#c2410c' };
  return { letter:'F', color:'#b91c1c' };
};

/**
 * ReportCardDocument
 * Printable/PDF-ready report card for one student.
 * Props: student, marks[], schoolInfo, term
 */
const ReportCardDocument = forwardRef(({ student, marks = [], schoolInfo, term = 'All Terms' }, ref) => {
  const avg = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / marks.length)
    : null;
  const overall = avg !== null ? getGrade(avg, 100) : null;
  const printed = format(new Date(), 'MMMM d, yyyy');

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
          <div style={{ fontSize:'18px', fontWeight:800, color:'#1c1917', letterSpacing:'-0.3px' }}>REPORT CARD</div>
          <div style={{ fontSize:'12px', color:'#78716c', marginTop:'2px' }}>Academic Year {new Date().getFullYear()}</div>
          <div style={{ fontSize:'11px', color:'#a8a29e', marginTop:'1px' }}>Term: {term}</div>
        </div>
      </div>

      {/* Student info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px' }}>
        {[
          ['Student Name', `${student?.firstName || ''} ${student?.lastName || ''}`],
          ['Student ID',   student?.studentCode || student?._id?.slice(-6)?.toUpperCase() || '—'],
          ['Section',      student?.sectionId?.name || '—'],
          ['Grade',        student?.gradeId?.name || student?.sectionId?.gradeId?.name || '—'],
          ['Academic Year',`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`],
          ['Printed On',   printed],
        ].map(([label, value]) => (
          <div key={label} style={{ background:'#fafaf9', borderRadius:'10px', padding:'12px 14px', border:'1px solid #f5f5f4' }}>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>{label}</div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#1c1917' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Marks table */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Academic Performance</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#f5f5f4' }}>
              {['Subject','Score','Max','Percentage','Grade','Term'].map(h => (
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e7e5e4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:'20px', textAlign:'center', color:'#a8a29e', fontSize:'13px' }}>No marks recorded</td></tr>
            ) : marks.map((m, i) => {
              const pct = Math.round((m.score / m.maxScore) * 100);
              const g = getGrade(m.score, m.maxScore);
              return (
                <tr key={m._id || i} style={{ borderBottom:'1px solid #f5f5f4', background: i % 2 === 0 ? '#fff' : '#fafaf9' }}>
                  <td style={{ padding:'10px 12px', fontWeight:600, color:'#1c1917' }}>{m.subject}</td>
                  <td style={{ padding:'10px 12px', color:'#44403c' }}>{m.score}</td>
                  <td style={{ padding:'10px 12px', color:'#78716c' }}>{m.maxScore}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'60px', height:'5px', borderRadius:'3px', background:'#f5f5f4', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background: pct>=70?'#22c55e':pct>=50?'#f59e0b':'#ef4444', borderRadius:'3px' }}/>
                      </div>
                      <span style={{ fontSize:'12px', color:'#44403c' }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontWeight:800, fontSize:'13px', color: g.color }}>{g.letter}</span>
                  </td>
                  <td style={{ padding:'10px 12px', color:'#78716c', fontSize:'12px' }}>{m.term || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {overall && (
        <div style={{ display:'flex', gap:'16px', marginBottom:'24px' }}>
          <div style={{ flex:1, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'18px', color:'#fff', flexShrink:0 }}>{avg}%</div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.05em' }}>Overall Average</div>
              <div style={{ fontSize:'22px', fontWeight:800, color:'#78350f', letterSpacing:'-0.5px', lineHeight:1.1 }}>{overall.letter}</div>
            </div>
          </div>
          <div style={{ flex:1, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'16px 20px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#166534', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' }}>Subjects</div>
            <div style={{ fontSize:'22px', fontWeight:800, color:'#14532d' }}>{marks.length}</div>
            <div style={{ fontSize:'11px', color:'#16a34a', marginTop:'2px' }}>subjects recorded</div>
          </div>
          <div style={{ flex:1, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'16px 20px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#1e40af', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' }}>Passed</div>
            <div style={{ fontSize:'22px', fontWeight:800, color:'#1e3a8a' }}>{marks.filter(m => (m.score/m.maxScore)*100 >= 50).length}</div>
            <div style={{ fontSize:'11px', color:'#3b82f6', marginTop:'2px' }}>of {marks.length} subjects</div>
          </div>
        </div>
      )}

      {/* Grading scale */}
      <div style={{ background:'#fafaf9', borderRadius:'10px', padding:'14px 18px', marginBottom:'24px', border:'1px solid #f5f5f4' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Grading Scale</div>
        <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
          {[['A+','90–100'],['A','80–89'],['B','70–79'],['C','60–69'],['D','50–59'],['F','Below 50']].map(([g,r]) => (
            <div key={g} style={{ fontSize:'12px', color:'#57534e' }}><strong style={{ color:'#1c1917' }}>{g}</strong> = {r}</div>
          ))}
        </div>
      </div>

      {/* Signature line */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid #f5f5f4' }}>
        {["Class Teacher's Signature", "Director's Signature", "Parent's Signature"].map(label => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ height:'40px', borderBottom:'1px solid #d6d3d1', marginBottom:'6px' }}/>
            <div style={{ fontSize:'11px', color:'#78716c' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop:'20px', textAlign:'center', fontSize:'11px', color:'#a8a29e', borderTop:'1px solid #f5f5f4', paddingTop:'12px' }}>
        {schoolInfo?.name || 'Addis Bright Academy'} · {schoolInfo?.phone || ''} · {schoolInfo?.email || ''} · Printed on {printed}
      </div>
    </div>
  );
});

ReportCardDocument.displayName = 'ReportCardDocument';
export default ReportCardDocument;
