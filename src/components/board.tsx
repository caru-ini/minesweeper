import {
  getCountOfBombsNearby,
  getPhase,
  type boardOptionType,
  type userInputType,
} from '../hooks/game';

import styles from '../pages/index.module.css';

type BoardProps = {
  board: {
    bombMap: (0 | 1)[][];
    userInputs: userInputType[][];
    option: boardOptionType;
  };
  clickHandlers: {
    leftClickHandler: (row: number, cell: number) => void;
    rightClickHandler: (row: number, cell: number) => void;
  };
};

const calculatePosition = (
  cell: number,
  // win: boolean,
  // gameOver: boolean,
  status: number,
  userInputs: userInputType[][],
  rowIndex: number,
  colIndex: number,
  count: number,
): string => {
  if (status === 1 && cell) return '-270px';
  if (status === 2) return `-${(cell === 1 ? 10 : 0) * 30 - 1}px`;
  if (userInputs[rowIndex][colIndex] > 0) return `-${(userInputs[rowIndex][colIndex] + 7) * 30}px`;
  return `-${(count - 1) * 30}px`;
};

const shouldHideBackgroundImage = (
  cell: 0 | 1,
  userInput: userInputType,
  count: number,
  status: number,
): boolean => {
  // show all bombs and hide count when game is over
  if (status && cell === 1) return false;
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
  styles: { readonly [key: string]: string },
): string => {
  return userInputs[rowIndex][colIndex] <= -1 ? styles.cell : styles.hiddenCell;
};

export const Board: React.FC<BoardProps> = ({ board, clickHandlers }) => {
  const { bombMap, userInputs } = board;
  const { leftClickHandler, rightClickHandler } = clickHandlers;
  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${board.option.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${board.option.rows}, minmax(0, 1fr))`,
      }}
    >
      {bombMap.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const status = getPhase(bombMap, userInputs);
          const count = getCountOfBombsNearby(bombMap, rowIndex, colIndex, board.option);
          const position = calculatePosition(cell, status, userInputs, rowIndex, colIndex, count);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                backgroundPositionX: position,
                backgroundImage: shouldHideBackgroundImage(
                  cell,
                  userInputs[rowIndex][colIndex],
                  count,
                  status,
                )
                  ? 'none'
                  : undefined,
                backgroundColor: userInputs[rowIndex][colIndex] === -2 ? 'red' : undefined,
              }}
              className={getClassName(userInputs, rowIndex, colIndex, styles)}
              onClick={(e) => {
                e.preventDefault();
                leftClickHandler(rowIndex, colIndex);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                rightClickHandler(rowIndex, colIndex);
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
  );
};
