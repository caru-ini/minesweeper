import styles from './index.module.css';
import { useEffect, useState } from 'react';

type userInputType = -1 | 0 | 1 | 2; // 0: none, -1: revealed, 1: question, 2: flag
type boardOptionType = {
  label: string;
  rows: number;
  cols: number;
  bombs: number;
};

const difficulties: {
  [key: string]: boardOptionType;
} = {
  easy: { label: '初級', rows: 9, cols: 9, bombs: 10 },
  medium: { label: '中級', rows: 16, cols: 16, bombs: 40 },
  hard: { label: '上級', rows: 16, cols: 30, bombs: 99 },
  custom: { label: 'カスタム', rows: 30, cols: 30, bombs: 150 },
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
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
    [-1, -1], // up-left
    [-1, 1], // up-right
    [1, -1], // down-left
    [1, 1], // down-right
  ];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCell = cell + dy;
    if (newRow >= 0 && newRow < option.rows && newCell >= 0 && newCell < option.cols) {
      callback(newRow, newCell);
    }
  });
};

const getCountOfBombsNearby = (
  bombMap: (0 | 1)[][],
  row: number,
  cell: number,
  option: boardOptionType,
) => {
  let count = 0;
  if (bombMap[row][cell] === 1) {
    return 0;
  }
  iterateAdjacentCells(row, cell, option, (i, j) => {
    if (bombMap[i][j]) {
      count += 1;
    }
  });
  return count;
};

const revealSafeCells = (
  bombMap: (0 | 1)[][],
  userInputs: userInputType[][],
  row: number,
  cell: number,
  boardOption: boardOptionType,
) => {
  const newUserInputs = structuredClone(userInputs);

  const revealCell = (row: number, cell: number) => {
    if (newUserInputs?.[row]?.[cell] !== 0) return;

    const bombsNearby = getCountOfBombsNearby(bombMap, row, cell, boardOption);
    newUserInputs[row][cell] = -1;

    if (bombsNearby === 0) {
      iterateAdjacentCells(row, cell, boardOption, (i, j) => {
        revealCell(i, j);
      });
    }
  };

  revealCell(row, cell);
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
  cell: 0 | 1,
  userInput: userInputType,
  count: number,
  win: boolean,
  gameOver: boolean,
): boolean => {
  // show all bombs and hide count when game is over
  if (win || gameOver) return cell !== 1;
  // show background image if cell is not opened and flag or question mark is attached
  if (userInput > 0) return false;
  // show background image if cell is opened and count is not 0
  if (userInput === -1 && count !== 0) return false;
  return true;
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
    errorMessages?: string[];
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

  const setDifficulty = (difficulty: boardOptionType) => {
    setBoardOption(difficulty);
    setTime(0);
    setBombMap(createEmptyBoard(difficulty.rows, difficulty.cols));
    setuserInputs(createEmptyBoard(difficulty.rows, difficulty.cols) as userInputType[][]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.customOptions}>
        {Object.values(difficulties).map((difficulty) => (
          <button
            key={difficulty.label}
            className={styles.difficultyButton}
            onClick={() => setDifficulty(difficulty)}
          >
            {difficulty.label}
          </button>
        ))}
        {boardOption.label === 'カスタム' ? (
          <div>
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
          <div className={styles.ndisp}>{`${time.toString().padStart(3, '0')}`}</div>
        </div>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${boardOption.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardOption.rows}, minmax(0, 1fr))`,
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
                      cell,
                      userInputs[rowIndex][colIndex],
                      count,
                      win,
                      gameOver,
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
                  {/* {count} */}
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
