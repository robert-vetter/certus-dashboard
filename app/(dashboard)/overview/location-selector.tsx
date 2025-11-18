'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

interface Location {
  location_id: number
  name: string
}

interface LocationSelectorProps {
  locations: Location[]
  selectedLocationId: number
}

export function LocationSelector({ locations, selectedLocationId }: LocationSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleLocationChange = (locationId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('locationId', locationId)
      router.push(`?${params.toString()}`)
    })
  }

  // Only render if there are multiple locations
  if (locations.length <= 1) {
    return null
  }

  return (
    <div className="relative">
      <select
        value={selectedLocationId}
        onChange={(e) => handleLocationChange(e.target.value)}
        disabled={isPending}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors disabled:opacity-50"
      >
        {locations.map(loc => (
          <option key={loc.location_id} value={loc.location_id}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  )
}
