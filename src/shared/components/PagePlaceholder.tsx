interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">Esta página está en desarrollo</p>
    </div>
  )
}
