export function AtmosphereBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop"
    >
      <span className="atmosphere-layer atmosphere-layer-ambient" />
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-mineral" />
      <span className="atmosphere-layer atmosphere-layer-grain" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
    </div>
  );
}
