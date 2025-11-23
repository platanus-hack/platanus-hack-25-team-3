import dynamic from 'next/dynamic';

// Importar el componente sin SSR
const GamePlayerClient = dynamic(
  () => import('./game-player-client').then(mod => ({ default: mod.GamePlayerClient })),
  { ssr: false }
);

interface GamePlayerProps {
  assetUrls: Record<string, string>;
  gameDsl: any;
}

export function GamePlayer({ assetUrls, gameDsl }: GamePlayerProps) {
  return <GamePlayerClient assetUrls={assetUrls} gameDsl={gameDsl} />;
}
