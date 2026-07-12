export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="9" fill="currentColor" className="text-brand-600" />
        <path
          d="M9 13.5C9 11.567 10.567 10 12.5 10H20a2 2 0 0 1 2 2v1h-9.5a1.5 1.5 0 0 0 0 3H22v3a2 2 0 0 1-2 2h-7.5A3.5 3.5 0 0 1 9 17.5v-4Z"
          fill="white"
        />
        <circle cx="19.25" cy="16" r="1.1" fill="currentColor" className="text-brand-600" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-brand-950 dark:text-brand-50">
        SalvaBolso
      </span>
    </div>
  );
}
