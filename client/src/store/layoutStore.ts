import { create } from 'zustand';
import { nanoid } from 'nanoid';
import {
  Layout,
  Entity,
  LayoutSettings,
  ToolMode,
  LayoutSummary,
  PresetObject,
  PresetsFile,
  DEFAULT_SETTINGS,
  createEmptyLayout,
} from '../types/schema';
import * as api from '../utils/api';

// History entry for undo/redo
interface HistoryEntry {
  entities: Entity[];
  timestamp: number;
}

interface LayoutState {
  // Current layout
  layout: Layout | null;
  layouts: LayoutSummary[];
  presets: PresetsFile | null;
  
  // Editor state
  selectedIds: string[];
  toolMode: ToolMode;
  showGrid: boolean;
  isPanning: boolean;
  
  // Canvas state
  stagePosition: { x: number; y: number };
  stageScale: number;
  
  // Wall drawing state
  wallDrawingPoints: { x: number; y: number }[];
  isDrawingWall: boolean;
  
  // Measurement state
  measureStart: { x: number; y: number } | null;
  measureEnd: { x: number; y: number } | null;
  
  // Object placement state
  placingObject: PresetObject | null;
  
  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  
  // Dirty state
  isDirty: boolean;
  
  // Actions
  loadLayouts: () => Promise<void>;
  loadLayout: (slug: string) => Promise<void>;
  newLayout: (name: string) => void;
  saveLayout: () => Promise<void>;
  saveLayoutAs: (name: string) => Promise<void>;
  
  loadPresets: () => Promise<void>;
  
  // Selection
  selectEntity: (id: string, addToSelection?: boolean) => void;
  selectEntities: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Entity operations
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntities: (ids: string[]) => void;
  deleteSelected: () => void;
  
  // Tool operations
  setToolMode: (mode: ToolMode) => void;
  toggleGrid: () => void;
  setIsPanning: (isPanning: boolean) => void;
  
  // Canvas operations
  setStagePosition: (position: { x: number; y: number }) => void;
  setStageScale: (scale: number) => void;
  
  // Wall drawing
  startWallDrawing: (point: { x: number; y: number }) => void;
  addWallPoint: (point: { x: number; y: number }) => void;
  finishWallDrawing: () => void;
  cancelWallDrawing: () => void;
  
  // Measurement
  startMeasure: (point: { x: number; y: number }) => void;
  updateMeasure: (point: { x: number; y: number }) => void;
  clearMeasure: () => void;
  
  // Object placement
  startPlacingObject: (preset: PresetObject) => void;
  cancelPlacingObject: () => void;
  
  // Settings
  updateSettings: (settings: Partial<LayoutSettings>) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const MAX_HISTORY = 100;

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layout: null,
  layouts: [],
  presets: null,
  selectedIds: [],
  toolMode: 'select',
  showGrid: true,
  isPanning: false,
  stagePosition: { x: 0, y: 0 },
  stageScale: 1,
  wallDrawingPoints: [],
  isDrawingWall: false,
  measureStart: null,
  measureEnd: null,
  placingObject: null,
  history: [],
  historyIndex: -1,
  isDirty: false,

  loadLayouts: async () => {
    try {
      const layouts = await api.getLayouts();
      set({ layouts });
    } catch (error) {
      console.error('Failed to load layouts:', error);
    }
  },

  loadLayout: async (slug: string) => {
    try {
      const layout = await api.getLayout(slug);
      set({
        layout,
        selectedIds: [],
        history: [{ entities: [...layout.entities], timestamp: Date.now() }],
        historyIndex: 0,
        isDirty: false,
      });
    } catch (error) {
      console.error('Failed to load layout:', error);
    }
  },

  newLayout: (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const layout = createEmptyLayout(name, slug);
    set({
      layout,
      selectedIds: [],
      history: [{ entities: [], timestamp: Date.now() }],
      historyIndex: 0,
      isDirty: true,
    });
  },

