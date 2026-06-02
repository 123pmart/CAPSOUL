"use client";

export function AtmosphereBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop capsoul-atmosphere-backdrop"
      data-atmosphere-backdrop
    >
      <span className="atmosphere-layer atmosphere-layer-frost" />
      <span className="atmosphere-layer atmosphere-layer-vignette" />
    </div>
  );
}
