export default function Crown({ size = 26, color = '#A67C52', className = '' }) {
  // Triple the size globally
  const multipliedSize = size * 3;

  return (
    <img
      src="/crown.svg"
      alt="HAIQ Crown"
      width={multipliedSize}
      height={Math.round(multipliedSize * 0.72)}
      className={className}
      style={{ filter: 'drop-shadow(0 0 4px rgba(166,124,82,0.7))' }}
    />
  );
}