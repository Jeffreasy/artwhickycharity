export default function WhiskyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pt-[80px] sm:pt-[100px] md:pt-[120px]">
      {children}
    </div>
  )
} 