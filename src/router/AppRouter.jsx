import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

// Auth
const LoginPage           = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage  = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage     = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const UnauthorizedPage    = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const NotFoundPage        = lazy(() => import('@/pages/auth/NotFoundPage'));
const RegisterPage        = lazy(() => import('@/pages/auth/RegisterPage'));
const LandingPage         = lazy(() => import('@/pages/landing/LandingPage'));

// Shared (accessible by all authenticated roles)
const ChangePasswordPage  = lazy(() => import('@/pages/shared/ChangePasswordPage'));

// Director
const DirectorDashboard   = lazy(() => import('@/pages/director/Dashboard'));
const UsersPage           = lazy(() => import('@/pages/director/UsersPage'));
const GradesPage          = lazy(() => import('@/pages/director/GradesPage'));
const AssignmentsPage     = lazy(() => import('@/pages/director/AssignmentsPage'));
const DirectorEventsPage  = lazy(() => import('@/pages/director/EventsPage'));
const AnalyticsPage       = lazy(() => import('@/pages/director/AnalyticsPage'));
const RegistrarAnalyticsPage = lazy(() => import('@/pages/registrar/AnalyticsPage'));
const SchoolInfoPage      = lazy(() => import('@/pages/director/SchoolInfoPage'));
const BulkImportPage      = lazy(() => import('@/pages/director/BulkImportPage'));
const SettingsPage         = lazy(() => import('@/pages/director/SettingsPage'));



// Meetings (all roles)
const DirectorMeetingsPage = lazy(() => import('@/pages/director/MeetingsPage'));
const TeacherMeetingsPage  = lazy(() => import('@/pages/teacher/MeetingsPage'));
const TeacherMessagesPage  = lazy(() => import('@/pages/teacher/MessagesPage'));
const ParentMeetingsPage   = lazy(() => import('@/pages/parent/MeetingsPage'));
const ParentMessagesPage   = lazy(() => import('@/pages/parent/MessagesPage'));
const StudentMeetingsPage  = lazy(() => import('@/pages/student/MeetingsPage'));

// Registrar
const RegistrarDashboard  = lazy(() => import('@/pages/registrar/Dashboard'));
const RegStudentsPage     = lazy(() => import('@/pages/registrar/StudentsPage'));
const RegTeachersPage     = lazy(() => import('@/pages/registrar/TeachersPage'));
const RegParentsPage      = lazy(() => import('@/pages/registrar/ParentsPage'));
const TimetablePage       = lazy(() => import('@/pages/registrar/TimetablePage'));
const RegPaymentsPage     = lazy(() => import('@/pages/registrar/PaymentsPage'));
const RegCalendarPage     = lazy(() => import('@/pages/registrar/CalendarPage'));
const DirectorCalendarPage = lazy(() => import('@/pages/director/CalendarPage'));
const SectionReportsPage  = lazy(() => import('@/pages/registrar/SectionReportsPage'));

// Teacher
const TeacherDashboard    = lazy(() => import('@/pages/teacher/Dashboard'));
const ProgramPage         = lazy(() => import('@/pages/teacher/ProgramPage'));
const ClassesPage         = lazy(() => import('@/pages/teacher/ClassesPage'));
const GradeEntryPage      = lazy(() => import('@/pages/teacher/GradeEntryPage'));
const TeacherAttendance   = lazy(() => import('@/pages/teacher/AttendancePage'));
const LogsPage            = lazy(() => import('@/pages/teacher/LogsPage'));
const TeacherEventsPage   = lazy(() => import('@/pages/teacher/EventsPage'));
const TeacherHomeworkPage = lazy(() => import('@/pages/teacher/HomeworkPage'));
const TeacherResourcesPage = lazy(() => import('@/pages/teacher/ResourcesPage'));
const TeacherQuizzesPage  = lazy(() => import('@/pages/teacher/QuizzesPage'));
const TeacherCalendarPage = lazy(() => import('@/pages/teacher/CalendarPage'));
const ClassLeaderPage     = lazy(() => import('@/pages/teacher/ClassLeaderPage'));

// Student
const StudentDashboard    = lazy(() => import('@/pages/student/Dashboard'));
const StudentProfile      = lazy(() => import('@/pages/student/ProfilePage'));
const StudentEventsPage   = lazy(() => import('@/pages/student/EventsPage'));
const DeadboardPage       = lazy(() => import('@/pages/student/DeadboardPage'));
const StudentMarksPage    = lazy(() => import('@/pages/student/MarksPage'));
const StudentAttendance   = lazy(() => import('@/pages/student/AttendancePage'));
const LeaderboardPage     = lazy(() => import('@/pages/student/LeaderboardPage'));
const StudentHomeworkPage = lazy(() => import('@/pages/student/HomeworkPage'));
const StudentLibraryPage  = lazy(() => import('@/pages/student/LibraryPage'));
const StudentQuizzesPage  = lazy(() => import('@/pages/student/QuizzesPage'));
const StudentQuizTakePage = lazy(() => import('@/pages/student/QuizTakePage'));
const StudentStudyHelperPage = lazy(() => import('@/pages/student/StudyHelperPage'));
const StudentCalendarPage = lazy(() => import('@/pages/student/CalendarPage'));

