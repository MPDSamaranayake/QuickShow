import {
  assets,
  dummyDashboardData,
  dummyShowsData,
  dummyTrailers,
} from './assets/assets.js'

function App() {
  const featuredShows = dummyShowsData.slice(0, 3)
  const featuredTrailer = dummyTrailers[0]

  return (
    <main
      style={{
        minHeight: '100svh',
        padding: '32px',
        boxSizing: 'border-box',
        background:
          'radial-gradient(circle at top, rgba(255, 183, 77, 0.22), transparent 30%), linear-gradient(180deg, #0f172a 0%, #111827 42%, #050816 100%)',
        color: '#f8fafc',
      }}
    >
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gap: '28px',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          alignItems: 'center',
        }}
      >
        <div>
          <img
            src={assets.logo}
            alt="QuickShow"
            style={{ width: '140px', marginBottom: '20px' }}
          />
          <p
            style={{
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              color: '#f59e0b',
              fontSize: '0.78rem',
            }}
          >
            Movie booking dashboard
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 6vw, 5.2rem)',
              lineHeight: 0.96,
              margin: '14px 0 18px',
            }}
          >
            Discover what is playing tonight.
          </h1>
          <p
            style={{
              maxWidth: '58ch',
              color: '#cbd5e1',
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            QuickShow now boots with the project&apos;s real movie assets,
            trailers, and dashboard data instead of the default Vite starter
            files.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
            <a
              href={featuredTrailer.videoUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '14px 20px',
                borderRadius: '999px',
                background: '#f59e0b',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Watch trailer
            </a>
            <a
              href="#featured-shows"
              style={{
                padding: '14px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                color: '#f8fafc',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Browse shows
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '14px',
              marginTop: '28px',
            }}
          >
            <StatCard label="Bookings" value={dummyDashboardData.totalBookings} />
            <StatCard label="Revenue" value={`$${dummyDashboardData.totalRevenue}`} />
            <StatCard label="Active shows" value={dummyDashboardData.activeShows.length} />
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-18px -18px auto auto',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.18)',
              filter: 'blur(10px)',
            }}
          />
          <img
            src={assets.screenImage}
            alt="QuickShow screen preview"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              display: 'block',
              marginLeft: 'auto',
              borderRadius: '28px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
            }}
          />
        </div>
      </section>

      <section id="featured-shows" style={{ maxWidth: '1200px', margin: '36px auto 0' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem' }}>Featured shows</h2>
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {featuredShows.map((show) => (
            <article
              key={show._id}
              style={{
                overflow: 'hidden',
                borderRadius: '20px',
                background: 'rgba(15, 23, 42, 0.82)',
                border: '1px solid rgba(148, 163, 184, 0.14)',
              }}
            >
              <img
                src={show.poster_path}
                alt={show.title}
                style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>{show.title}</h3>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {show.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '18px',
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
      }}
    >
      <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>{value}</div>
      <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>{label}</div>
    </div>
  )
}

export default App
