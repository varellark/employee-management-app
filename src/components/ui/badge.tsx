type BadgeProps = {
  title: string;
  className?: string;
  dotClassName?: string;
  pulse?: boolean;
};

export default function Badge({
  title,
  className = '',
  dotClassName = '',
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill small fw-medium ${className}`}
    >
      {dotClassName && (
        <span
          className={`${pulse ? 'badge-pulse' : ''} ${dotClassName}`}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
      )}
      {title}
    </span>
  );
}