// Parent
const ParentDashboard     = lazy(() => import('@/pages/parent/Dashboard'));
const ParentAttendance    = lazy(() => import('@/pages/parent/AttendancePage'));
const ParentEventsPage    = lazy(() => import('@/pages/parent/EventsPage'));
const PaymentPage         = lazy(() => import('@/pages/parent/PaymentPage'));
const ParentReportCard    = lazy(() => import('@/pages/parent/ReportCardPage'));
const ParentProfile       = lazy(() => import('@/pages/parent/ProfilePage'));
const ParentHomeworkPage  = lazy(() => import('@/pages/parent/HomeworkPage'));
const ParentCalendarPage  = lazy(() => import('@/pages/parent/CalendarPage'));


const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      <p className="text-xs text-stone-400 font-medium">Loading…</p>
    </div>
  </div>
);

const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/verify-email"    element={<VerifyEmailPage />} />
      <Route path="/unauthorized"    element={<UnauthorizedPage />} />

      {/* Director */}
      <Route element={<ProtectedRoute allowedRoles={['director']} />}>
        <Route path="/director"             element={<DirectorDashboard />} />
        <Route path="/director/users"       element={<UsersPage />} />
        <Route path="/director/calendar"    element={<DirectorCalendarPage />} />
        <Route path="/director/grades"      element={<GradesPage />} />
        <Route path="/director/assignments" element={<AssignmentsPage />} />
        <Route path="/director/events"      element={<DirectorEventsPage />} />
        <Route path="/director/analytics"   element={<AnalyticsPage />} />
        <Route path="/director/school"      element={<SchoolInfoPage />} />
        <Route path="/director/import"      element={<BulkImportPage />} />
        <Route path="/director/settings"    element={<SettingsPage />} />
        <Route path="/director/meetings"    element={<DirectorMeetingsPage />} />
      </Route>


      {/* Registrar */}
      <Route element={<ProtectedRoute allowedRoles={['registrar']} />}>
        <Route path="/registrar"            element={<RegistrarDashboard />} />
        <Route path="/registrar/students"   element={<RegStudentsPage />} />
        <Route path="/registrar/teachers"   element={<RegTeachersPage />} />
        <Route path="/registrar/parents"    element={<RegParentsPage />} />
        <Route path="/registrar/timetable"  element={<TimetablePage />} />
        <Route path="/registrar/payments"        element={<RegPaymentsPage />} />
        <Route path="/registrar/calendar"        element={<RegCalendarPage />} />
        <Route path="/registrar/section-reports" element={<SectionReportsPage />} />
        <Route path="/registrar/analytics"       element={<RegistrarAnalyticsPage />} />
      </Route>

      {/* Teacher */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher"             element={<TeacherDashboard />} />
        <Route path="/teacher/classes"     element={<ClassesPage />} />
        <Route path="/teacher/program"     element={<ProgramPage />} />
        <Route path="/teacher/meetings"    element={<TeacherMeetingsPage />} />
        <Route path="/teacher/messages"    element={<TeacherMessagesPage />} />
        <Route path="/teacher/grade-entry" element={<GradeEntryPage />} />
        <Route path="/teacher/attendance"  element={<TeacherAttendance />} />
        <Route path="/teacher/logs"        element={<LogsPage />} />
        <Route path="/teacher/homework"      element={<TeacherHomeworkPage />} />
        <Route path="/teacher/resources"     element={<TeacherResourcesPage />} />
        <Route path="/teacher/quizzes"       element={<TeacherQuizzesPage />} />
        <Route path="/teacher/calendar"      element={<TeacherCalendarPage />} />
        <Route path="/teacher/class-leader"  element={<ClassLeaderPage />} />
        <Route path="/teacher/events"      element={<TeacherEventsPage />} />
        <Route path="/teacher/password"    element={<ChangePasswordPage />} />
      </Route>

      {/* Parent */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="/parent"            element={<ParentDashboard />} />
        <Route path="/parent/attendance" element={<ParentAttendance />} />
        <Route path="/parent/homework"   element={<ParentHomeworkPage />} />
        <Route path="/parent/calendar"   element={<ParentCalendarPage />} />
        <Route path="/parent/events"     element={<ParentEventsPage />} />
        <Route path="/parent/payment"    element={<PaymentPage />} />
        <Route path="/parent/report-card" element={<ParentReportCard />} />
        <Route path="/parent/profile"    element={<ParentProfile />} />
        <Route path="/parent/password"   element={<ChangePasswordPage />} />
        <Route path="/parent/meetings"    element={<ParentMeetingsPage />} />
        <Route path="/parent/messages"    element={<ParentMessagesPage />} />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student"            element={<StudentDashboard />} />
        <Route path="/student/marks"      element={<StudentMarksPage />} />
        <Route path="/student/attendance"  element={<StudentAttendance />} />
        <Route path="/student/leaderboard" element={<LeaderboardPage />} />
        <Route path="/student/homework"    element={<StudentHomeworkPage />} />
        <Route path="/student/library"     element={<StudentLibraryPage />} />
        <Route path="/student/quizzes"     element={<StudentQuizzesPage />} />
        <Route path="/student/quizzes/:id" element={<StudentQuizTakePage />} />
        <Route path="/student/study-helper" element={<StudentStudyHelperPage />} />
        <Route path="/student/calendar"    element={<StudentCalendarPage />} />
        <Route path="/student/deadboard"  element={<DeadboardPage />} />
        <Route path="/student/events"     element={<StudentEventsPage />} />
        <Route path="/student/profile"    element={<StudentProfile />} />
        <Route path="/student/password"   element={<ChangePasswordPage />} />
        <Route path="/student/meetings"    element={<StudentMeetingsPage />} />
      </Route>


      <Route path="/"  element={<LandingPage />} />
      <Route path="*"  element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
