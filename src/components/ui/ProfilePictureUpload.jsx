import { useRef, useState } from 'react';
import { Camera, User, X } from 'lucide-react';
import clsx from 'clsx';

// profilePicture is now always a full Cloudinary URL or null
const toDisplayUrl = (value) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  // Legacy local path fallback
  return `/uploads/profiles/${value}`;
};

export default function ProfilePictureUpload({ current, onChange, size = 'lg' }) {
  const fileRef  = useRef();
  const [preview, setPreview] = useState(null);

  const displayed = preview || toDisplayUrl(current);
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
    e.target.value = '';
  };

  const clear = () => { setPreview(null); onChange(null); };

  return (
    <div className="flex items-center gap-4">
      <div className={clsx('relative rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center', dim)}>
        {displayed
          ? <img src={displayed} alt="Profile" className="w-full h-full object-cover" />
          : <User className={clsx('text-stone-300', size === 'lg' ? 'w-10 h-10' : 'w-7 h-7')} />
        }
        <button type="button" onClick={() => fileRef.current?.click()}
          className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </button>
      </div>
      <div>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> {displayed ? 'Change photo' : 'Upload photo'}
        </button>
        {preview && (
          <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-red-400 mt-1.5 hover:text-red-600">
            <X className="w-3 h-3" /> Remove
          </button>
        )}
        <p className="text-[10px] text-stone-400 mt-1">JPEG, PNG or WebP · max 5 MB</p>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}
