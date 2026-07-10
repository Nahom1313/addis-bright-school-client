import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronRight, BookOpen, Hash } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useGrades, useCreateGrade, useCreateSection } from '@/hooks/useSchool';
import { DIRECTOR_NAV } from './nav';

const SectionChip = ({ section }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-xl border border-stone-100 text-sm">
    <Hash className="w-3 h-3 text-stone-400" />
    <span className="font-medium text-stone-700">{section.name}</span>
    <span className="text-stone-400 text-xs">{section.studentCount ?? 0} students</span>
    {section.room && <span className="text-stone-300 text-xs">· {section.room}</span>}
  </div>
);

const GradeRow = ({ grade, onAddSection }) => {
  const [open, setOpen] = useState(false);
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="border border-stone-100 rounded-2xl overflow-hidden mb-3">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-stone-50 transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-amber-700">{grade.level}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-stone-800">{grade.name}</p>
          <p className="text-xs text-stone-400">{grade.sections?.length ?? 0} section(s)</p>
        </div>
        <Icon className="w-4 h-4 text-stone-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-stone-100 bg-stone-50/50 px-5 py-4"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {(grade.sections || []).map(s => <SectionChip key={s._id} section={s} />)}
              {grade.sections?.length === 0 && <p className="text-sm text-stone-400">No sections yet</p>}
            </div>
            <button className="btn-secondary text-xs flex items-center gap-1" onClick={() => onAddSection(grade)}>
              <Plus className="w-3.5 h-3.5" /> Add section
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GradesPage = () => {
  const { data: grades = [], isLoading } = useGrades();
  const createGrade   = useCreateGrade();
  const createSection = useCreateSection();

  const [gradeModal,   setGradeModal]   = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [targetGrade,  setTargetGrade]  = useState(null);
  const [gf, setGf] = useState({ name: '', level: '' });
  const [sf, setSf] = useState({ name: '', room: '', capacity: 35 });

  const openSectionModal = grade => { setTargetGrade(grade); setSectionModal(true); };

  const submitGrade = e => {
    e.preventDefault();
    createGrade.mutate({ ...gf, level: Number(gf.level) }, { onSuccess: () => { setGradeModal(false); setGf({ name:'', level:'' }); } });
  };

  const submitSection = e => {
    e.preventDefault();
    createSection.mutate({ ...sf, gradeId: targetGrade._id, capacity: Number(sf.capacity) }, {
      onSuccess: () => { setSectionModal(false); setSf({ name:'', room:'', capacity: 35 }); }
    });
  };

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader
        title="Grades & Sections"
        subtitle="Manage the structure of your school"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setGradeModal(true)}>
            <Plus className="w-4 h-4" /> Add grade
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse"/>)}</div>
      ) : grades.length === 0 ? (
        <div className="card"><EmptyState icon={BookOpen} title="No grades yet" body="Start by adding your first grade." action={<button className="btn-primary" onClick={() => setGradeModal(true)}>Add grade</button>} /></div>
      ) : (
        grades.map(g => <GradeRow key={g._id} grade={g} onAddSection={openSectionModal} />)
      )}

      {/* Add Grade Modal */}
      <Modal open={gradeModal} onClose={() => setGradeModal(false)} title="Add Grade" size="sm">
        <form onSubmit={submitGrade} className="space-y-4">
          <div><label className="label">Grade name (e.g. "Grade 9")</label><input className="input" value={gf.name} onChange={e=>setGf(p=>({...p,name:e.target.value}))} required /></div>
          <div><label className="label">Level number (0–12)</label><input className="input" type="number" min="0" max="12" value={gf.level} onChange={e=>setGf(p=>({...p,level:e.target.value}))} required /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={()=>setGradeModal(false)}>Cancel</button>
            <button type="submit"  className="btn-primary  flex-1" disabled={createGrade.isPending}>{createGrade.isPending?'Creating…':'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal open={sectionModal} onClose={() => setSectionModal(false)} title={`Add section to ${targetGrade?.name}`} size="sm">
        <form onSubmit={submitSection} className="space-y-4">
          <div><label className="label">Section name (e.g. "A")</label><input className="input" value={sf.name} onChange={e=>setSf(p=>({...p,name:e.target.value}))} required /></div>
          <div><label className="label">Room (optional)</label><input className="input" value={sf.room} onChange={e=>setSf(p=>({...p,room:e.target.value}))} placeholder="Room 201" /></div>
          <div><label className="label">Capacity</label><input className="input" type="number" min="1" max="100" value={sf.capacity} onChange={e=>setSf(p=>({...p,capacity:e.target.value}))} /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={()=>setSectionModal(false)}>Cancel</button>
            <button type="submit"  className="btn-primary  flex-1" disabled={createSection.isPending}>{createSection.isPending?'Adding…':'Add section'}</button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};

export default GradesPage;
