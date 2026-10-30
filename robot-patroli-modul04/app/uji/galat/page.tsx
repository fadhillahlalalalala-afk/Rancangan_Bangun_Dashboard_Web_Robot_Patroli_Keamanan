import { connection } from "next/server";

export default async function HalamanGalat() {
  await connection();
  throw new Error("Koneksi ke sumber data gagal (galat uji)");
}
