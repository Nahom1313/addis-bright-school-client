import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h1>
        <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go back</button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
