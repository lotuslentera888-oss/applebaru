import React from "react";

export default function SystemIcon({ name, fallback: Fallback, size = 22, strokeWidth = 2.1 }) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [name]);

  if (imageFailed) {
    return <Fallback size={size} strokeWidth={strokeWidth} />;
  }

  return (
    <img
      src={`/icons/sf/${name}.png`}
      aria-hidden="true"
      alt=""
      className="ios-system-symbol"
      width={size}
      height={size}
      onError={() => setImageFailed(true)}
    />
  );
}
