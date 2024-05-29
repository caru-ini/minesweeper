import styles from './index.module.css';
import { useGame } from '../hooks/game';
import { TopArea } from '../components/topArea';
import { Board } from '../components/board';
import { Options } from '../components/options';
const Home = () => {
  const { board, clickHandlers, bombCount, gameStatus, resetGame, setBoardOption } = useGame();
  return (
    <div className={styles.container}>
      <Options option={board.option} setBoardOption={setBoardOption} />
      <div className={styles.game}>
        <TopArea bombCount={bombCount} gameStatus={gameStatus} resetGame={resetGame} />
        <Board board={board} clickHandlers={clickHandlers} />
      </div>
    </div>
  );
};

export default Home;
