export default function Crown({ size = 32, color = '#B8752A', className = '' }) {
  return (
    <img
      src="/crown.png"
      alt="HAIQ Crown"
      width={size}
      height={Math.round(size * 0.72)}
      className={className}
    />
  );
}