import { StoreApi, create } from 'zustand';
import { ChatSlice, createChatSlice } from './chat-slice';
import { InputSlice, createInputSlice } from './input-slice';
import { AuthSlice, createAuthSlice } from './auth-slice';
import { ConfigSlice, createConfigSlice } from './config-slice';
import { PromptSlice, createPromptSlice } from './prompt-slice';
import { ToastSlice, createToastSlice } from './toast-slice';

export type StoreState = ChatSlice &
  InputSlice &
  AuthSlice &
  ConfigSlice &
  PromptSlice &
  ToastSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;


const useStore = create<StoreState>()((set, get) => ({
  ...createChatSlice(set, get),
  ...createInputSlice(set, get),
  ...createAuthSlice(set, get),
  ...createConfigSlice(set, get),
  ...createPromptSlice(set, get),
  ...createToastSlice(set, get),
}));

export default useStore;
