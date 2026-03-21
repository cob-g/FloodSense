import {
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonBox,
  SkeletonCircle,
  SkeletonText,
} from '../../components/common/Skeleton';

const Section = ({ title, dark = false, children }) => (
  <section>
    <h2 className="text-lg font-bold text-neutral-700 mb-4 pb-2 border-b border-neutral-200 uppercase tracking-wide">
      {title}
    </h2>
    {dark ? (
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1c1410 0%, #110d0a 100%)' }}>
        {children}
      </div>
    ) : children}
  </section>
);

const SkeletonPage = () => (
  <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">
    <div>
      <h1 className="text-3xl font-black text-neutral-800 mb-1">Skeleton UI Gallery</h1>
      <p className="text-neutral-500 text-sm">Dev-only page — all loading states in one place.</p>
    </div>

    {/* Primitives */}
    <Section title="Primitives">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 font-semibold uppercase">SkeletonText</p>
          <SkeletonText className="w-full" />
          <SkeletonText className="w-3/4" />
          <SkeletonText className="h-3 w-1/2" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 font-semibold uppercase">SkeletonCircle</p>
          <div className="flex items-end gap-4">
            <SkeletonCircle className="w-8 h-8" />
            <SkeletonCircle className="w-10 h-10" />
            <SkeletonCircle />
            <SkeletonCircle className="w-14 h-14" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 font-semibold uppercase">SkeletonBox</p>
          <SkeletonBox className="w-full h-24 rounded-2xl" />
        </div>
      </div>
    </Section>

    {/* Feed / Report Cards */}
    <Section title="Feed — Report Cards">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </Section>

    {/* Admin Stat Cards — must be on dark bg */}
    <Section title="Admin — Stat Cards (dark context)" dark>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonStatCard className="bg-white/5" />
        <SkeletonStatCard className="bg-white/5" />
        <SkeletonStatCard className="bg-white/5" />
        <SkeletonStatCard className="bg-white/5" />
      </div>
    </Section>

    {/* Admin Users list */}
    <Section title="Admin — Users List (dark context)" dark>
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <SkeletonCircle className="w-10 h-10 shrink-0 bg-white/10" />
                <div className="flex-1 space-y-2 min-w-0">
                  <SkeletonText className="w-32 bg-white/10" />
                  <SkeletonText className="h-3 w-48 bg-white/[0.07]" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SkeletonText className="h-6 w-14 rounded-lg bg-white/10" />
                <SkeletonText className="h-6 w-16 rounded-lg bg-white/10" />
              </div>
              <SkeletonCircle className="w-9 h-9 rounded-lg bg-white/10 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* Table Rows */}
    <Section title="Table Rows">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-neutral-100">
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
          </tbody>
        </table>
      </div>
    </Section>

    {/* Admin Dashboard loading state */}
    <Section title="Admin — Dashboard Loading (dark context)" dark>
      <div className="space-y-6">
        <div className="space-y-2">
          <SkeletonText className="h-8 w-48 bg-white/10" />
          <SkeletonText className="h-4 w-80 bg-white/[0.07]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonStatCard className="bg-white/5" />
          <SkeletonStatCard className="bg-white/5" />
          <SkeletonStatCard className="bg-white/5" />
          <SkeletonStatCard className="bg-white/5" />
        </div>
        <SkeletonBox className="h-64 w-full rounded-2xl bg-white/5 border border-white/5" />
      </div>
    </Section>
  </div>
);

export default SkeletonPage;
