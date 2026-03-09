// useTrekList.ts
// localStorage-based trek tracking — no auth required
// Three lists: completed, wishlist, inProgress
// Usage: const { status, toggle, counts } = useTrekList()

import { useState, useEffect, useCallback } from 'react'

export type TrekStatus = 'completed' | 'wishlist' | 'inProgress' | null

interface TrekLists {
  completed: Set<string>
  wishlist: Set<string>
  inProgress: Set<string>
}

interface TrekListCounts {
  completed: number
  wishlist: number
  inProgress: number
}

const STORAGE_KEY = 'trekmind_lists'

function loadFromStorage(): TrekLists {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completed: new Set(), wishlist: new Set(), inProgress: new Set() }
    const parsed = JSON.parse(raw)
    return {
      completed:  new Set<string>(parsed.completed  || []),
      wishlist:   new Set<string>(parsed.wishlist   || []),
      inProgress: new Set<string>(parsed.inProgress || []),
    }
  } catch {
    return { completed: new Set(), wishlist: new Set(), inProgress: new Set() }
  }
}

function saveToStorage(lists: TrekLists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completed:  Array.from(lists.completed),
      wishlist:   Array.from(lists.wishlist),
      inProgress: Array.from(lists.inProgress),
    }))
  } catch {
    // localStorage unavailable (private browsing etc.) — fail silently
  }
}

export function useTrekList() {
  const [lists, setLists] = useState<TrekLists>(() => loadFromStorage())

  // Sync to localStorage on every change
  useEffect(() => {
    saveToStorage(lists)
  }, [lists])

  // Get current status of a trek
  const getStatus = useCallback((trekId: string): TrekStatus => {
    if (lists.completed.has(trekId))  return 'completed'
    if (lists.inProgress.has(trekId)) return 'inProgress'
    if (lists.wishlist.has(trekId))   return 'wishlist'
    return null
  }, [lists])

  // Toggle: if already in this status → remove, else → set (and remove from others)
  const toggle = useCallback((trekId: string, status: Exclude<TrekStatus, null>) => {
    setLists(prev => {
      const next: TrekLists = {
        completed:  new Set(prev.completed),
        wishlist:   new Set(prev.wishlist),
        inProgress: new Set(prev.inProgress),
      }
      const currentStatus = next.completed.has(trekId)  ? 'completed'
                          : next.inProgress.has(trekId) ? 'inProgress'
                          : next.wishlist.has(trekId)   ? 'wishlist'
                          : null

      // Remove from all lists first
      next.completed.delete(trekId)
      next.wishlist.delete(trekId)
      next.inProgress.delete(trekId)

      // If clicking the same status again → deselect (already removed above)
      if (currentStatus !== status) {
        next[status].add(trekId)
      }

      return next
    })
  }, [])

  const counts: TrekListCounts = {
    completed:  lists.completed.size,
    wishlist:   lists.wishlist.size,
    inProgress: lists.inProgress.size,
  }

  // All trek IDs across all lists (for globe rendering)
  const allTracked = useCallback((): Record<string, TrekStatus> => {
    const result: Record<string, TrekStatus> = {}
    lists.completed.forEach(id  => { result[id] = 'completed'  })
    lists.inProgress.forEach(id => { result[id] = 'inProgress' })
    lists.wishlist.forEach(id   => { result[id] = 'wishlist'   })
    return result
  }, [lists])

  return { getStatus, toggle, counts, allTracked, lists }
}

// ── Standalone helpers for non-hook contexts (e.g. globe renderer) ────────────

export function getStoredStatus(trekId: string): TrekStatus {
  const lists = loadFromStorage()
  if (lists.completed.has(trekId))  return 'completed'
  if (lists.inProgress.has(trekId)) return 'inProgress'
  if (lists.wishlist.has(trekId))   return 'wishlist'
  return null
}

export function getAllStoredStatuses(): Record<string, TrekStatus> {
  const lists = loadFromStorage()
  const result: Record<string, TrekStatus> = {}
  lists.completed.forEach(id  => { result[id] = 'completed'  })
  lists.inProgress.forEach(id => { result[id] = 'inProgress' })
  lists.wishlist.forEach(id   => { result[id] = 'wishlist'   })
  return result
}