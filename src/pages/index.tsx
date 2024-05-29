import styles from './index.module.css';
import type { boardOptionType } from '../hooks/game';
import { difficulties, useGame } from '../hooks/game';
import { useState } from 'react';
import { TopArea } from '../components/topArea';
import { Board } from '../components/board';
const Home = () => {
  const { board, clickHandlers, bombCount, gameStatus, resetGame, setBoardOption } = useGame();
  const setDifficulty = (difficulty: boardOptionType) => {
    setBoardOption(difficulty);
  };
  const [customOptionBuff, setCustomOptionBuff] = useState<{
    rows: number;
    cols: number;
    bombs: number;
    errorMessages: string[];
  }>({
    ...difficulties.custom,
    errorMessages: [],
  });
  return (
    <div className={styles.container}>
      <div className={styles.customOptions}>
        {Object.values(difficulties).map((difficulty) => (
          <button key={difficulty.label} onClick={() => setDifficulty(difficulty)}>
            {difficulty.label}
          </button>
        ))}
        {board.option.label === 'カスタム' ? (
          <div className={styles.customOptionContainer}>
            <div className={styles.fields}>
              <div className={styles.item}>
                <label>幅:</label>
                <input
                  type="number"
                  value={customOptionBuff.cols}
                  onChange={(e) =>
                    setCustomOptionBuff({ ...customOptionBuff, cols: Number(e.target.value) })
                  }
                />
              </div>
              <div className={styles.item}>
                <label>高さ:</label>
                <input
                  type="number"
                  value={customOptionBuff.rows}
                  onChange={(e) =>
                    setCustomOptionBuff({ ...customOptionBuff, rows: Number(e.target.value) })
                  }
                />
              </div>
              <div className={styles.item}>
                <label>爆弾の数:</label>
                <input
                  type="number"
                  value={customOptionBuff.bombs}
                  max={customOptionBuff.rows * customOptionBuff.cols}
                  onChange={(e) =>
                    setCustomOptionBuff({ ...customOptionBuff, bombs: Number(e.target.value) })
                  }
                />
              </div>
              <button
                className={styles.applyButton}
                onClick={() => {
                  const newErrorMessages: string[] = [];
                  const { rows, cols, bombs } = customOptionBuff;
                  const conditions = [
                    { cond: bombs >= rows * cols, error: '爆弾の数が多すぎます' },
                    { cond: bombs <= 0, error: '爆弾の数が少なすぎます' },
                    { cond: rows <= 0, error: '高さが不正です' },
                    { cond: cols <= 0, error: '幅が不正です' },
                  ];
                  conditions.forEach(({ cond, error }) => {
                    if (cond) newErrorMessages.push(error);
                  });
                  setCustomOptionBuff({ ...customOptionBuff, errorMessages: newErrorMessages });
                  if (newErrorMessages.length > 0) return;
                  setDifficulty({
                    label: 'カスタム',
                    rows: customOptionBuff.rows,
                    cols: customOptionBuff.cols,
                    bombs: customOptionBuff.bombs,
                  });
                }}
              >
                反映
              </button>
            </div>
            <div className={styles.errorMessages}>
              {customOptionBuff.errorMessages?.map((message) => <div key={message}>{message}</div>)}
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.game}>
        <TopArea bombCount={bombCount} gameStatus={gameStatus} resetGame={resetGame} />
        <Board board={board} clickHandlers={clickHandlers} />
      </div>
    </div>
  );
};

export default Home;
