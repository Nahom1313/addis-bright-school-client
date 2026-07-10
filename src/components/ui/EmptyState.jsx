const EmptyState = ({ icon: Icon, title, body, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-stone-400" />
    </div>
    <p className="font-semibold text-stone-700 font-display text-lg">{title}</p>
    {body && <p className="text-stone-400 text-sm mt-1 max-w-xs">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
export default EmptyState;
