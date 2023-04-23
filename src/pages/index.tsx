import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { setTimeout } from 'timers';

const WIDTH = 1200;
const HEIGHT = 800;
const PIECES = 3;

function shuffleArray<T>(array: T[]): T[] {
  const newArray = array.slice();

  // Fisher-Yatesアルゴリズムを使用して、配列をシャッフルする
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export default function Home() {
  const [pieces, setPieces] = useState<Array<JSX.Element>>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const swap = useCallback((before: number, after: number) => {
    setPieces((prevPieces) => {
      const newPieces = [...prevPieces];
      const beforeElement = newPieces.find((piece) => piece.props.index === before) as JSX.Element;
      const afterElement = newPieces.find((piece) => piece.props.index === after) as JSX.Element;

      if (newPieces.indexOf(beforeElement) < newPieces.indexOf(afterElement)) {
        const temp = afterElement;
        newPieces[newPieces.indexOf(afterElement)] = beforeElement;
        newPieces[newPieces.indexOf(beforeElement)] = temp;
      } else {
        const temp = beforeElement;
        newPieces[newPieces.indexOf(beforeElement)] = afterElement;
        newPieces[newPieces.indexOf(afterElement)] = temp;
      }

      const isCorrect = newPieces.every((piece, index) => piece.props.index === index);
      setIsCorrect(isCorrect);
      return [...newPieces];
    });
  }, []);

  useEffect(() => {
    const initialPieces = Array.from({ length: PIECES }, (_, y) =>
      Array.from({ length: PIECES }, (_, x) => (
        <Puzzle key={x + y * 3} x={x} y={y} index={x + y * 3} swap={swap} />
      )),
    ).flatMap((row) => row);
    setPieces(shuffleArray(initialPieces));
  }, [swap]);

  useEffect(() => {
    if (isCorrect) {
      setTimeout(() => {
        alert('完成！');
        setIsCorrect(false);
      }, 100);
    }
  }, [isCorrect]);

  return (
    <div
      style={{
        backgroundColor: 'white',
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {pieces}
    </div>
  );
}

type Props = {
  x: number;
  y: number;
  index: number;
  swap: (before: number, after: number) => void;
};

const Puzzle: FC<Props> = ({ x, y, index, swap }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    const img = new Image();

    img.onload = () => {
      if (!canvas || !ctx) {
        return;
      }
      canvas.width = WIDTH / PIECES;
      canvas.height = HEIGHT / PIECES;

      const pieceWidth = canvas.width;
      const pieceHeight = canvas.height;
      ctx.clearRect(0, 0, pieceWidth, pieceHeight);
      ctx.drawImage(
        img,
        x * pieceWidth,
        y * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight,
      );
      ctx.strokeRect(0, 0, pieceWidth, pieceHeight);
    };

    img.src = '/aespa.jpeg';
  }, [x, y]);

  const onDragStart = (event: React.DragEvent<HTMLCanvasElement>) => {
    const { currentTarget } = event;
    event.dataTransfer.setData('text/plain', currentTarget.id);
  };

  const onDragOver = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    const { currentTarget } = event;
    swap(Number(data), Number(currentTarget.id));
  };

  return (
    <canvas
      id={index.toString()}
      ref={canvasRef}
      draggable='true'
      onDragStart={(event) => onDragStart(event)}
      onDragOver={(event) => onDragOver(event)}
      onDrop={(event) => handleDrop(event)}
    />
  );
};
