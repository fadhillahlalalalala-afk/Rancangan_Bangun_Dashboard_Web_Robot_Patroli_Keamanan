export default function SiteFooter({ namaProduk }: { namaProduk: string }) {
  return (
    <footer className="mt-12 border-t">
      <p className="mx-auto max-w-6xl p-4 text-sm text-gray-600">
        {namaProduk} · Praktikum Pengembangan Aplikasi Web, Universitas Pertamina
      </p>
    </footer>
  );
}
