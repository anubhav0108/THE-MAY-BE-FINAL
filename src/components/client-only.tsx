
"use client";

import React, { useState, useEffect } from 'react';

// This component will only render its children on the client-side.
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Return null on the server to avoid hydration mismatch
    return null;
  }

  return <>{children}</>;
}
