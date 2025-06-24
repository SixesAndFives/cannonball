export default function AlbumsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {children}
    </div>
  )
}
