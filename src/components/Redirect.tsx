// filepath: src/components/Redirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectProps {
  to: string;
}

function Redirect({ to }: RedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(to);
  }, [router, to]);

  return null; // This component doesn't render anything
}

export default Redirect;
