export function AtmosphereBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop"
    >
      <span className="atmosphere-layer atmosphere-layer-ambient" />
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-glass" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
      <span className="atmosphere-bloom atmosphere-bloom-one" />
      <span className="atmosphere-bloom atmosphere-bloom-two" />
      <span className="atmosphere-bloom atmosphere-bloom-three" />
    </div>
  );
}
