export async function updateTrackTitle(trackId: string, title: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tracks/${trackId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update track')
    }

    await response.json()
    return true
  } catch (error) {
    console.error("Error updating track:", error)
    return false
  }
}
