/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
import {
  convertEquatorialToHorizontal,
  convertHorizontalToStereo,
  type EquatorialCoordinate,
} from '@observerly/astrometry';
import memoize from 'fast-memoize';
import { rgbToHex } from '../common/utils';
import { colorTemperature2rgb } from '../common/colorTemp';
// @ts-expect-error: Bright star catalog file
import starCatalogUrl from '../data/star_catalog.csv?url';
// @ts-expect-error: Constellation catalog file
import constelllations from '../data/constellations.json?url';

interface Observer {
  time: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  skySize: number;
}

interface StarData {
  pos: EquatorialCoordinate;
  /** Visual Magnitude */
  vmag: number;
  /** Milliarcseconds */
  angularDiameter: number;
  /** Color temperature */
  k: number;
}

interface StarProjection {
  hip: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  fillOpacity: number;
  twinkleDuration: number;
}

interface ConstellationIds {
  hip: [string, string][];
}

interface ConstellationData {
  [code: string]: ConstellationIds;
}

interface WorkerInitMessage {
  type: 'init';
  canvas: OffscreenCanvas;
}

interface WorkerUpdateMessage {
  type: 'update';
  time: Date;
  latitude: number;
  longitude: number;
  skySize: number;
  viewSize: { width: number; height: number };
}

type WorkerMessage = WorkerInitMessage | WorkerUpdateMessage;

const clamp = (value: number, min: number = 0, max: number = 1) =>
  Math.min(Math.max(value, min), max);

class Star {
  hip: string;
  pos: EquatorialCoordinate;
  vmag: number;
  angularDiameter: number;
  k: number;
  apparentSizeFactor: number;
  opacity: number;
  color: string;
  project: (observer: Observer) => { x: number; y: number };

  constructor(hip: string, data: StarData) {
    this.hip = hip;
    this.pos = data.pos;
    this.vmag = data.vmag;
    this.angularDiameter = data.angularDiameter;
    this.k = data.k;

    // Apparent star parameters
    // This is bullshit math, but is fine tuned to make the stars look good
    const angularDiamFactor = clamp(this.angularDiameter / (3600000 / 180), 0.0003, 0.0005);
    const magnitudeFactor = clamp(1 - (this.vmag - 1) / 6);
    this.apparentSizeFactor = angularDiamFactor * 10 ** (0.6 * (magnitudeFactor - 0.5)) * 4;

    const colorRgb = colorTemperature2rgb(this.k);
    const whiteOffset = 50;
    const r = Math.min(255, colorRgb.red + whiteOffset);
    const g = Math.min(255, colorRgb.green + whiteOffset);
    const b = Math.min(255, colorRgb.blue + whiteOffset);
    this.color = rgbToHex(r, g, b);
    this.opacity = clamp(magnitudeFactor, 0, 0.8) + 0.2;
    this.project = memoize(this.projectInner.bind(this));
  }

  private projectInner(observer: Observer) {
    const coord = convertEquatorialToHorizontal(observer.time, observer.location, this.pos);
    return convertHorizontalToStereo(coord, {
      width: observer.skySize,
      height: observer.skySize,
    });
  }

  render(observer: Observer): StarProjection {
    const { x, y } = this.project(observer);
    const radius = this.apparentSizeFactor * observer.skySize;
    return {
      hip: this.hip,
      x,
      y,
      radius,
      color: this.color,
      fillOpacity: this.opacity,
      twinkleDuration: 0,
    };
  }
}

type StarDb = Record<string, Star>;

interface ConstellationEdge {
  fromStar: Star;
  toStar: Star;
}

interface ConstellationEdgeProjection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ConstellationProjection {
  edges: ConstellationEdgeProjection[];
}

class Constellation {
  code: string;
  edges: ConstellationEdge[];

