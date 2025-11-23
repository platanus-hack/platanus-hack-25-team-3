'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GamePlayer } from '@/components/game-player';

export default function PlayPage() {
  const searchParams = useSearchParams();
  const [gameData, setGameData] = useState<{ assetUrls: Record<string, string>; gameDsl: any } | null>(null);

  useEffect(() => {
    // Recuperar datos del sessionStorage
    const storedData = sessionStorage.getItem('currentGameData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setGameData(data);
      // Limpiar después de cargar
      sessionStorage.removeItem('currentGameData');
    }
  }, []);

  if (!gameData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando juego...</p>
      </div>
    );
  }

  return <GamePlayer assetUrls={gameData.assetUrls} gameDsl={gameData.gameDsl} />;
}
