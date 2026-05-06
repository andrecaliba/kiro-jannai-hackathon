import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number;
  accent?: string;
}

export default function StatCard({
  label,
  value,
  accent = "text-ust-gold",
}: StatCardProps) {
  return (
    <Card className="p-6">
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </Card>
  );
}
