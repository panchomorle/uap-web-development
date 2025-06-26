import { createFileRoute } from '@tanstack/react-router'
import App from '../../App';
import { useAtom } from 'jotai';
import { currentBoardAtom } from '../../stores/boardStore';
import { useEffect } from 'react';

export const Route = createFileRoute('/board/$boardId')({
  loader: ({ params }) => params.boardId,
  component: BoardComponent,
});

function BoardComponent() {
  const boardId = Route.useLoaderData()
  const [boardIdFromAtom, setCurrentBoard] = useAtom(currentBoardAtom);
  // Asegurarnos que boardId es un string
  const boardIdString = String(boardId);
  
  // Usar useEffect para actualizar el estado solo cuando cambie boardIdString
  // y solo cuando sea diferente al valor actual del átomo
  useEffect(() => {
    if (boardIdString !== boardIdFromAtom) {
      setCurrentBoard(boardIdString);
    }
  }, [boardIdString, setCurrentBoard]);
  
  return (
      <App />
  )
}