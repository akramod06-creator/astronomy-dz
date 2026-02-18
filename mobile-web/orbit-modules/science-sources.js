// Curated mission/source links for each target.

export const SCIENCE_GLOBAL_SOURCES = [
    { label: "NASA Planetary Fact Sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/" },
    { label: "NASA Solar System Exploration", url: "https://solarsystem.nasa.gov/" },
    { label: "ESA Science & Exploration", url: "https://www.esa.int/Science_Exploration" },
    { label: "USGS Astrogeology", url: "https://www.usgs.gov/centers/astrogeology-science-center" },
    { label: "JPL SSD Orbits", url: "https://ssd.jpl.nasa.gov/" }
  ];

export const SCIENCE_BY_ID = {
    sun: [
      { label: "NASA Solar Dynamics Observatory", url: "https://sdo.gsfc.nasa.gov/" }
    ],
    mercury: [
      { label: "MESSENGER Mission", url: "https://www.nasa.gov/mission_pages/messenger/main/index.html" }
    ],
    venus: [
      { label: "Magellan / Venus Data", url: "https://pds-geosciences.wustl.edu/missions/magellan/" }
    ],
    earth: [
      { label: "NASA Earth Observatory", url: "https://earthobservatory.nasa.gov/" }
    ],
    mars: [
      { label: "Mars Perseverance", url: "https://mars.nasa.gov/mars2020/" },
      { label: "InSight Mars Data", url: "https://mars.nasa.gov/insight/" }
    ],
    jupiter: [
      { label: "Juno Mission", url: "https://www.nasa.gov/mission_pages/juno/main/index.html" }
    ],
    saturn: [
      { label: "Cassini Archive", url: "https://solarsystem.nasa.gov/missions/cassini/overview/" }
    ],
    uranus: [
      { label: "Voyager Uranus", url: "https://voyager.jpl.nasa.gov/mission/science/uranus/" }
    ],
    neptune: [
      { label: "Voyager Neptune", url: "https://voyager.jpl.nasa.gov/mission/science/neptune/" }
    ],
    pluto: [
      { label: "New Horizons Pluto", url: "https://pluto.jhuapl.edu/" }
    ],
    moon: [
      { label: "LRO Mission", url: "https://www.nasa.gov/mission_pages/LRO/main/index.html" }
    ],
    europa: [
      { label: "Europa Clipper", url: "https://europa.nasa.gov/" }
    ],
    titan: [
      { label: "Dragonfly Mission", url: "https://dragonfly.jhuapl.edu/" }
    ],
    triton: [
      { label: "NASA Triton Overview", url: "https://solarsystem.nasa.gov/moons/neptune-moons/triton/overview/" }
    ],
    halley: [
      { label: "ESA Giotto / Halley", url: "https://www.esa.int/Science_Exploration/Space_Science/Giotto_overview" }
    ]
  };

export const getScienceSourcesForId = (id) => ([
  ...(SCIENCE_BY_ID[id] || []),
  ...SCIENCE_GLOBAL_SOURCES
]).slice(0, 5);

