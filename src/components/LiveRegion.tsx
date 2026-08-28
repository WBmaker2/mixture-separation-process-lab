export function LiveRegion({ message }: { message: string }) {
  return <p role="status" aria-live="polite" aria-atomic="true" className="live-region">{message}</p>;
}
