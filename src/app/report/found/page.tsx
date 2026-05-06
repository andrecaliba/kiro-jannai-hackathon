import ItemForm from "@/components/ItemForm";

export default function ReportFoundPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ust-black mb-6">
        Report a Found Item
      </h1>
      <ItemForm type="found" />
    </main>
  );
}
