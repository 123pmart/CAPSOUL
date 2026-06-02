"use client";

export function AtmosphereBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="atmosphere-backdrop capsoul-atmosphere-backdrop"
      data-atmosphere-backdrop
    >
      <span className="capsoul-atmosphere-backdrop__field capsoul-atmosphere-backdrop__field--one" />
      <span className="capsoul-atmosphere-backdrop__field capsoul-atmosphere-backdrop__field--two" />
      <span className="capsoul-atmosphere-backdrop__field capsoul-atmosphere-backdrop__field--three" />
      <span className="capsoul-atmosphere-backdrop__vignette" />
    </div>
  );
}
