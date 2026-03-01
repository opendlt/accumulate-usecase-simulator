import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import { createCanvasStore, type CanvasStore } from "./canvas-store";

const CanvasStoreContext = createContext<StoreApi<CanvasStore> | null>(null);

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<CanvasStore>>(null);
  if (storeRef.current === null) {
    storeRef.current = createCanvasStore();
  }
  return (
    <CanvasStoreContext.Provider value={storeRef.current}>
      {children}
    </CanvasStoreContext.Provider>
  );
}

/** Read from the nearest CanvasStoreProvider's store. Throws if none exists. */
export function useCanvasStoreContext<T>(selector: (state: CanvasStore) => T): T {
  const store = useContext(CanvasStoreContext);
  if (!store) throw new Error("useCanvasStoreContext must be used within CanvasStoreProvider");
  return useStore(store, selector);
}

/** Get the raw StoreApi for imperative use. Throws if none exists. */
export function useCanvasStoreApi(): StoreApi<CanvasStore> {
  const store = useContext(CanvasStoreContext);
  if (!store) throw new Error("useCanvasStoreApi must be used within CanvasStoreProvider");
  return store;
}
