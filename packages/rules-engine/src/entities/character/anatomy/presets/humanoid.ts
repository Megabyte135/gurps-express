import type { BodyMapInput, BodyMapPoint, BodyMapZoneInput } from "../body-map.js";
import type { HitLocationInput } from "../hit-location.js";
import type { AnatomyBlueprint } from "../anatomy.js";

/**
 * Canonical humanoid anatomy (GURPS 4e, B556) with a body map drawn on a
 * 1000x2000 canvas: a standing frontal figure. Eye and groin are aimed-only
 * locations with empty `hitOn`; hand and foot each cover two mirrored zones.
 */

const HIT_LOCATIONS: readonly HitLocationInput[] = [
  {
    id: "skull",
    catalogKey: "hit-location.skull",
    name: "Skull",
    description: "The head behind the face; extra damage from bruisers and crushing is reduced.",
    hitOn: [3, 4],
  },
  {
    id: "face",
    catalogKey: "hit-location.face",
    name: "Face",
    description: "The front of the head; knockdown checks apply on major wounds.",
    hitOn: [5],
  },
  {
    id: "eye",
    catalogKey: "hit-location.eye",
    name: "Eye",
    description: "Aimed-only location (-9 to hit); blinding and special wounding rules apply.",
    hitOn: [],
  },
  {
    id: "neck",
    catalogKey: "hit-location.neck",
    name: "Neck",
    description: "Vulnerable to crushing and cutting; targeted at -5.",
    hitOn: [17, 18],
  },
  {
    id: "torso",
    catalogKey: "hit-location.torso",
    name: "Torso",
    description: "Chest and abdomen; the default target with no to-hit penalty.",
    hitOn: [9, 10],
  },
  {
    id: "vitals",
    catalogKey: "hit-location.vitals",
    name: "Vitals",
    description: "Heart and vital organs; wounding modifiers are doubled. Aimed at -3.",
    hitOn: [11],
  },
  {
    id: "groin",
    catalogKey: "hit-location.groin",
    name: "Groin",
    description: "Aimed at -3; human males suffer double knockdown from crushing.",
    hitOn: [],
  },
  {
    id: "arm-right",
    catalogKey: "hit-location.arm",
    name: "Right Arm",
    description: "Crippled at half HP from basic damage; targeted at -2.",
    hitOn: [8],
  },
  {
    id: "arm-left",
    catalogKey: "hit-location.arm",
    name: "Left Arm",
    description: "Crippled at half HP from basic damage; targeted at -2.",
    hitOn: [12],
  },
  {
    id: "hand",
    catalogKey: "hit-location.hand",
    name: "Hand",
    description: "Either hand; crippled at 1/3 HP from basic damage. Targeted at -4.",
    hitOn: [15],
  },
  {
    id: "leg-right",
    catalogKey: "hit-location.leg",
    name: "Right Leg",
    description: "Crippled at half HP from basic damage; targeted at -2.",
    hitOn: [6, 7],
  },
  {
    id: "leg-left",
    catalogKey: "hit-location.leg",
    name: "Left Leg",
    description: "Crippled at half HP from basic damage; targeted at -2.",
    hitOn: [13, 14],
  },
  {
    id: "foot",
    catalogKey: "hit-location.foot",
    name: "Foot",
    description: "Either foot; crippled at 1/3 HP from basic damage. Targeted at -4.",
    hitOn: [16],
  },
];

const point = (x: number, y: number): BodyMapPoint => ({ x, y });

const rect = (x1: number, y1: number, x2: number, y2: number): BodyMapPoint[] => [
  point(x1, y1),
  point(x2, y1),
  point(x2, y2),
  point(x1, y2),
];

const zone = (
  id: string,
  hitLocationId: string,
  polygon: readonly BodyMapPoint[],
  label: string | null = null,
): BodyMapZoneInput => ({ id, hitLocationId, label, polygon, subzones: [] });

const ZONES: readonly BodyMapZoneInput[] = [
  zone("zone-skull", "skull", [
    point(400, 12),
    point(600, 12),
    point(648, 152),
    point(500, 190),
    point(352, 152),
  ]),
  zone("zone-face", "face", [
    point(412, 152),
    point(588, 152),
    point(596, 208),
    point(500, 250),
    point(404, 208),
  ]),
  zone("zone-eye", "eye", rect(440, 160, 560, 185), "Eyes"),
  zone("zone-neck", "neck", rect(448, 252, 552, 315)),
  zone("zone-torso", "torso", [
    point(335, 320),
    point(665, 320),
    point(660, 560),
    point(655, 880),
    point(345, 880),
    point(340, 560),
  ]),
  zone("zone-vitals", "vitals", rect(445, 560, 555, 705)),
  zone("zone-groin", "groin", rect(450, 882, 550, 965)),
  zone("zone-arm-right", "arm-right", [
    point(215, 340),
    point(320, 340),
    point(325, 955),
    point(210, 955),
  ]),
  zone("zone-hand-right", "hand", [
    point(212, 958),
    point(323, 958),
    point(330, 1090),
    point(205, 1090),
  ]),
  zone("zone-arm-left", "arm-left", [
    point(680, 340),
    point(785, 340),
    point(790, 955),
    point(675, 955),
  ]),
  zone("zone-hand-left", "hand", [
    point(677, 958),
    point(788, 958),
    point(795, 1090),
    point(670, 1090),
  ]),
  zone("zone-leg-right", "leg-right", [
    point(335, 895),
    point(480, 895),
    point(478, 1835),
    point(337, 1835),
  ]),
  zone("zone-foot-right", "foot", [
    point(330, 1838),
    point(483, 1838),
    point(500, 1990),
    point(315, 1990),
  ]),
  zone("zone-leg-left", "leg-left", [
    point(520, 895),
    point(665, 895),
    point(663, 1835),
    point(522, 1835),
  ]),
  zone("zone-foot-left", "foot", [
    point(517, 1838),
    point(670, 1838),
    point(687, 1990),
    point(502, 1990),
  ]),
];

export const humanoidBlueprint: AnatomyBlueprint = {
  id: "anatomy-humanoid",
  catalogKey: "anatomy.humanoid",
  name: "Humanoid",
  description:
    "Standard humanoid hit location table (B556) with a frontal standing body map.",
  hitLocations: HIT_LOCATIONS,
  bodyMap: {
    id: "body-map-humanoid",
    catalogKey: "body-map.humanoid",
    name: "Humanoid body map",
    description: "Standing frontal figure on a 1000x2000 canvas.",
    canvas: { width: 1000, height: 2000, imageUrl: null },
    zones: ZONES,
  },
};
