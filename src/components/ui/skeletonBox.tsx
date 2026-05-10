type SkeletonBoxProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

export default function SkeletonBox({
  className = '',
  width,
  height,
}: SkeletonBoxProps) {
  return (
    <div className={`placeholder-glow ${className}`}>
      <span
        className='placeholder w-100 h-100 rounded'
        style={{
          width,
          height,
          display: 'block',
        }}
      />
    </div>
  );
}
