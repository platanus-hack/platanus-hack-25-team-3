'use client';

import { useEffect, useRef } from 'react';

interface GamePlayerClientProps {
  assetUrls: Record<string, string>;
  gameDsl: any;
}

export function GamePlayerClient({ assetUrls, gameDsl }: GamePlayerClientProps) {
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Importar dinámicamente Phaser y el GameEngine solo en el cliente
    const initializeGame = async () => {
      const Phaser = await import('phaser');
      const { GameEngine } = await import('./game/GameEngine');

      console.log('Asset URLs:', assetUrls);
      console.log('Game DSL:', gameDsl);

      // Limpiar instancia previa si existe
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }

      // Configuración del juego Phaser
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1200,
        height: 900,
        parent: 'game-root',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: GameEngine
      };

      // Limpiar el contenedor y crear el juego
      const gameRoot = document.querySelector<HTMLDivElement>('#game-root');
      if (gameRoot) {
        gameRoot.innerHTML = '';
        const game = new Phaser.Game(config);
        gameInstanceRef.current = game;

        // Cargar los datos del juego en el registro de Phaser
        game.registry.set('gameData', gameDsl);
        game.registry.set('assetUrls', assetUrls);
      }
    };

    if (gameDsl && assetUrls) {
      initializeGame();
    }

    // Cleanup al desmontar
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [assetUrls, gameDsl]);

  return (
    <div className="flex items-center justify-center bg-background min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Game container */}
        <div
          id="game-root"
          className="w-full aspect-video bg-card border border-border rounded-lg shadow-lg"
        >
          {/* El juego se montará aquí */}
        </div>
      </div>
    </div>
  );
}
