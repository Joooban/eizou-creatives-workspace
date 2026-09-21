type EizouMarkProps = {
  size?: number;
  className?: string;
};

function EizouMark({ size = 28, className }: EizouMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="18" y="20" width="64" height="16" rx="3" />
      <polygon points="82,36 82,44 26,64 26,56" />
      <rect x="18" y="64" width="64" height="16" rx="3" />
    </svg>
  );
}

export default EizouMark;
