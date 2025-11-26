CREATE TABLE IF NOT EXISTS keluhan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  judul text NOT NULL,
  kategori text NOT NULL,
  lokasi text NOT NULL,
  deskripsi text NOT NULL,
  foto_url text,
  status text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'selesai')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keluhan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own keluhan"
  ON keluhan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own keluhan"
  ON keluhan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all keluhan"
  ON keluhan FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update keluhan status"
  ON keluhan FOR UPDATE
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