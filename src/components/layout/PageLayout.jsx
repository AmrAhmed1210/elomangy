import ScrollHint from "../common/ScrollHint";

export default function PageLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto w-full max-w-7xl page-enter">{children}</div>
      </main>
      <ScrollHint />
    </div>
  );
}