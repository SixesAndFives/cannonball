'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Save, X } from 'lucide-react'
import type { Album, User } from '@/lib/types'

interface PersonnelListProps {
  album: Album
  users: Omit<User, 'password'>[]
  onUpdate: (userIds: string[]) => void
}

export function PersonnelList({ album, users, onUpdate }: PersonnelListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(album.personnel || [])

  const handleSave = () => {
    onUpdate(selectedUserIds)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setSelectedUserIds(album.personnel || [])
    setIsEditing(false)
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Personnel</h3>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Personnel
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {users.map(user => {
          const isSelected = selectedUserIds.includes(user.id)
          const showUser = !isEditing || isSelected

          return (
            <div 
              key={user.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors
                ${isEditing ? 'hover:bg-gray-50 cursor-pointer' : ''}
                ${!isEditing && !isSelected ? 'hidden' : ''}`}
              onClick={() => isEditing && toggleUser(user.id)}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={user.profile_image || ''}
                  alt={user.full_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <div className="font-medium">{user.full_name}</div>
                {user.instruments && (
                  <p className="text-sm text-gray-600">{user.instruments}</p>
                )}
              </div>
              {isEditing && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleUser(user.id)}
                  className="h-5 w-5"
                />
              )}
            </div>
          )
        })}
      </div>

      {isEditing && (
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
