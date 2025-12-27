import { useEffect, useCallback } from 'react';
import { useLayoutStore } from '../store/layoutStore';

export function useKeyboardShortcuts() {
  const deleteSelected = useLayoutStore((state) => state.deleteSelected);
  const undo = useLayoutStore((state) => state.undo);
  const redo = useLayoutStore((state) => state.redo);
  const toggleGrid = useLayoutStore((state) => state.toggleGrid);
  const saveLayout = useLayoutStore((state) => state.saveLayout);
  const setToolMode = useLayoutStore((state) => state.setToolMode);
  const setIsPanning = useLayoutStore((state) => state.setIsPanning);
  const finishWallDrawing = useLayoutStore((state) => state.finishWallDrawing);
  const cancelWallDrawing = useLayoutStore((state) => state.cancelWallDrawing);
  const isDrawingWall = useLayoutStore((state) => state.isDrawingWall);
  const layout = useLayoutStore((state) => state.layout);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    const isMeta = e.metaKey || e.ctrlKey;
    
    // Space for pan mode
    if (e.code === 'Space' && !e.repeat) {
      setIsPanning(true);
      e.preventDefault();
      return;
    }
    
    // Escape to cancel current operation
    if (e.code === 'Escape') {
      if (isDrawingWall) {
        cancelWallDrawing();
      }
      setToolMode('select');
      e.preventDefault();
      return;
    }
    
    // Enter to finish wall drawing
    if (e.code === 'Enter' && isDrawingWall) {
      finishWallDrawing();
      e.preventDefault();
      return;
    }
    
    // Delete/Backspace to delete selected
    if (e.code === 'Delete' || e.code === 'Backspace') {
      deleteSelected();
      e.preventDefault();
      return;
    }
    
    // Cmd/Ctrl + Z for undo
    if (isMeta && e.code === 'KeyZ' && !e.shiftKey) {
      undo();
      e.preventDefault();
      return;
    }
    
    // Cmd/Ctrl + Shift + Z for redo
    if (isMeta && e.code === 'KeyZ' && e.shiftKey) {
      redo();
      e.preventDefault();
      return;
    }
    
    // Cmd/Ctrl + Y for redo (alternative)
    if (isMeta && e.code === 'KeyY') {
      redo();
      e.preventDefault();
      return;
    }
    
    // Cmd/Ctrl + S for save
    if (isMeta && e.code === 'KeyS') {
      if (layout) {
        saveLayout();
      }
      e.preventDefault();
      return;
    }
    
    // G for toggle grid
    if (e.code === 'KeyG' && !isMeta) {
      toggleGrid();
      e.preventDefault();
      return;
    }
    
    // Tool shortcuts (only when not using meta key)
    if (!isMeta) {
      switch (e.code) {
        case 'KeyV':
        case 'Digit1':
          setToolMode('select');
          e.preventDefault();
          break;
        case 'KeyW':
        case 'Digit2':
          setToolMode('wall');
          e.preventDefault();
          break;
        case 'KeyD':
        case 'Digit3':
          setToolMode('door');
          e.preventDefault();
          break;
        case 'KeyN':
        case 'Digit4':
          setToolMode('window');
          e.preventDefault();
          break;
        case 'KeyO':
        case 'Digit5':
          setToolMode('object');
          e.preventDefault();
          break;
        case 'KeyM':
        case 'Digit6':
          setToolMode('measure');
          e.preventDefault();
          break;
        case 'KeyT':
        case 'Digit7':
          setToolMode('text');
          e.preventDefault();
          break;
      }
    }
  }, [
    deleteSelected, undo, redo, toggleGrid, saveLayout, setToolMode,
    setIsPanning, finishWallDrawing, cancelWallDrawing, isDrawingWall, layout
  ]);
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setIsPanning(false);
    }
  }, [setIsPanning]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}
