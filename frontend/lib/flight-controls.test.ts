import { describe, expect, it } from "vitest";

import { advancePlaneFlight, flightKeyForCode, type FlightKeyState, type PlaneFlightState } from "./flight-controls";

const idleKeys: FlightKeyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

const start: PlaneFlightState = {
  x: 0,
  y: 18,
  z: 90,
  heading: Math.PI
};

describe("flight controls", () => {
  it("maps dedicated and alternate keys to vertical flight controls", () => {
    expect(flightKeyForCode("Space")).toBe("up");
    expect(flightKeyForCode("KeyE")).toBe("up");
    expect(flightKeyForCode("ArrowUp")).toBe("up");
    expect(flightKeyForCode("ShiftLeft")).toBe("down");
    expect(flightKeyForCode("ShiftRight")).toBe("down");
    expect(flightKeyForCode("KeyQ")).toBe("down");
    expect(flightKeyForCode("ArrowDown")).toBe("down");
  });

  it("moves the plane up and down with visible pitch feedback", () => {
    const climb = advancePlaneFlight(start, { ...idleKeys, up: true }, 1);
    const descend = advancePlaneFlight(start, { ...idleKeys, down: true }, 1);
    const level = advancePlaneFlight(start, idleKeys, 1);

    expect(climb.y).toBeGreaterThan(start.y);
    expect(descend.y).toBeLessThan(start.y);
    expect(climb.pitch).toBeLessThan(level.pitch);
    expect(descend.pitch).toBeGreaterThan(level.pitch);
  });

  it("keeps altitude inside the city flight envelope", () => {
    const climb = advancePlaneFlight({ ...start, y: 119 }, { ...idleKeys, up: true }, 1);
    const descend = advancePlaneFlight({ ...start, y: 9 }, { ...idleKeys, down: true }, 1);

    expect(climb.y).toBe(120);
    expect(descend.y).toBe(8);
  });
});
