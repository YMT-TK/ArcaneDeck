import { create } from 'zustand'
import { Card, Tab, CardType, CardStatus } from '../types'

interface CardStore {
  cards: Card[]
  tabs: Tab[]
  activeTabId: string | null
  searchQuery: string
  isLoading: boolean
  
  setCards: (cards: Card[]) => void
  addCard: (card: Card) => void
  updateCard: (id: string, data: Partial<Card>) => void
  deleteCard: (id: string) => void
  restoreCard: (id: string) => void
  
  setTabs: (tabs: Tab[]) => void
  addTab: (tab: Tab) => void
  updateTab: (id: string, name: string) => void
  deleteTab: (id: string) => void
  setActiveTab: (id: string | null) => void
  
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
}

/**
 * 卡片状态管理 Store
 */
export const useCardStore = create<CardStore>((set) => ({
  cards: [],
  tabs: [],
  activeTabId: null,
  searchQuery: '',
  isLoading: false,
  
  setCards: (cards) => set({ cards }),
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCard: (id, data) => set((state) => ({
    cards: state.cards.map((card) => 
      card.id === id ? { ...card, ...data } : card
    ),
  })),
  deleteCard: (id) => set((state) => ({
    cards: state.cards.filter((card) => card.id !== id),
  })),
  restoreCard: (id) => set((state) => ({
    cards: state.cards.map((card) => 
      card.id === id ? { ...card, status: 'active' as CardStatus, deletedAt: null } : card
    ),
  })),
  
  setTabs: (tabs) => set({ tabs }),
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab] })),
  updateTab: (id, name) => set((state) => ({
    tabs: state.tabs.map((tab) => 
      tab.id === id ? { ...tab, name } : tab
    ),
  })),
  deleteTab: (id) => set((state) => ({
    tabs: state.tabs.filter((tab) => tab.id !== id),
    activeTabId: state.activeTabId === id ? null : state.activeTabId,
  })),
  setActiveTab: (id) => set({ activeTabId: id }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
