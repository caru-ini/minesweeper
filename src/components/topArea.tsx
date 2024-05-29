import type { gameStatusType } from '../hooks/game';
import localFont from 'next/font/local';

import styles from '../pages/index.module.css';

const font = localFont({ src: './../pages/DSEG7Classic-Bold.woff2' });

interface TopAreaProps {
  bombCount: number;
  gameStatus: gameStatusType;
  resetGame: () => void;
}

export const TopArea: React.FC<TopAreaProps> = ({ bombCount, gameStatus, resetGame }) => {
  return (
    <div className={styles.menu}>
      <div className={`${styles.ndisp} ${font.className}`}>
        {bombCount.toString().padStart(3, '0')}
      </div>
      <div
        className={styles.smiley}
        onClick={resetGame}
        style={{ backgroundPositionX: ['-330px', '-360px', '-390px'][gameStatus.status] }}
      />
      <div className={`${styles.ndisp} ${font.className}`}>
        {gameStatus.time.toString().padStart(3, '0')}
      </div>
    </div>
  );
};
