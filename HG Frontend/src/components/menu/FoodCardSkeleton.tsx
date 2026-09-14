export function FoodCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-[4/3] bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-full" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-secondary rounded w-16" />
          <div className="h-8 bg-secondary rounded w-20" />
        </div>
      </div>
    </div>
  );
}
