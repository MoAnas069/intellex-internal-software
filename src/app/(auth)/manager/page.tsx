'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner');
  }, [router]);

  return null;
}
