import styles from './index.module.css';
import { useEffect, useState } from 'react';

type userInputType = -1 | 0 | 1 | 2; // 0: none, -1: revealed, 1: question, 2: flag

const BOMBS = 10;

const placeBombs = (bombMap: (0 | 1)[][], row: number, cell: number) => {
  // place bombs randomly except for the clicked cell
  const newBombMap = structuredClone(bombMap);
  const bombCount = BOMBS;
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

const isWin = (bombMap: (0 | 1)[][], userInputs: userInputType[][]): boolean => {
  if (bombMap.flat().every((cell) => cell === 0)) return false;
  const flags: (1 | 0)[] = userInputs.flat().map((cell) => (cell === 2 ? 1 : 0));
  return flags.every((cell, index) => cell === bombMap.flat()[index]);
};

const isGameOver = (bombMap: (0 | 1)[][], userInputs: userInputType[][]): boolean => {
  return bombMap.flat().some((cell, index) => cell === 1 && userInputs.flat()[index] === -1);
};

const formatTimeToDisplay = (time: number) => {
  // 00:00
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const Home = () => {
  const [time, setTime] = useState(0);
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

  const win = isWin(bombMap, userInputs);
  const gameOver = win ? false : isGameOver(bombMap, userInputs);

  // timer
  useEffect(() => {
    if (win || gameOver || bombMap.flat().every((cell) => cell === 0)) return;
    const interval = setInterval(() => {
      console.log('tick');
      setTime((time) => time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [win, gameOver, bombMap]);

  const reset = () => {
    console.log('reset');
    setBombMap(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)),
    );
    setuserInputs(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)),
    );
    setTime(0);
    return;
  };
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (gameOver || win) return;
    const newUserInputs = structuredClone(userInputs);
    const newBombMap = bombMap.flat().every((cell) => cell === 0)
      ? placeBombs(bombMap, rowIndex, colIndex)
      : bombMap;

    if (bombMap[rowIndex][colIndex] === 1) {
      console.log('Game Over');
      setuserInputs(newBombMap.map((row) => row.map(() => -1)));
      return;
    }

    const revealed = revealSafeCells(newBombMap, newUserInputs, rowIndex, colIndex);
    setBombMap(newBombMap);
    setuserInputs(structuredClone(revealed) as userInputType[][]);
    return;
  };

  const handleCellRClick = (rowIndex: number, colIndex: number) => {
    if (gameOver || win) return;
    if (userInputs[rowIndex][colIndex] === -1) return;
    const newUserInputs = structuredClone(userInputs);
    const currentInput = newUserInputs[rowIndex][colIndex];
    newUserInputs[rowIndex][colIndex] = currentInput === 0 ? 2 : currentInput === 2 ? 1 : 0;
    if (isWin(bombMap, newUserInputs)) {
      console.log('Win');
      setuserInputs(newUserInputs.map((row) => row.map((c) => (c === 2 ? 2 : -1))));
      return;
    }
    setuserInputs(newUserInputs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.game}>
        <div className={styles.menu}>
          <div className={styles.ndisp}>
            {bombMap.flat().filter((cell) => cell === 1).length -
              userInputs.flat().filter((cell) => cell === 2).length}
          </div>
          <div
            className={styles.smiley}
            onClick={reset}
            style={{ backgroundPositionX: win ? '-360px' : gameOver ? '-390px' : '-330px' }}
          />
          <div className={styles.ndisp}>{formatTimeToDisplay(time)}</div>
        </div>
        <div className={styles.board}>
          {bombMap.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const count = getCountOfBombsNearby(bombMap, rowIndex, colIndex);
              const position = win
                ? '-270px'
                : gameOver
                  ? `-${(cell === 1 ? 10 : 0) * 30}px`
                  : userInputs[rowIndex][colIndex] > 0
                    ? `-${(userInputs[rowIndex][colIndex] + 7) * 30}px`
                    : `-${(count - 1) * 30}px`;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    backgroundPositionX: position,
                    backgroundImage:
                      userInputs[rowIndex][colIndex] === 0 ||
                      (userInputs[rowIndex][colIndex] <= 0 && count === 0) ||
                      (!bombMap[rowIndex][colIndex] && (gameOver || win))
                        ? 'none'
                        : undefined,
                  }}
                  className={
                    userInputs[rowIndex][colIndex] === -1 || win ? styles.cell : styles.hiddenCell
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    handleCellClick(rowIndex, colIndex);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCellRClick(rowIndex, colIndex);
                  }}
                >
                  {/* debug*/}
                  {/* {count}*/}
                  {/* {cell === 1 ? '💣' : ''} */}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
