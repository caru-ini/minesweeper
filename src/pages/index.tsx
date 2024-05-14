import styles from './index.module.css';
import { useEffect, useState } from 'react';

type userInputType = -1 | 0 | 1 | 2; // 0: none, -1: revealed, 1: question, 2: flag
type boardOptionType = {
  rows: number;
  cols: number;
  bombs: number;
  custom: boolean;
};

const difficulties: {
  [key: string]: boardOptionType;
} = {
  easy: { rows: 9, cols: 9, bombs: 10, custom: false },
  medium: { rows: 16, cols: 16, bombs: 40, custom: false },
  hard: { rows: 16, cols: 30, bombs: 99, custom: false },
  custom: { rows: 30, cols: 30, bombs: 150, custom: true },
};

const createEmptyBoard = (rows: number, cols: number): (0 | 1)[][] => {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));
};

const placeBombs = (bombMap: (0 | 1)[][], row: number, cell: number, option: boardOptionType) => {
  const newBombMap = structuredClone(bombMap);
  let bombPlaced = 0;
  while (bombPlaced < option.bombs) {
    const randomRow = Math.floor(Math.random() * option.rows);
    const randomCell = Math.floor(Math.random() * option.cols);
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

const iterateAdjacentCells = (
  row: number,
  cell: number,
  option: boardOptionType,
  callback: (i: number, j: number) => void,
) => {
  for (let i = row - 1; i <= row + 1; i += 1) {
    for (let j = cell - 1; j <= cell + 1; j += 1) {
      if (i < 0 || i >= option.rows || j < 0 || j >= option.cols) {
        continue;
      }
      callback(i, j);
    }
  }
};

const getCountOfBombsNearby = (
  bombMap: (0 | 1)[][],
  row: number,
  cell: number,
  option: boardOptionType,
) => {
  let count = 0;
  iterateAdjacentCells(row, cell, option, (i, j) => {
    if (bombMap[i][j]) {
      count += 1;
    }
  });
  return count;
};

const getAdjacentCells = (
  row: number,
  cell: number,
  option: boardOptionType,
): [number, number][] => {
  const adjacentCells: [number, number][] = [];
  iterateAdjacentCells(row, cell, option, (i, j) => {
    adjacentCells.push([i, j]);
  });
  return adjacentCells;
};

const revealSafeCells = (
  bombMap: (0 | 1)[][],
  userInputs: userInputType[][],
  row: number,
  cell: number,
  boardOption: boardOptionType,
) => {
  const newUserInputs = structuredClone(userInputs);
  const stack = [[row, cell]];
  while (stack.length > 0) {
    const [currentRow, currentCell] = stack.pop() as [number, number];
    if (newUserInputs[currentRow][currentCell] !== 0) continue;
    const bombsNearby = getCountOfBombsNearby(bombMap, currentRow, currentCell, boardOption);
    newUserInputs[currentRow][currentCell] = -1;
    if (bombsNearby === 0) {
      stack.push(...getAdjacentCells(currentRow, currentCell, boardOption));
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

const calculatePosition = (
  cell: number,
  win: boolean,
  gameOver: boolean,
  userInputs: userInputType[][],
  rowIndex: number,
  colIndex: number,
  count: number,
): string => {
  if (win) return '-269px'; // hack: なぜか右のスプライトが見えてしまうので
  if (gameOver) return `-${(cell === 1 ? 10 : 0) * 30}px`;
  if (userInputs[rowIndex][colIndex] > 0) return `-${(userInputs[rowIndex][colIndex] + 7) * 30}px`;
  return `-${(count - 1) * 30}px`;
};

const shouldHideBackgroundImage = (
  userInputs: userInputType[][],
  rowIndex: number,
  colIndex: number,
  count: number,
  bombMap: (0 | 1)[][],
  gameOver: boolean,
  win: boolean,
): boolean => {
  return (
    userInputs[rowIndex][colIndex] === 0 ||
    (userInputs[rowIndex][colIndex] <= 0 && count === 0) ||
    (!bombMap[rowIndex][colIndex] && (gameOver || win))
  );
};

const getClassName = (
  userInputs: userInputType[][],
  rowIndex: number,
  colIndex: number,
  win: boolean,
  styles: { readonly [key: string]: string },
): string => {
  return userInputs[rowIndex][colIndex] === -1 || win ? styles.cell : styles.hiddenCell;
};

const Home = () => {
  const [time, setTime] = useState(0);
  const [boardOption, setBoardOption] = useState<boardOptionType>(difficulties.easy);
  const [customOptionBuff, setCustomOptionBuff] = useState<{
    rows: number;
    cols: number;
    bombs: number;
  }>({
    rows: 30,
    cols: 30,
    bombs: 150,
  });
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

  // Timer
  useEffect(() => {
    if (win || gameOver || bombMap.flat().every((cell) => cell === 0)) return;
    const interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [win, gameOver, bombMap]);

  const reset = () => {
    setTime(0);
    setBombMap(createEmptyBoard(boardOption.rows, boardOption.cols));
    setuserInputs(createEmptyBoard(boardOption.rows, boardOption.cols) as userInputType[][]);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (gameOver || win) return;
    if (userInputs[rowIndex][colIndex] > 0) return;
    const newUserInputs = structuredClone(userInputs);
    const newBombMap = bombMap.flat().every((cell) => cell === 0)
      ? placeBombs(bombMap, rowIndex, colIndex, boardOption)
      : bombMap;

    if (bombMap[rowIndex][colIndex] === 1) {
      console.log('Game Over');
      setuserInputs(newBombMap.map((row) => row.map(() => -1)));
      return;
    }

    const revealed = revealSafeCells(newBombMap, newUserInputs, rowIndex, colIndex, boardOption);
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

  const setDifficulty = (difficulty: {
    rows: number;
    cols: number;
    bombs: number;
    custom: boolean;
  }) => {
    setBoardOption(difficulty);
    setTime(0);
    setBombMap(createEmptyBoard(difficulty.rows, difficulty.cols));
    setuserInputs(createEmptyBoard(difficulty.rows, difficulty.cols) as userInputType[][]);
  };

  return (
    <div className={styles.container}>
      <div>
        <button onClick={() => setDifficulty(difficulties.easy)}>初級</button>
        <button onClick={() => setDifficulty(difficulties.medium)}>中級</button>
        <button onClick={() => setDifficulty(difficulties.hard)}>上級</button>
        <button onClick={() => setDifficulty(difficulties.custom)}>カスタム</button>
      </div>
      {boardOption.custom ? (
        <div className={styles.options}>
          <div className={styles.optItem}>
            <label>幅:</label>
            <input
              type="number"
              value={customOptionBuff.cols}
              onChange={(e) =>
                setCustomOptionBuff({ ...customOptionBuff, cols: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.optItem}>
            <label>高さ:</label>
            <input
              type="number"
              value={customOptionBuff.rows}
              onChange={(e) =>
                setCustomOptionBuff({ ...customOptionBuff, rows: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.optItem}>
            <label>爆弾の数:</label>
            <input
              type="number"
              value={customOptionBuff.bombs}
              onChange={(e) =>
                setCustomOptionBuff({ ...customOptionBuff, bombs: Number(e.target.value) })
              }
            />
          </div>
          <button
            className={styles.optItem}
            onClick={() => {
              console.log(customOptionBuff);
              setDifficulty({
                rows: customOptionBuff.rows,
                cols: customOptionBuff.cols,
                bombs: customOptionBuff.bombs,
                custom: true,
              });
            }}
          >
            反映
          </button>
        </div>
      ) : null}
      <div className={styles.game}>
        <div className={styles.menu}>
          <div className={styles.ndisp}>
            {(
              bombMap.flat().filter((cell) => cell === 1).length -
              userInputs.flat().filter((cell) => cell === 2).length
            )
              .toString()
              .padStart(3, '0')}
          </div>
          <div
            className={styles.smiley}
            onClick={reset}
            style={{ backgroundPositionX: win ? '-360px' : gameOver ? '-390px' : '-330px' }}
          />
          <div className={styles.ndisp}>{`${time.toString().padStart(3, '0')}`}</div>
        </div>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${boardOption.cols}, 32px)`,
            gridTemplateRows: `repeat(${boardOption.rows}, 32px)`,
          }}
        >
          {bombMap.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const count = getCountOfBombsNearby(bombMap, rowIndex, colIndex, boardOption);
              const position = calculatePosition(
                cell,
                win,
                gameOver,
                userInputs,
                rowIndex,
                colIndex,
                count,
              );
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    backgroundPositionX: position,
                    backgroundImage: shouldHideBackgroundImage(
                      userInputs,
                      rowIndex,
                      colIndex,
                      count,
                      bombMap,
                      gameOver,
                      win,
                    )
                      ? 'none'
                      : undefined,
                  }}
                  className={getClassName(userInputs, rowIndex, colIndex, win, styles)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCellClick(rowIndex, colIndex);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCellRClick(rowIndex, colIndex);
                  }}
                >
                  {/* debug & cheat */}
                  {/* {userInputs[rowIndex][colIndex]} */}
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
