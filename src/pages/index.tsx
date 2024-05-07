import styles from './index.module.scss';
import { useState } from 'react';

const Home = () => {
  const [samplePos, setSamplePos] = useState(0);
  const [bombMap, setBombMap] = useState<(0 | 1)[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const [userInputs, setuserInputs] = useState<(0 | 1 | 2 | 3)[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const board = structuredClone(bombMap);

  console.log('sample', samplePos);
  return (
    <div className={styles.container}>
      <div className={styles.board} style={{ backgroundPosition: `${-30 * samplePos}px 0px` }}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={styles.cell}
                onClick={() => {
                  const newBombMap = structuredClone(bombMap);
                  newBombMap[rowIndex][cellIndex] = 1;
                  setBombMap(newBombMap);
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
