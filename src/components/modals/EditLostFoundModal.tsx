"use client";
import { LostFound } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import LostFoundForm from "@/components/forms/LostFoundForm";

interface EditLostFoundModalProps {
  item: LostFound | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditLostFoundModal({
  item,
  isOpen,
  onClose,
}: EditLostFoundModalProps) {
  if (!isOpen || !item) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Edit Barang Ditemukan
      </h2>
      <LostFoundForm item={item} onClose={onClose} />
    </Modal>
  );
}
