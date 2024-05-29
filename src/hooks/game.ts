import { useEffect, useState } from 'react';

export type userInputType = -2 | -1 | 0 | 1 | 2; // 0: none, -2 trigger, -1: revealed, 1: question, 2: flag

export type boardOptionType = {
  label: string;
  rows: number;
  cols: number;
  bombs: number;
};

type Game = {
  board: {
    bombMap: (0 | 1)[][];
    userInputs: userInputType[][];
    option: boardOptionType;
  };
  clickHandlers: {
    leftClickHandler: (rowIndex: number, colIndex: number) => void;
    rightClickHandler: (rowIndex: number, colIndex: number) => void;
  };
  bombCount: number;
  gameStatus: gameStatusType;
  resetGame: () => void;
  setBoardOption: (option: boardOptionType) => void;
};

export type gameStatusType = {
  time: number;
  status: 0 | 1 | 2; // 0 : pending, 1: win, 2: lose
};

export const difficulties: {
  [key: string]: boardOptionType;
} = {
  easy: { label: '初級', rows: 9, cols: 9, bombs: 10 },
  medium: { label: '中級', rows: 16, cols: 16, bombs: 40 },
  hard: { label: '上級', rows: 16, cols: 30, bombs: 99 },
  custom: { label: 'カスタム', rows: 30, cols: 30, bombs: 150 },
};

const createNewBoard = (rows: number, cols: number): (0 | 1)[][] => {
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

export const iterateAdjacentCells = (
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

export const getCountOfBombsNearby = (
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
export const getPhase = (bombMap: (0 | 1)[][], userInputs: userInputType[][]): 0 | 1 | 2 => {
  if (bombMap.flat().every((cell) => cell === 0)) return 0;
  // if lose trigger is found
  if (userInputs.flat().some((cell) => cell === -2)) return 2;
  // if win ( all cells without bomb are revealed )
  if (
    bombMap.filter((row, i) => row.every((cell, j) => cell === 1 || userInputs[i][j] === -1))
      .length === bombMap.length
  ) {
    return 1;
  }
  return 0;
};

export const useGame = (): Game => {
  const [boardOption, _setBoardOption] = useState<boardOptionType>(difficulties.easy);
  const [time, setTime] = useState<number>(0);
  const [bombMap, setBombMap] = useState<(0 | 1)[][]>(
    createNewBoard(boardOption.rows, boardOption.cols),
  );
  const [userInputs, setuserInputs] = useState<userInputType[][]>(
    createNewBoard(boardOption.rows, boardOption.cols),
  );

  const setBoardOption = (option: boardOptionType) => {
    _setBoardOption(option);
    setTime(0);
    setBombMap(createNewBoard(option.rows, option.cols));
    setuserInputs(createNewBoard(option.rows, option.cols) as userInputType[][]);
  };

  const bombCount =
    bombMap.flat().filter((cell) => cell === 1).length -
    userInputs.flat().filter((cell) => cell === 2).length;

  const resetGame = () => {
    setTime(0);
    setBombMap(createNewBoard(boardOption.rows, boardOption.cols));
    setuserInputs(createNewBoard(boardOption.rows, boardOption.cols) as userInputType[][]);
  };

  const phase = getPhase(bombMap, userInputs);
  console.log(phase);

  if (phase === 1) {
    userInputs.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (bombMap[i][j] === 1) userInputs[i][j] = 2;
      }),
    );
  }

  // Timer
  useEffect(() => {
    if (phase || bombMap.flat().every((cell) => cell === 0)) return;
    const interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, bombMap]);

  const leftClickHandler = (rowIndex: number, colIndex: number) => {
    if (phase) return;
    if (userInputs[rowIndex][colIndex] > 0) return;
    const newUserInputs = structuredClone(userInputs);
    const newBombMap = bombMap.flat().every((cell) => cell === 0)
      ? placeBombs(bombMap, rowIndex, colIndex, boardOption)
      : bombMap;

    if (bombMap[rowIndex][colIndex] === 1) {
      console.log('Game Over');
      // reveal all bombs
      const oldUserInputs = structuredClone(userInputs);
      const newInputs = oldUserInputs.map((row, i) =>
        row.map((cell, j) => (bombMap[i][j] === 1 ? -1 : cell)),
      );
      newInputs[rowIndex][colIndex] = -2;
      setuserInputs(newInputs);
      return;
    }

    const revealed = revealSafeCells(newBombMap, newUserInputs, rowIndex, colIndex, boardOption);
    setBombMap(newBombMap);
    setuserInputs(structuredClone(revealed) as userInputType[][]);
    return;
  };

  const rightClickHandler = (rowIndex: number, colIndex: number) => {
    if (phase) return;
    if (userInputs[rowIndex][colIndex] === -1) return;
    const newUserInputs = structuredClone(userInputs);
    const currentInput = newUserInputs[rowIndex][colIndex];
    newUserInputs[rowIndex][colIndex] = currentInput === 0 ? 2 : currentInput === 2 ? 1 : 0;
    if (getPhase(bombMap, newUserInputs) === 1) {
      console.log('Win');
      // reveal all bombs
      setuserInputs(bombMap.map((row) => row.map((cell) => (cell === 1 ? -1 : 0))));
      return;
    }
    setuserInputs(newUserInputs);
  };

  return {
    board: { bombMap, userInputs, option: boardOption },
    clickHandlers: {
      leftClickHandler,
      rightClickHandler,
    },
    bombCount,
    gameStatus: {
      time,
      status: phase,
    },
    resetGame,
    setBoardOption,
  };
};
