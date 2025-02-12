export function ShopSkeleton() {
  return (
    <main>
      {/* Hero Section Skeleton */}
      <section className="min-h-[40vh] bg-black text-white pt-[120px] pb-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="h-12 bg-white/10 rounded-lg w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-2/3 mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 animate-pulse">
                <div className="relative pt-[100%]">
                  <div className="absolute inset-0 bg-white/10" />
                </div>
                <div className="p-6">
                  <div className="h-6 bg-white/10 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-white/10 rounded mb-2 w-full" />
                  <div className="h-4 bg-white/10 rounded mb-4 w-2/3" />
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-white/10 rounded w-20" />
                    <div className="h-10 bg-white/10 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 