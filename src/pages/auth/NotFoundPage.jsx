import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-7xl font-bold text-stone-200 mb-4">404</p>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Page not found</h1>
        <p className="text-stone-400 text-sm mb-6">This page doesn't exist or you don't have access to it.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go back</button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
