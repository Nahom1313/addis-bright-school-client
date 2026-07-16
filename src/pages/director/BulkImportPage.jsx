import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, Download, Users, AlertTriangle } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from 'react-i18next';
import { useSections } from '@/hooks/useSchool';
import { useMutation } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { DIRECTOR_NAV } from './nav';
import clsx from 'clsx';

const TEMPLATE_CSV = `firstName,lastName,email,password,phone,sectionName\nYonas,Alemu,yonas@school.edu,Student1!,,Grade 9 - A\nHiwot,Bekele,hiwot@school.edu,Student1!,,Grade 10 - B`;

const downloadTemplate = () => {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'student_import_template.csv'; a.click();
  URL.revokeObjectURL(url);
};

// FIX: Proper CSV parser that handles quoted fields with commas
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = parseCSVLine(line);
      return headers.reduce((obj, h, i) => {
        obj[h.trim()] = (vals[i] || '').trim();
        return obj;
      }, {});
    });
};

// FIX: Handle quoted fields, escaped quotes, and commas inside fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
};

const BulkImportPage = () => {
  const { t } = useTranslation();
  const { data: sections = [] } = useSections();
  const [rows, setRows] = useState([]);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('idle');
  const fileRef = useRef();

  const sectionMap = sections.reduce((m, s) => {
    const key = `${s.gradeId?.name} - ${s.name}`;
    m[key] = s._id;
    return m;
  }, {});

  const onFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) {
          toast.error('CSV has no data rows. Check the format.');
          return;
        }
        setRows(parsed);
        setPhase('preview');
        setResults([]);
      } catch {
        toast.error('Could not parse CSV. Check the format.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // FIX: Use single bulk API call instead of N sequential HTTP requests
  const importMutation = useMutation({
    mutationFn: async () => {
      const students = rows.map(row => ({
        firstName: row.firstName,
        lastName:  row.lastName,
        email:     row.email,
        password:  row.password || 'Student1!',
        phone:     row.phone || undefined,
        sectionId: sectionMap[row.sectionName] || undefined,
      })).filter(s => s.firstName && s.lastName && s.email);

      const response = await api.post('/users/students/bulk', { students });
      return response.data.data.results;
    },
    onSuccess: (res) => {
      setResults(res);
      setPhase('done');
      const ok  = res.filter(r => r.ok).length;
      const bad = res.filter(r => !r.ok).length;
      if (bad === 0) toast.success(`All ${ok} students imported!`);
      else toast.error(`${ok} imported, ${bad} failed — check errors below.`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Import failed.');
    },
  });

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader
        title={t('users.bulk_import', 'Bulk Import Students')}
        subtitle={t('users.bulk_import_sub', 'Upload a CSV file to create multiple student accounts at once.')}
      />

      {/* Template download */}
      <div className="card mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-stone-800 text-sm">Download template</p>
            <p className="text-xs text-stone-400">CSV format: firstName, lastName, email, password, phone, sectionName</p>
          </div>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Template
        </button>
      </div>

      {/* Upload area */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-stone-200 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="font-medium text-stone-700">Click to upload CSV</p>
          <p className="text-xs text-stone-400 mt-1">Max 200 students per import</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFile} />
        </motion.div>
      )}

      {/* Preview */}
      {phase === 'preview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-700">{rows.length} students to import</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary text-sm"
                onClick={() => { setPhase('idle'); setRows([]); fileRef.current?.click(); }}
              >
                Change file
              </button>
              <button
                className="btn-primary text-sm"
                disabled={importMutation.isPending}
                onClick={() => importMutation.mutate()}
              >
                {importMutation.isPending ? 'Importing…' : `Import ${rows.length} students`}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    {['First name', 'Last name', 'Email', 'Section'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-stone-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/60">
                      <td className="px-4 py-2">{row.firstName}</td>
                      <td className="px-4 py-2">{row.lastName}</td>
                      <td className="px-4 py-2 text-stone-500">{row.email}</td>
                      <td className="px-4 py-2">
                        {row.sectionName
                          ? sectionMap[row.sectionName]
                            ? <span className="badge badge-sky text-[10px]">{row.sectionName}</span>
                            : <span className="badge badge-rose text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Not found</span>
                          : <span className="text-stone-300">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && (
                <p className="text-center text-xs text-stone-400 py-3">…and {rows.length - 20} more rows</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card bg-emerald-50 !border-emerald-100 text-center">
              <p className="text-2xl font-bold text-emerald-700">{results.filter(r => r.ok).length}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Created successfully</p>
            </div>
            <div className="card bg-red-50 !border-red-100 text-center">
              <p className="text-2xl font-bold text-red-600">{results.filter(r => !r.ok).length}</p>
              <p className="text-xs text-red-500 mt-0.5">Failed</p>
            </div>
          </div>

          {results.filter(r => !r.ok).map((r, i) => (
            <div key={i} className="card !border-red-100 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-stone-800">{r.email}</p>
                <p className="text-xs text-red-600">{r.error}</p>
              </div>
            </div>
          ))}

          <button
            className="btn-secondary w-full mt-4"
            onClick={() => { setPhase('idle'); setRows([]); setResults([]); }}
          >
            Import another file
          </button>
        </motion.div>
      )}
    </AppShell>
  );
};

export default BulkImportPage;
