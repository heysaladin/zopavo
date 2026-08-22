export default function ColabPage() {
  return (
    <iframe
      src="/colab/index.html"
      className="flex-1 w-full border-0"
      style={{ minHeight: 0 }}
      title="Colab"
    />
  );
}
