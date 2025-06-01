import type { Album } from "./types"

export const mockAlbumData: Album = {
  id: "rolling-thunder",
  title: "Rolling Thunder",
  year: 1989,
  coverImage: "/celestial-flow.png",
  tracks: [
    { id: "track-1", number: 1, title: "Opening Storm", duration: "3:42" },
    { id: "track-2", number: 2, title: "The Journey Begins", duration: "4:15" },
    { id: "track-3", number: 3, title: "Midnight Reflection", duration: "5:30" },
    { id: "track-4", number: 4, title: "Distant Memories", duration: "4:55" },
    { id: "track-5", number: 5, title: "Echoes of Yesterday", duration: "6:10" },
    { id: "track-6", number: 6, title: "Forward Motion", duration: "3:48" },
    { id: "track-7", number: 7, title: "Silent Whispers", duration: "5:22" },
    { id: "track-8", number: 8, title: "Final Thoughts", duration: "7:05" },
  ],
  notes:
    "Rolling Thunder was recorded during a three-week session at Riverside Studios in late 1988. The album represents a turning point for the band, as we experimented with new sounds and production techniques.\n\nThe recording process was intense but rewarding. We lived together in a small cabin near the studio, writing and refining the songs each evening after recording sessions. This collaborative environment led to some of our most cohesive work.\n\nSpecial thanks to Mark Johnson for his production work and Sarah Williams for the guest vocals on 'Distant Memories'.\n\nThe album title comes from a thunderstorm that rolled through during the final mixing session, which we took as a good omen.",
  gallery: [
    {
      id: "gallery-1",
      url: "/80s-stage-performance.png",
      caption: "Live at The Roxy, 1989",
    },
    {
      id: "gallery-2",
      url: "/vintage-studio-session.png",
      caption: "Recording session at Riverside Studios",
    },
    {
      id: "gallery-3",
      url: "/cabin-songwriters.png",
      caption: "Writing session at the cabin",
    },
    {
      id: "gallery-4",
      url: "/vinyl-pressing-plant.png",
      caption: "Vinyl pressing",
    },
    {
      id: "gallery-5",
      url: "/placeholder.svg?height=800&width=800&query=band%20photo%20shoot%201980s%20style",
      caption: "Album cover photo shoot",
    },
    {
      id: "gallery-6",
      url: "/placeholder.svg?height=800&width=800&query=backstage%20music%20venue%201980s",
      caption: "Backstage before the album release show",
    },
    {
      id: "gallery-7",
      url: "/placeholder.svg?height=800&width=800&query=music%20magazine%20review%20vintage",
      caption: "Rolling Stone review, June 1989",
    },
    {
      id: "gallery-8",
      url: "/placeholder.svg?height=800&width=800&query=tour%20bus%201980s%20band",
      caption: "On the road, Summer Tour 1989",
    },
  ],
  comments: [
    {
      id: "comment-1",
      author: "Mike",
      authorAvatar: "/placeholder-user.jpg",
      content:
        "I still remember recording the drum tracks for 'Midnight Reflection'. We did about 20 takes before we got it right!",
      timestamp: "2023-05-15T14:23:00Z",
    },
    {
      id: "comment-2",
      author: "Sarah",
      authorAvatar: "/placeholder-user.jpg",
      content:
        "Such great memories from this album. The cabin sessions were magical - we should try that approach again sometime.",
      timestamp: "2023-06-22T09:45:00Z",
    },
    {
      id: "comment-3",
      author: "Dave",
      authorAvatar: "/placeholder-user.jpg",
      content: "I found some additional photos from the studio sessions. I'll scan and upload them this weekend.",
      timestamp: "2023-08-10T16:12:00Z",
    },
    {
      id: "comment-4",
      author: "Lisa",
      authorAvatar: "/placeholder-user.jpg",
      content:
        "I've been listening to the original demos we made before the studio sessions. Interesting to hear how the songs evolved. Should we add those to the archive?",
      timestamp: "2023-09-05T11:30:00Z",
    },
  ],
}
