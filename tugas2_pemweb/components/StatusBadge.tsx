import { LABEL_STATUS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${status}`}>{LABEL_STATUS[status] ?? status}</span>;
}
