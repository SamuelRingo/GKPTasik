-- Menambahkan kolom email ke tabel profiles
ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- (Opsional) Jika ingin mengisi kolom email dari auth.users
UPDATE public.profiles
SET email = (
  SELECT auth.users.email 
  FROM auth.users 
  WHERE auth.users.id = public.profiles.id
)
WHERE email IS NULL;
