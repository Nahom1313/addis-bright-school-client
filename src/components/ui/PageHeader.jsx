const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8 gap-4">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
export default PageHeader;
