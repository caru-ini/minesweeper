import { useState } from 'react';
import type { boardOptionType } from '../hooks/game';
import { difficulties } from '../hooks/game';
import styles from '../pages/index.module.css';

interface boardOptionProps {
  option: boardOptionType;
  setBoardOption: (option: boardOptionType) => void;
}

export const Options: React.FC<boardOptionProps> = ({ option, setBoardOption }) => {
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
    <div className={styles.customOptions}>
      {Object.values(difficulties).map((difficulty) => (
        <button key={difficulty.label} onClick={() => setBoardOption(difficulty)}>
          {difficulty.label}
        </button>
      ))}
      {option.label === 'カスタム' ? (
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
                setBoardOption({
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
  );
};
