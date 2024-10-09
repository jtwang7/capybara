import { useCallback, useRef } from "react";

// always latest function without trigger re-render
/**
 * 应用场景1：全局添加 eventListner 时，期望仅在组件初始化时执行一次，但 callback 经常会用到组件状态，
 * 若不将组件状态添加至 useEffect deps 内，则无法在 callback 触发时获取到最新的 state。此时我们期望
 * callback 及其内部变量始终保持最新 (latest value) 的同时不触发组件的更新，最佳实践就是将 callback
 * 维护到 useRef 中并用 useCallback 包裹返回一个 stable function reference。
 */
export const useEvent = (fn: Function) => {
  const fnRef = useRef<Function>(null!);
  fnRef.current = fn;

  return useCallback((...args: unknown[]) => {
    return fnRef.current?.call(this, ...args);
  }, []);
};
