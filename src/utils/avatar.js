export const toAvatarUrl = (pic) => {
  if (!pic) return null;
  if (pic.startsWith('http')) return pic;
  return `${import.meta.env.VITE_API_URL}/uploads/profiles/${pic}`;
};
