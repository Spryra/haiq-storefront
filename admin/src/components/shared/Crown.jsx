export default function Crown({ size = 26, color = '#B8752A', className = '' }) {
  // Triple the size globally
  const multipliedSize = size * 3;

  return (
    <img
      src="/crown.svg"
      alt="HAIQ Crown"
      width={multipliedSize}
      height={Math.round(multipliedSize * 0.72)}
      className={className}
      style={{ filter: 'drop-shadow(0 0 4px rgba(184,117,42,0.7))' }}
    />
  );
}