import type { gameStatusType } from '../hooks/game';

import styles from '../pages/index.module.css';

type TopAreaProps = {
  bombCount: number;
  gameStatus: gameStatusType;
  resetGame: () => void;
};

export const TopArea: React.FC<TopAreaProps> = ({ bombCount, gameStatus, resetGame }) => {
  return (
    <div className={styles.menu}>
      <div className={styles.ndisp}>{bombCount.toString().padStart(3, '0')}</div>
      <div
        className={styles.smiley}
        onClick={resetGame}
        style={{ backgroundPositionX: ['-330px', '-360px', '-390px'][gameStatus.status] }}
      />
      <div className={styles.ndisp}>{gameStatus.time.toString().padStart(3, '0')}</div>
    </div>
  );
};
