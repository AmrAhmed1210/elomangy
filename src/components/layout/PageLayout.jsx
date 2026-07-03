export default function PageLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
