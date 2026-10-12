type UTMSMarkProps = {
  className?: string;
};

export default function UTMSMark({ className }: UTMSMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        d="M8 12v8.5C8 28.5 12.8 33 20 33s12-4.5 12-12.5V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M9.5 11.5C12.2 7.2 16 5 20.5 5c4.4 0 8.1 2.2 10.5 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <circle cx="20" cy="18" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M14.3 17.2c3.7 2.2 7.7 3.5 11.4 3.4M18.1 12.7c-1.7 3.1-2.3 6.9-1.6 10.6m5.4-10.6c1.7 3.1 2.3 6.9 1.6 10.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}
