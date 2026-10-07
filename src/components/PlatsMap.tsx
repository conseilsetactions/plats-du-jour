import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location, Plat } from '@/types';
import { formatPrice } from '@/utils/format';

interface PlatsMapProps {
  plats: Plat[];
  /** Centre de la recherche (position GPS ou centre du quartier). */
  center: Location;
  /** Position GPS réelle, affichée par un point (absente sans GPS). */
  userLocation: Location | null;
  activeRestaurantId: string | null;
  onSelectRestaurant: (id: string | null) => void;
  onOpenPlat: (plat: Plat) => void;
}

interface Group {
  id: string;
  name: string;
  location: Location;
  plats: Plat[];
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Étiquette du repère : le prix le plus bas de l'établissement. */
const pinIcon = (group: Group, active: boolean) => {
  const min = Math.min(...group.plats.map((p) => p.price));
  const label = group.plats.length > 1 ? `dès ${formatPrice(min)}` : formatPrice(min);
  return L.divIcon({
    className: 'pdj-pin-anchor',
    html: `<span class="pdj-pin${active ? ' is-active' : ''}">${escapeHtml(label)}</span>`,
    iconSize: [0, 0],
  });
};

/**
 * Version C (ordinateur) : plan OpenStreetMap avec un repère par établissement.
 * Survoler une ligne de la liste met son repère en avant ; cliquer un repère ouvre ses plats.
 */
export default function PlatsMap({
  plats,
  center,
  userLocation,
  activeRestaurantId,
  onSelectRestaurant,
  onOpenPlat,
}: PlatsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; group: Group }>());
  // Rappels toujours à jour sans recréer les repères
  const callbacks = useRef({ onSelectRestaurant, onOpenPlat });
  callbacks.current = { onSelectRestaurant, onOpenPlat };

  const groups = useMemo(() => {
    const byId = new Map<string, Group>();
    for (const plat of plats) {
      const { id, name, location } = plat.restaurant;
      const group = byId.get(id) ?? { id, name, location, plats: [] };
      group.plats.push(plat);
      byId.set(id, group);
    }
    return [...byId.values()];
  }, [plats]);

  // Création de la carte (une seule fois)
  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([center.latitude, center.longitude], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.on('click', () => callbacks.current.onSelectRestaurant(null));
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Repères des établissements et position de l'utilisateur
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();

    for (const group of groups) {
      const marker = L.marker([group.location.latitude, group.location.longitude], {
        icon: pinIcon(group, group.id === activeRestaurantId),
        title: group.name,
        riseOnHover: true,
      });

      // Bulle : nom de l'établissement et ses plats (clic = fiche du plat)
      const popup = document.createElement('div');
      popup.className = 'pdj-popup';
      const title = document.createElement('p');
      title.className = 'pdj-popup-title';
      title.textContent = group.name;
      popup.appendChild(title);
      for (const plat of group.plats) {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'pdj-popup-row';
        row.innerHTML = `<span>${escapeHtml(plat.name)}</span><strong>${escapeHtml(formatPrice(plat.price))}</strong>`;
        row.addEventListener('click', () => callbacks.current.onOpenPlat(plat));
        popup.appendChild(row);
      }
      marker.bindPopup(popup, { offset: [0, -26], closeButton: false });
      marker.on('click', () => callbacks.current.onSelectRestaurant(group.id));
      marker.addTo(layer);
      markersRef.current.set(group.id, { marker, group });
    }

    if (userLocation) {
      L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 7,
        color: '#ffffff',
        weight: 3,
        fillColor: '#1a1a1a',
        fillOpacity: 1,
      })
        .bindTooltip('Vous êtes ici', { direction: 'top', offset: [0, -6] })
        .addTo(layer);
    }

    // Cadrage : tous les établissements (et la position de l'utilisateur)
    const points: L.LatLngExpression[] = groups.map((g) => [g.location.latitude, g.location.longitude]);
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 17 });
    else map.setView(points[0] ?? [center.latitude, center.longitude], 16);
    // Les repères sont recréés quand la liste change ; la mise en avant est gérée plus bas
  }, [groups, userLocation?.latitude, userLocation?.longitude, center.latitude, center.longitude]);

  // Mise en avant du repère survolé ou choisi
  useEffect(() => {
    markersRef.current.forEach(({ marker, group }) => {
      const active = group.id === activeRestaurantId;
      marker.setIcon(pinIcon(group, active));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
  }, [activeRestaurantId, groups]);

  return (
    // `isolate` : la carte reste sous l'en-tête quand on fait défiler la page
    <div ref={containerRef} className="isolate h-full w-full" aria-label="Plan des établissements" role="region" />
  );
}
