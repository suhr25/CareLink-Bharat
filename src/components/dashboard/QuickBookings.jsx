import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Train, Plane, Film, Pill,
  ExternalLink, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GalaxyBackground from '../three/GalaxyBackground';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

// ─── Booking data ──────────────────────────────────────────────────────────────
// To add a new category: push a new object to CATEGORIES with id/label/Icon/color/colorRgb/platforms.
// To add a platform: push to the relevant category's platforms array.
const CATEGORIES = [
  {
    id: 'train',
    label: 'Train Tickets',
    Icon: Train,
    color: '#3B82F6',
    colorRgb: '59,130,246',
    platforms: [
      {
        id: 'irctc',
        name: 'IRCTC Official',
        desc: "India's official railway booking portal",
        url: 'https://www.irctc.co.in/nget/train-search',
        popular: true,
      },
      {
        id: 'mmt-rail',
        name: 'MakeMyTrip Railways',
        desc: 'Book train tickets easily',
        url: 'https://www.makemytrip.com/railways/',
      },
      {
        id: 'emt-rail',
        name: 'EaseMyTrip Railways',
        desc: 'Affordable train bookings',
        url: 'https://www.easemytrip.com/railways/',
      },
      {
        id: 'goibibo-train',
        name: 'Goibibo Trains',
        desc: 'Quick train reservations',
        url: 'https://www.goibibo.com/trains/',
      },
    ],
  },
  {
    id: 'movie',
    label: 'Movie Booking',
    Icon: Film,
    color: '#EF4444',
    colorRgb: '239,68,68',
    platforms: [
      {
        id: 'bookmyshow',
        name: 'BookMyShow Indore',
        desc: 'Movies, events & more in Indore',
        url: 'https://in.bookmyshow.com/explore/home/indore',
        popular: true,
      },
      {
        id: 'district',
        name: 'District',
        desc: 'Premium entertainment experiences',
        url: 'https://www.district.in/',
      },
      {
        id: 'pvr',
        name: 'PVR Cinemas',
        desc: 'Book PVR movie tickets online',
        url: 'https://www.pvrcinemas.com/',
      },
    ],
  },
  {
    id: 'flight',
    label: 'Flight Tickets',
    Icon: Plane,
    color: '#56C8D8',
    colorRgb: '86,200,216',
    platforms: [
      {
        id: 'mmt-flight',
        name: 'MakeMyTrip',
        desc: 'Flights, hotels & holiday packages',
        url: 'https://www.makemytrip.com/',
      },
      {
        id: 'goibibo-flight',
        name: 'Goibibo Flights',
        desc: 'Cheap flights & exclusive deals',
        url: 'https://www.goibibo.com/',
      },
      {
        id: 'emt-flight',
        name: 'EaseMyTrip',
        desc: 'Lowest airfare guaranteed',
        url: 'https://www.easemytrip.com/',
      },
      {
        id: 'cleartrip',
        name: 'Cleartrip',
        desc: 'Simple & fast flight booking',
        url: 'https://www.cleartrip.com/flights',
      },
    ],
  },
  {
    id: 'medicine',
    label: 'Medicines',
    Icon: Pill,
    color: '#34D399',
    colorRgb: '52,211,153',
    platforms: [
      {
        id: 'pharmeasy',
        name: 'PharmEasy',
        desc: 'Order medicines & health products',
        url: 'https://pharmeasy.in/',
      },
      {
        id: '1mg',
        name: '1mg Labs',
        desc: 'Book lab tests & medicines',
        url: 'https://www.1mg.com/labs',
      },
      {
        id: 'netmeds',
        name: 'Netmeds',
        desc: 'Online pharmacy & wellness',
        url: 'https://www.netmeds.com/',
      },
    ],
  },
];

// Flat lookup map for resolving saved platform details (used by Favorites tab)
const PLATFORM_MAP = Object.fromEntries(
  CATEGORIES.flatMap(cat => cat.platforms.map(p => [p.id, { ...p, cat }]))
);

