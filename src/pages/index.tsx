import styles from './index.module.scss';
import React, { useState } from 'react';

type userInputType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// 0: none, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: question, 10: flag

const spriteIndexes = {
  bomb: 10,
  numbers: [0, 1, 2, 3, 4, 5, 6, 7],
  question: 8,
  flag: 9,
};

const Home = () => {
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
  const [userInputs, setuserInputs] = useState<userInputType[][]>([
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const board = structuredClone(bombMap);

  const handleCellLClick = (rowIndex: number, cellIndex: number) => {
    if (bombMap.flat().every((cell) => cell === 0)) {
      const newBombMap = placeBombs(bombMap, rowIndex, cellIndex);
      setBombMap(newBombMap);
      console.log('newBombMap', newBombMap);
      return;
    }

    const newBombMap = structuredClone(bombMap);
    newBombMap[rowIndex][cellIndex] += 1;
    setBombMap(newBombMap);

    console.log('newBombMap', newBombMap);
  };

  const handleCellRClick = (rowIndex: number, cellIndex: number) => {
    const newUserInputs = structuredClone(userInputs);
    if (newUserInputs[rowIndex][cellIndex] === 0) {
      newUserInputs[rowIndex][cellIndex] = 9;
    } else if (newUserInputs[rowIndex][cellIndex] === 9) {
      newUserInputs[rowIndex][cellIndex] = 8;
    } else if (newUserInputs[rowIndex][cellIndex] === 8) {
      newUserInputs[rowIndex][cellIndex] = 0;
    }
    setuserInputs(newUserInputs);
  };

  const placeBombs = (bombMap: (0 | 1)[][], row: number, cell: number) => {
    // place bombs randomly except for the clicked cell
    const newBombMap = structuredClone(bombMap);
    const bombCount = 10;
    let bombPlaced = 0;
    while (bombPlaced < bombCount) {
      const randomRow = Math.floor(Math.random() * 9);
      const randomCell = Math.floor(Math.random() * 9);
      if (randomRow === row && randomCell === cell) {
        continue;
      }
      if (newBombMap[randomRow][randomCell] === 0) {
        newBombMap[randomRow][randomCell] = 1;
        bombPlaced += 1;
      }
    }
    return newBombMap;
  };

  return (
    <div className={styles.container}>
      <div className={styles.game}>
        <div className={styles.menu}>
          <div className={styles.ndisp}>10</div>
          <div className={styles.smiley} />
          <div className={styles.ndisp} />
        </div>
        <div className={styles.board}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className={styles.cell}
                  style={{
                    backgroundPositionX: userInputs[rowIndex][cellIndex] * -30,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCellLClick(rowIndex, cellIndex);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCellRClick(rowIndex, cellIndex);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
