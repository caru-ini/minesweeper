import styles from './index.module.css';
import React, { useState } from 'react';

type userInputType = -1 | 0 | 1 | 2; // 0: none, -1: revealed, 1: flagged, 2: question

// const spriteIndexes = {
//   bomb: 10,
//   numbers: [0, 1, 2, 3, 4, 5, 6, 7],
//   question: 8,
//   flag: 9,
// };

const getCountOfBombsNearby = (bombMap: (0 | 1)[][], row: number, cell: number) => {
  let count = 0;
  for (let i = row - 1; i <= row + 1; i += 1) {
    for (let j = cell - 1; j <= cell + 1; j += 1) {
      if (i < 0 || i >= 9 || j < 0 || j >= 9) {
        continue;
      }
      if (bombMap[i][j] === 1) {
        count += 1;
      }
    }
  }
  return count;
};

const revealSafeCells = (
  bombMap: (0 | 1)[][],
  userInputs: userInputType[][],
  row: number,
  cell: number,
) => {
  const newUserInputs = structuredClone(userInputs);
  const stack = [[row, cell]];
  while (stack.length > 0) {
    const [currentRow, currentCell] = stack.pop() as [number, number];
    if (newUserInputs[currentRow][currentCell] !== 0) continue;
    const bombsNearby = getCountOfBombsNearby(bombMap, currentRow, currentCell);
    newUserInputs[currentRow][currentCell] = -1;
    if (bombsNearby === 0) {
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          const newX = currentRow + x;
          const newY = currentCell + y;
          if (
            newX >= 0 &&
            newX < bombMap.length &&
            newY >= 0 &&
            newY < bombMap[0].length
            // newUserInputs[newX][newY] === 0
          ) {
            stack.push([newX, newY]);
          }
        }
      }
    }
  }
  return newUserInputs;
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

  const board = structuredClone(bombMap);

  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    const newUserInputs = structuredClone(userInputs);
    const newBombMap = bombMap.flat().every((cell) => cell === 0)
      ? placeBombs(bombMap, rowIndex, cellIndex)
      : bombMap;

    // new game
    if (bombMap[rowIndex][cellIndex] === 1) {
      // Game Over logic here

      // Placeholder for this example
      console.log('Game Over');
      return;
    }

    // Expand safe cells
    const revealed = revealSafeCells(newBombMap, newUserInputs, rowIndex, cellIndex);
    console.log(revealed);
    setBombMap(newBombMap);
    setuserInputs(structuredClone(revealed) as userInputType[][]);
    return;
  };

  const handleCellRClick = (rowIndex: number, cellIndex: number) => {
    if (userInputs[rowIndex][cellIndex] === -1) return;
    const newUserInputs = structuredClone(userInputs);
    const currentInput = newUserInputs[rowIndex][cellIndex];
    newUserInputs[rowIndex][cellIndex] = currentInput === 0 ? 2 : currentInput === 2 ? 1 : 0;
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
            <div key={rowIndex}>
              {row.map((cell, cellIndex) => {
                const count = getCountOfBombsNearby(bombMap, rowIndex, cellIndex);
                const position =
                  userInputs[rowIndex][cellIndex] > 0
                    ? `-${(userInputs[rowIndex][cellIndex] + 7) * 30}px`
                    : `-${(count - 1) * 30}px`;
                return (
                  <div
                    key={cellIndex}
                    style={{
                      backgroundPositionX: position,
                      backgroundImage:
                        userInputs[rowIndex][cellIndex] === 0 || count === 0 ? 'none' : undefined,
                    }}
                    className={
                      userInputs[rowIndex][cellIndex] !== -1 ? styles.hiddenCell : styles.cell
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleCellClick(rowIndex, cellIndex);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleCellRClick(rowIndex, cellIndex);
                    }}
                  >
                    {count}
                    {cell === 1 ? '💣' : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
