interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`px-5 pb-24 pt-2 max-w-lg mx-auto ${className}`}>
      {children}
    </main>
  );
}
