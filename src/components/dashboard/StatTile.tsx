export default function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "bad";
}) {
  const valueColor =
    tone === "good"
      ? "text-brand-700 dark:text-brand-300"
      : tone === "bad"
        ? "text-red-700 dark:text-red-400"
        : "text-foreground";

  return (
    <div className="rounded-xl border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
