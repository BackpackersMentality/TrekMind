// client/src/hooks/useTrekList.ts
// Saves trek status (completed / inProgress / wishlist).
//
// Strategy:
//   • Anonymous  → localStorage only (existing behaviour, unchanged)
//   • Logged in  → Supabase DB (source of truth)
//   • On login   → merge localStorage → Supabase, clear localStorage

import { useState, useEffect, useCallback } from 'react'
import { supabase, type TrekStatus } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

// ── LocalStorage key ───────────────────────────────────────────────────────
const LS_KEY = 'trekmind_trek_list'

type TrekMap = Record<string, TrekStatus>

function readLS(): TrekMap {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeLS(map: TrekMap) {
  localStorage.setItem(LS_KEY, JSON.stringify(map))
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useTrekList() {
  const { user, isLoggedIn } = useAuth()
  const [trekMap, setTrekMap] = useState<TrekMap>({})
  const [syncing, setSyncing] = useState(false)

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user) {
      // Anonymous: read from localStorage
      setTrekMap(readLS())
      return
    }

    // Logged in: fetch from Supabase and merge any pending localStorage items
    const load = async () => {
      setSyncing(true)

      const { data, error } = await supabase
        .from('saved_treks')
        .select('trek_id, status')
        .eq('user_id', user.id)

      if (error) {
        console.error('[useTrekList] fetch error:', error)
        setSyncing(false)
        return
      }

      // Build DB map
      const dbMap: TrekMap = {}
      for (const row of data ?? []) {
        dbMap[row.trek_id] = row.status as TrekStatus
      }

      // Merge pending localStorage items → Supabase (on first login)
      const pending = readLS()
      const toUpsert = Object.entries(pending).map(([trek_id, status]) => ({
        user_id: user.id,
        trek_id,
        status,
      }))

      if (toUpsert.length > 0) {
        await supabase
          .from('saved_treks')
          .upsert(toUpsert, { onConflict: 'user_id,trek_id' })
        writeLS({}) // clear after sync
        // Re-merge
        for (const { trek_id, status } of toUpsert) {
          dbMap[trek_id] = status
        }
      }

      setTrekMap(dbMap)
      setSyncing(false)
    }

    load()
  }, [isLoggedIn, user])

  // ── Toggle status ────────────────────────────────────────────────────────
  const toggle = useCallback(async (trekId: string, status: TrekStatus) => {
    const current = trekMap[trekId]
    const next = current === status ? null : status // tap same = remove

    // Optimistic local update
    setTrekMap(prev => {
      const updated = { ...prev }
      if (next === null) delete updated[trekId]
      else updated[trekId] = next
      return updated
    })

    if (!isLoggedIn || !user) {
      // Anonymous: persist to localStorage
      const ls = readLS()
      if (next === null) delete ls[trekId]
      else ls[trekId] = next
      writeLS(ls)
      return
    }

    // Logged in: sync to Supabase
    if (next === null) {
      await supabase
        .from('saved_treks')
        .delete()
        .match({ user_id: user.id, trek_id: trekId })
    } else {
      await supabase
        .from('saved_treks')
        .upsert({ user_id: user.id, trek_id: trekId, status: next },
                 { onConflict: 'user_id,trek_id' })
    }
  }, [trekMap, isLoggedIn, user])

  // ── Getters ──────────────────────────────────────────────────────────────
  const getStatus = (trekId: string): TrekStatus | null =>
    trekMap[trekId] ?? null

  const counts = {
    completed:  Object.values(trekMap).filter(s => s === 'completed').length,
    inProgress: Object.values(trekMap).filter(s => s === 'inProgress').length,
    wishlist:   Object.values(trekMap).filter(s => s === 'wishlist').length,
  }

  return { trekMap, getStatus, toggle, counts, syncing }
}