const TABS = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label })),
  { id: 'favorites', label: 'Saved' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuickBookings({ onLogout }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qb-favorites') || '[]'); }
    catch { return []; }
  });

  const toggleFav = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('qb-favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (activeTab === 'favorites') {
      const favPlatforms = favorites
        .map(id => PLATFORM_MAP[id])
        .filter(Boolean)
        .filter(p => !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      return [{
        id: 'favorites',
        label: 'My Saved Platforms',
        Icon: Star,
        color: '#F0A050',
        colorRgb: '240,160,80',
        platforms: favPlatforms,
      }];
    }

    return CATEGORIES.map(cat => ({
      ...cat,
      platforms: cat.platforms.filter(p =>
        (activeTab === 'all' || activeTab === cat.id) &&
        (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q))
      ),
    })).filter(cat => cat.platforms.length > 0);
  }, [search, activeTab, favorites]);

  const noResults = filtered.length === 0 || (activeTab === 'favorites' && favorites.length === 0 && !search);
  const noFavSearch = activeTab === 'favorites' && favorites.length === 0;

  return (
    <>
      <GalaxyBackground />
      <div className="app-layout">
        <Navbar
          user={user}
          lang="en-IN"
          onToggleLang={() => {}}
          onOpenHistory={() => {}}
          onLogout={onLogout}
          onBack={() => navigate('/dashboard')}
        />

        <main className="qb-main">
          {/* Page header */}
          <motion.div
            className="qb-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="qb-title">
              Quick <span className="primary">Bookings</span>
            </h1>
            <p className="qb-subtitle">Your shortcut to the most-used booking platforms</p>
          </motion.div>

          {/* Search + category tabs */}
          <motion.div
            className="qb-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="qb-search-wrap" role="search">
              <Search size={15} className="qb-search-icon" aria-hidden="true" />
              <input
                className="qb-search"
                type="search"
                placeholder="Search platforms…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search booking platforms"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    className="qb-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <nav className="qb-tabs" role="tablist" aria-label="Filter by category">
              {TABS.map(tab => (
                <motion.button
                  key={tab.id}
                  className={`qb-tab${activeTab === tab.id ? ' active' : ''}${tab.id === 'favorites' ? ' qb-tab--fav' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {tab.id === 'favorites' && <Star size={11} aria-hidden="true" />}
                  {tab.label}
                  {tab.id === 'favorites' && favorites.length > 0 && (
                    <span className="qb-tab-count">{favorites.length}</span>
                  )}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Results area */}
          <AnimatePresence mode="wait">
            {noFavSearch ? (
              <motion.div
                key="fav-empty"
                className="qb-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Star size={38} strokeWidth={1.5} />
                <p>No saved platforms yet</p>
                <span>Click ★ on any card to save it here</span>
              </motion.div>
            ) : noResults ? (
              <motion.div
                key="search-empty"
                className="qb-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Search size={38} strokeWidth={1.5} />
                <p>No results for "{search}"</p>
                <span>Try a different search term</span>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filtered.map((cat, catIdx) => (
                  <motion.section
                    key={cat.id}
                    className="qb-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: catIdx * 0.07 }}
                    aria-labelledby={`qb-cat-${cat.id}`}
                  >
                    <div className="qb-section-header">
                      <div
                        className="qb-section-icon"
                        style={{ background: `rgba(${cat.colorRgb},0.12)`, color: cat.color }}
                        aria-hidden="true"
                      >
                        <cat.Icon size={18} />
                      </div>
                      <h2 id={`qb-cat-${cat.id}`} className="qb-section-title" style={{ color: cat.color }}>
                        {cat.label}
                      </h2>
                      <span className="qb-section-count" aria-label={`${cat.platforms.length} platforms`}>
                        {cat.platforms.length}
                      </span>
                    </div>

                    <div className="qb-grid">
                      {cat.platforms.map((platform, pIdx) => {
                        // Favorites tab platforms carry their original category info
                        const CardIcon = platform.cat?.Icon || cat.Icon;
                        const cardColor = platform.cat?.color || cat.color;
                        const cardRgb = platform.cat?.colorRgb || cat.colorRgb;
                        const isFav = favorites.includes(platform.id);

                        return (
                          <motion.div
                            key={platform.id}
                            className="qb-card"
                            style={{ '--c': cardColor, '--rgb': cardRgb }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: catIdx * 0.07 + pIdx * 0.04 }}
                            whileHover={{ y: -4, transition: { duration: 0.18 } }}
                          >
                            {platform.popular && (
                              <span className="qb-badge" aria-label="Popular platform">
                                Popular
                              </span>
                            )}

                            <button
                              className={`qb-fav-btn${isFav ? ' active' : ''}`}
                              onClick={() => toggleFav(platform.id)}
                              aria-label={isFav ? `Remove ${platform.name} from saved` : `Save ${platform.name}`}
                              aria-pressed={isFav}
                            >
                              <Star size={12} />
                            </button>

                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="qb-card-link"
                              aria-label={`Open ${platform.name} — ${platform.desc}`}
                            >
                              <div
                                className="qb-card-icon-wrap"
                                style={{ background: `rgba(${cardRgb},0.10)`, color: cardColor }}
                                aria-hidden="true"
                              >
                                <CardIcon size={20} />
                              </div>
                              <div className="qb-card-body">
                                <span className="qb-card-name">{platform.name}</span>
                                <span className="qb-card-desc">{platform.desc}</span>
                              </div>
                              <ExternalLink size={13} className="qb-card-arrow" aria-hidden="true" />
                            </a>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