  saveLayout: async () => {
    const { layout } = get();
    if (!layout) return;
    
    try {
      await api.saveLayout(layout.slug, layout);
      set({ isDirty: false });
      await get().loadLayouts();
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  },

  saveLayoutAs: async (name: string) => {
    const { layout } = get();
    if (!layout) return;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newLayout: Layout = {
      ...layout,
      id: crypto.randomUUID(),
      name,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await api.saveLayout(slug, newLayout);
      set({ layout: newLayout, isDirty: false });
      await get().loadLayouts();
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  },

  loadPresets: async () => {
    try {
      const presets = await api.getPresets();
      set({ presets });
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  },

  selectEntity: (id: string, addToSelection = false) => {
    const { selectedIds } = get();
    if (addToSelection) {
      if (selectedIds.includes(id)) {
        set({ selectedIds: selectedIds.filter(i => i !== id) });
      } else {
        set({ selectedIds: [...selectedIds, id] });
      }
    } else {
      set({ selectedIds: [id] });
    }
  },

  selectEntities: (ids: string[]) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  addEntity: (entity: Entity) => {
    const { layout, pushHistory } = get();
    if (!layout) return;
    
    pushHistory();
    set({
      layout: {
        ...layout,
        entities: [...layout.entities, entity],
      },
      isDirty: true,
    });
  },

  updateEntity: (id: string, updates: Partial<Entity>) => {
    const { layout, pushHistory } = get();
    if (!layout) return;
    
    pushHistory();
    set({
      layout: {
        ...layout,
        entities: layout.entities.map(e =>
          e.id === id ? { ...e, ...updates } as Entity : e
        ),
      },
      isDirty: true,
    });
  },

  deleteEntities: (ids: string[]) => {
    const { layout, pushHistory } = get();
    if (!layout) return;
    
    pushHistory();
    set({
      layout: {
        ...layout,
        entities: layout.entities.filter(e => !ids.includes(e.id)),
      },
      selectedIds: [],
      isDirty: true,
    });
  },

  deleteSelected: () => {
    const { selectedIds, deleteEntities } = get();
    if (selectedIds.length > 0) {
      deleteEntities(selectedIds);
    }
  },

  setToolMode: (mode: ToolMode) => {
    const { cancelWallDrawing, clearMeasure, cancelPlacingObject } = get();
    cancelWallDrawing();
    clearMeasure();
    cancelPlacingObject();
    set({ toolMode: mode, selectedIds: [] });
  },

  toggleGrid: () => {
    set(state => ({ showGrid: !state.showGrid }));
  },

  setIsPanning: (isPanning: boolean) => {
    set({ isPanning });
  },

  setStagePosition: (position: { x: number; y: number }) => {
    set({ stagePosition: position });
  },

  setStageScale: (scale: number) => {
    set({ stageScale: Math.max(0.1, Math.min(5, scale)) });
  },

  startWallDrawing: (point: { x: number; y: number }) => {
    set({ wallDrawingPoints: [point], isDrawingWall: true });
  },

  addWallPoint: (point: { x: number; y: number }) => {
    const { wallDrawingPoints } = get();
    set({ wallDrawingPoints: [...wallDrawingPoints, point] });
  },

  finishWallDrawing: () => {
    const { wallDrawingPoints, layout, addEntity } = get();
    if (wallDrawingPoints.length >= 2 && layout) {
      const wallEntity = {
        id: nanoid(),
        type: 'wall' as const,
        x: 0,
        y: 0,
        rotation: 0,
        points: wallDrawingPoints,
        thickness: 6, // 6 inches default
      };
      addEntity(wallEntity);
    }
    set({ wallDrawingPoints: [], isDrawingWall: false });
  },

  cancelWallDrawing: () => {
    set({ wallDrawingPoints: [], isDrawingWall: false });
  },

  startMeasure: (point: { x: number; y: number }) => {
    set({ measureStart: point, measureEnd: point });
  },

  updateMeasure: (point: { x: number; y: number }) => {
    set({ measureEnd: point });
  },

  clearMeasure: () => {
    set({ measureStart: null, measureEnd: null });
  },

  startPlacingObject: (preset: PresetObject) => {
    set({ placingObject: preset, toolMode: 'object' });
  },

  cancelPlacingObject: () => {
    set({ placingObject: null });
  },

  updateSettings: (settings: Partial<LayoutSettings>) => {
    const { layout } = get();
    if (!layout) return;
    
    set({
      layout: {
        ...layout,
        settings: { ...layout.settings, ...settings },
      },
      isDirty: true,
    });
  },

  undo: () => {
    const { history, historyIndex, layout } = get();
    if (historyIndex <= 0 || !layout) return;
    
    // Restore the state at current historyIndex (state saved before last change)
    const entry = history[historyIndex];
    set({
      layout: { ...layout, entities: [...entry.entities] },
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex, layout } = get();
    if (historyIndex >= history.length - 1 || !layout) return;
    
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    set({
      layout: { ...layout, entities: [...entry.entities] },
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  pushHistory: () => {
    const { layout, history, historyIndex } = get();
    if (!layout) return;
    
    // Remove any redo history
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add current state
    newHistory.push({
      entities: layout.entities.map(e => ({ ...e })),
      timestamp: Date.now(),
    });
    
    // Limit history size
    while (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
}));
