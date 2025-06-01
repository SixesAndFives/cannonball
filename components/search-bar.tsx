"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  const [keyword, setKeyword] = useState("")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger the search functionality
    console.log("Searching for:", { keyword, startYear, endYear })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSearch}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search albums, tracks, or notes..."
              className="pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Year:</span>
            <Input
              type="number"
              placeholder="From"
              className="w-24"
              min="1900"
              max="2099"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">to</span>
            <Input
              type="number"
              placeholder="To"
              className="w-24"
              min="1900"
              max="2099"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
            />
          </div>

          <Button type="submit" className="bg-gray-800 hover:bg-gray-700">
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}