  constructor(code: string, stars: StarDb, constellationIds: ConstellationIds) {
    this.code = code;
    this.edges = constellationIds.hip
      .map(([from, to]) => {
        const fromStar = stars[from];
        const toStar = stars[to];
        if (!fromStar || !toStar) return null;
        return { fromStar, toStar };
      })
      .filter((edge) => edge !== null) as unknown as ConstellationEdge[];
  }

  render(observer: Observer): ConstellationProjection {
    return {
      edges: this.edges.map(({ fromStar, toStar }) => {
        const from = fromStar.render(observer);
        const to = toStar.render(observer);
        return {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
        };
      }),
    };
  }
}

type ConstellationDb = Record<string, Constellation>;

const fetchStars = memoize(async (): Promise<StarDb> => {
  const response = await (await fetch(starCatalogUrl)).text();
  const lines = response.split('\n');
  lines.shift();

  const stars: StarDb = {};
  for (const line of lines) {
    if (line.trim().length > 0) {
      const [hip, ra, dec, k, vmag, angularDiameter] = line.split(',');
      stars[hip] = new Star(hip, {
        pos: {
          ra: parseFloat(ra),
          dec: parseFloat(dec),
        },
        vmag: parseFloat(vmag),
        angularDiameter: parseFloat(angularDiameter),
        k: parseFloat(k),
      });
    }
  }
  return stars;
});

const fetchConstellations = memoize(async (stars: StarDb): Promise<ConstellationDb> => {
  const constellationData: ConstellationData = await (await fetch(constelllations)).json();
  const constellations: ConstellationDb = {};
  for (const [code, constellationIds] of Object.entries(constellationData)) {
    constellations[code] = new Constellation(code, stars, constellationIds);
  }
  return constellations;
});

class NightSkyRenderer {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  private pendingUpdate: WorkerUpdateMessage | null = null;
  private sizeHash: string | null = null;

  constructor(message: WorkerInitMessage) {
    this.canvas = message.canvas;
    this.ctx = this.canvas.getContext('2d')!;
  }

  resize(width: number, height: number) {
    const sizeHash = `${width}x${height}`;
    if (this.sizeHash === sizeHash) return;
    this.sizeHash = sizeHash;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  async render() {
    if (!this.pendingUpdate) return;
    const update = this.pendingUpdate;
    this.pendingUpdate = null;

    const { time, latitude, longitude, skySize, viewSize } = update;
    this.resize(viewSize.width, viewSize.height);

    const stars = await fetchStars();
    const constellations = await fetchConstellations(stars);

    const xOffset = viewSize.width / 2;
    const yOffset = viewSize.height / 2;
    const observer: Observer = {
      time,
      location: { latitude, longitude },
      skySize,
    };
    this.ctx.clearRect(0, 0, viewSize.width, viewSize.height);

    Object.values(constellations).forEach((constellation) => {
      const { edges } = constellation.render(observer);
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.2;
      this.ctx.beginPath();
      edges.forEach(({ x1, y1, x2, y2 }) => {
        this.ctx.moveTo(x1 + xOffset, y1 + yOffset);
        this.ctx.lineTo(x2 + xOffset, y2 + yOffset);
      });
      this.ctx.stroke();
    });

    Object.values(stars).forEach((star) => {
      const { x: xHat, y: yHat, radius, color, fillOpacity } = star.render(observer);
      const x = xHat + xOffset;
      const y = yHat + yOffset;

      if (x > viewSize.width || x < 0) return;
      if (y > viewSize.height || y < 0) return;

      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = fillOpacity;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  update(message: WorkerUpdateMessage) {
    const hasPendingUpdate = this.pendingUpdate !== null;
    this.pendingUpdate = message;
    if (!hasPendingUpdate) {
      requestAnimationFrame(() => this.render());
    }
  }
}

let renderer: NightSkyRenderer | null = null;

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'init') {
    renderer = new NightSkyRenderer(event.data);
  } else if (event.data.type === 'update' && renderer) {
    renderer.update(event.data);
  }
});

export {};
