CREATE TABLE IF NOT EXISTS lost_found (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nama_barang text NOT NULL,
  lokasi_ditemukan text NOT NULL,
  deskripsi text NOT NULL,
  foto_url text,
  status text NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'verifikasi', 'returned')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create lost_found items"
  ON lost_found FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read all items"
  ON lost_found FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update lost_found items"
  ON lost_found FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );