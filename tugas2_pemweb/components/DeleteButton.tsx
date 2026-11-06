"use client";

export function DeleteButton({
  action,
  pesan,
  label = "Hapus",
}: {
  action: () => Promise<void>;
  pesan: string;
  label?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="btn danger sm"
        onClick={(e) => {
          if (!confirm(pesan)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
