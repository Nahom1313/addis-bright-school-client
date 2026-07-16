const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
    <div className="min-w-0">
      <h1 className="page-title truncate">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="flex flex-wrap gap-2 sm:flex-shrink-0">{action}</div>}
  </div>
);
export default PageHeader;
