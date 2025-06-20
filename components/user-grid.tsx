'use client'

import { useState } from 'react'
import styles from './user-grid.module.css'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/auth-client'
import type { User } from '@/lib/types'
import { toast } from 'sonner'

interface UserGridProps {
  users: Omit<User, 'password'>[]
}

export function UserGrid({ users }: UserGridProps) {
  const [selectedUser, setSelectedUser] = useState<Omit<User, 'password'> | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (!selectedUser) return
      
      const user = await login(selectedUser.userName, password)
      setUser(user)
      toast.success(`Welcome back, ${user.fullName}!`)
      router.push('/albums')
    } catch (error) {
      toast.error('Invalid password')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={styles.userGrid}>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={styles.userButton}
          >
            <Image
              src={user.profileImage}
              alt={user.fullName}
              fill
              className={styles.userImage}
            />
            <div className={styles.userOverlay}>
              <span className={styles.userName}>
                {user.fullName}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">{selectedUser.fullName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={selectedUser.profileImage}
                    alt={selectedUser.fullName}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!password || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
