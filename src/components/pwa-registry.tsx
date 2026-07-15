"use client"

import { useEffect } from "react"

export function PwaRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar Service Worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('Falha ao registrar Service Worker:', error);
        });
    }
  }, []);

  return null;
}
