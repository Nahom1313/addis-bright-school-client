import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useMe } from '@/hooks/useAuth';
import api from '@/api/client';
import { STUDENT_NAV } from './nav';
import clsx from 'clsx';

const RANK_STYLE = {
  1: { bg: 'bg-amber-400',   text: 'text-white', icon: Trophy,  size: 'text-2xl', ring: 'ring-amber-300' },
  2: { bg: 'bg-stone-300',   text: 'text-white', icon: Medal,   size: 'text-xl',  ring: 'ring-stone-200' },
  3: { bg: 'bg-amber-600',   text: 'text-white', icon: Award,   size: 'text-xl',  ring: 'ring-amber-500' },
};

const RankBadge = ({ rank }) => {
  const style = RANK_STYLE[rank];
  if (!style) return (
    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-stone-400">{rank}</span>
    </div>
  );
  const Icon = style.icon;
  return (
    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-2', style.bg, style.ring)}>
      <Icon className={clsx('w-4 h-4', style.text)} />
    </div>
  );
};

export default function LeaderboardPage() {
  const { user }   = useAuth();
  const { data: me } = useMe();
  const sectionId  = me?.sectionId?._id || me?.sectionId;

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', sectionId],
    queryFn: () => api.get(`/marks/leaderboard${sectionId ? `?sectionId=${sectionId}` : ''}`).then(r => r.data.data),
    enabled: !!sectionId,
  });

  const entries  = data?.leaderboard || [];
  const myRank   = entries.findIndex(e => String(e.studentId) === String(user?._id)) + 1;
  const myEntry  = entries.find(e => String(e.studentId) === String(user?._id));

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title="Leaderboard" subtitle="Top students in your section by average marks" />

      {/* My rank card */}
      {myEntry && (
        <motion.div className="card mb-6 bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100 flex items-center gap-4"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <RankBadge rank={myRank} />
          <div>
            <p className="font-bold text-stone-900">Your rank: #{myRank}</p>
            <p className="text-sm text-stone-500">Average: {myEntry.avg}% across {myEntry.subjectCount} subject{myEntry.subjectCount !== 1 ? 's' : ''}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-500 ml-auto" />
        </motion.div>
      )}

      {!sectionId ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-stone-400">You are not enrolled in a section yet.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-stone-400">No marks recorded yet. Be the first!</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="bg-gradient-to-b from-amber-50 to-white px-6 pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-end justify-center gap-3">
                {/* 2nd */}
                {entries[1] && (
                  <motion.div className="text-center flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600 mx-auto mb-2 ring-2 ring-stone-300">
                      {entries[1].firstName?.[0]}{entries[1].lastName?.[0]}
                    </div>
                    <p className="text-xs font-semibold text-stone-700 truncate">{entries[1].firstName}</p>
                    <p className="text-sm font-bold text-stone-500">{entries[1].avg}%</p>
                    <div className="h-12 bg-stone-200 rounded-t-lg mt-2 flex items-center justify-center">
                      <Medal className="w-5 h-5 text-stone-400" />
                    </div>
                  </motion.div>
                )}
                {/* 1st */}
                {entries[0] && (
                  <motion.div className="text-center flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white mx-auto mb-2 ring-4 ring-amber-300">
                      {entries[0].firstName?.[0]}{entries[0].lastName?.[0]}
                    </div>
                    <p className="text-xs font-semibold text-stone-800 truncate">{entries[0].firstName}</p>
                    <p className="text-sm font-bold text-amber-600">{entries[0].avg}%</p>
                    <div className="h-20 bg-amber-400 rounded-t-lg mt-2 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                )}
                {/* 3rd */}
                {entries[2] && (
                  <motion.div className="text-center flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center text-sm font-bold text-white mx-auto mb-2 ring-2 ring-amber-600">
                      {entries[2].firstName?.[0]}{entries[2].lastName?.[0]}
                    </div>
                    <p className="text-xs font-semibold text-stone-700 truncate">{entries[2].firstName}</p>
                    <p className="text-sm font-bold text-amber-700">{entries[2].avg}%</p>
                    <div className="h-8 bg-amber-700 rounded-t-lg mt-2 flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="divide-y divide-stone-50">
            {entries.map((entry, i) => {
              const isMe = String(entry.studentId) === String(user?._id);
              return (
                <motion.div key={entry.studentId}
                  className={clsx('flex items-center gap-4 px-5 py-3 transition-colors', isMe && 'bg-amber-50/60')}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className={clsx('font-medium text-sm', isMe ? 'text-amber-800' : 'text-stone-800')}>
                      {entry.firstName} {entry.lastName} {isMe && <span className="text-[10px] text-amber-600 font-semibold ml-1">You</span>}
                    </p>
                    <p className="text-xs text-stone-400">{entry.subjectCount} subject{entry.subjectCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={clsx('font-bold text-sm', i === 0 ? 'text-amber-600' : i === 1 ? 'text-stone-500' : i === 2 ? 'text-amber-700' : 'text-stone-600')}>
                      {entry.avg}%
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
