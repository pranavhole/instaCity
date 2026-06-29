"use client";

import { type ReactNode, useState } from "react";

type RemoteImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallback: ReactNode;
};

export function RemoteImage({ src, alt = "", className, imageClassName, fallback }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={className}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={imageClassName} onError={() => setFailed(true)} referrerPolicy="no-referrer" />
      ) : (
        fallback
      )}
    </div>
  );
}
