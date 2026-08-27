export function LiveRegion({ message }: { message: string }) {
  return <p aria-live="polite" aria-atomic="true" className="live-region">{message}</p>;
}
