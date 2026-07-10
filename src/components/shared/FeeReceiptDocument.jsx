import { forwardRef } from 'react';
import { format } from 'date-fns';

/**
 * FeeReceiptDocument
 * Printable fee/payment receipt.
 * Props: student, schoolInfo, receiptNumber (optional)
 */
const FeeReceiptDocument = forwardRef(({ student, schoolInfo }, ref) => {
  const printed  = format(new Date(), 'MMMM d, yyyy');
  const receiptNo = `RCP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const amount   = schoolInfo?.tuitionAmount;
  const currency = schoolInfo?.currency || 'ETB';
  const accounts = schoolInfo?.bankAccounts || [];

  return (
    <div ref={ref} style={{
      background:'#fff', color:'#1c1917',
      fontFamily:"'Segoe UI', sans-serif",
      padding:'32px 40px', maxWidth:'680px', margin:'0 auto',
    }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', paddingBottom:'20px', borderBottom:'2px solid #f59e0b' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'12px', background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:800, color:'#fff', flexShrink:0 }}>AB</div>
          <div>
            <div style={{ fontSize:'18px', fontWeight:800, color:'#1c1917' }}>{schoolInfo?.name || 'Addis Bright Academy'}</div>
            <div style={{ fontSize:'12px', color:'#78716c', marginTop:'2px' }}>{schoolInfo?.address || 'Addis Ababa, Ethiopia'}</div>
            {schoolInfo?.phone && <div style={{ fontSize:'12px', color:'#78716c' }}>{schoolInfo.phone}</div>}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'18px', fontWeight:800, color:'#1c1917' }}>FEE RECEIPT</div>
          <div style={{ fontSize:'12px', color:'#78716c', marginTop:'2px' }}>Receipt No: <strong>{receiptNo}</strong></div>
          <div style={{ fontSize:'12px', color:'#78716c' }}>Date: {printed}</div>
          <div style={{ display:'inline-block', marginTop:'6px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', padding:'3px 10px', fontSize:'11px', fontWeight:700, color:'#15803d' }}>OFFICIAL</div>
        </div>
      </div>

      {/* Student info */}
      <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'16px 20px', marginBottom:'24px' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Student Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            ['Full Name',   `${student?.firstName || ''} ${student?.lastName || ''}`],
            ['Student ID',  student?.studentCode || student?._id?.slice(-6)?.toUpperCase() || '—'],
            ['Section',     student?.sectionId?.name || '—'],
            ['Grade',       student?.gradeId?.name || student?.sectionId?.gradeId?.name || '—'],
            ['Academic Year', `${new Date().getFullYear()}/${new Date().getFullYear()+1}`],
            ['Email',       student?.email || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'2px' }}>{label}</div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#78350f' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee table */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Fee Details</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'#f5f5f4' }}>
              {['Description','Period','Amount'].map(h => (
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e7e5e4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom:'1px solid #f5f5f4' }}>
              <td style={{ padding:'12px', fontWeight:600, color:'#1c1917' }}>Annual Tuition Fee</td>
              <td style={{ padding:'12px', color:'#78716c' }}>Academic Year {new Date().getFullYear()}/{new Date().getFullYear()+1}</td>
              <td style={{ padding:'12px', fontWeight:700, color:'#1c1917', fontSize:'15px' }}>
                {amount ? `${amount.toLocaleString()} ${currency}` : 'Contact school office'}
              </td>
            </tr>
          </tbody>
          {amount && (
            <tfoot>
              <tr style={{ background:'#fafaf9' }}>
                <td colSpan={2} style={{ padding:'12px', fontWeight:700, color:'#1c1917', textAlign:'right' }}>Total Due:</td>
                <td style={{ padding:'12px', fontWeight:800, color:'#d97706', fontSize:'16px' }}>{amount.toLocaleString()} {currency}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Bank accounts */}
      {accounts.length > 0 && (
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#1c1917', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Payment Instructions</div>
          <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'14px 16px', marginBottom:'12px' }}>
            <p style={{ fontSize:'13px', color:'#1e40af', lineHeight:1.65 }}>
              Please transfer the tuition fee to one of the accounts below and notify the school office with your child's full name and student ID as the payment reference.
            </p>
          </div>
          {accounts.map((acc, i) => (
            <div key={i} style={{ background:'#fafaf9', border:'1px solid #e7e5e4', borderRadius:'10px', padding:'14px 16px', marginBottom:'8px' }}>
              <div style={{ fontWeight:700, fontSize:'14px', color:'#1c1917', marginBottom:'6px' }}>{acc.bankName}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'13px' }}>
                <div><span style={{ color:'#78716c' }}>Account Name: </span><strong>{acc.accountName}</strong></div>
                <div><span style={{ color:'#78716c' }}>Account No: </span><strong style={{ fontFamily:'monospace', letterSpacing:'1px' }}>{acc.accountNumber}</strong></div>
                {acc.branch && <div><span style={{ color:'#78716c' }}>Branch: </span>{acc.branch}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signature */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid #f5f5f4' }}>
        {["Finance Officer's Signature", "Director's Signature"].map(label => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ height:'40px', borderBottom:'1px solid #d6d3d1', marginBottom:'6px' }}/>
            <div style={{ fontSize:'11px', color:'#78716c' }}>{label}</div>
            <div style={{ height:'28px', width:'80px', border:'1px solid #d6d3d1', borderRadius:'4px', margin:'8px auto 0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'9px', color:'#a8a29e' }}>OFFICIAL STAMP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop:'20px', textAlign:'center', fontSize:'11px', color:'#a8a29e', borderTop:'1px solid #f5f5f4', paddingTop:'12px' }}>
        {schoolInfo?.name || 'Addis Bright Academy'} · This is a computer-generated document · {printed}
      </div>
    </div>
  );
});

FeeReceiptDocument.displayName = 'FeeReceiptDocument';
export default FeeReceiptDocument;
