import { describe, expect, it } from "vitest";

import {
  advancePlaneFlight,
  flightKeyForCode,
  flightKeysFromJoystick,
  mergeFlightKeys,
  nudgePlaneAltitude,
  type FlightKeyState,
  type PlaneFlightState
} from "./flight-controls";

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
  it("maps W and S to altitude while arrow up and down move forward and backward", () => {
    expect(flightKeyForCode("KeyW")).toBe("up");
    expect(flightKeyForCode("KeyS")).toBe("down");
    expect(flightKeyForCode("ArrowUp")).toBe("forward");
    expect(flightKeyForCode("ArrowDown")).toBe("backward");
  });

  it("keeps alternate keys for vertical and turn controls", () => {
    expect(flightKeyForCode("Space")).toBe("up");
    expect(flightKeyForCode("KeyE")).toBe("up");
    expect(flightKeyForCode("ShiftLeft")).toBe("down");
    expect(flightKeyForCode("ShiftRight")).toBe("down");
    expect(flightKeyForCode("KeyQ")).toBe("down");
    expect(flightKeyForCode("KeyA")).toBe("left");
    expect(flightKeyForCode("ArrowLeft")).toBe("left");
    expect(flightKeyForCode("KeyD")).toBe("right");
    expect(flightKeyForCode("ArrowRight")).toBe("right");
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

  it("nudges altitude from mouse vertical movement", () => {
    const mouseUp = nudgePlaneAltitude(start, -40);
    const mouseDown = nudgePlaneAltitude(start, 40);

    expect(mouseUp.y).toBeGreaterThan(start.y);
    expect(mouseDown.y).toBeLessThan(start.y);
  });

  it("maps a mobile joystick vector to flight keys with a dead zone", () => {
    expect(flightKeysFromJoystick({ x: 0, y: 0 })).toEqual(idleKeys);
    expect(flightKeysFromJoystick({ x: 0, y: -0.8 })).toEqual({ ...idleKeys, forward: true });
    expect(flightKeysFromJoystick({ x: 0, y: 0.8 })).toEqual({ ...idleKeys, backward: true });
    expect(flightKeysFromJoystick({ x: -0.8, y: 0 })).toEqual({ ...idleKeys, left: true });
    expect(flightKeysFromJoystick({ x: 0.8, y: 0 })).toEqual({ ...idleKeys, right: true });
  });

  it("merges keyboard and mobile key state so either input can fly the plane", () => {
    const merged = mergeFlightKeys({ ...idleKeys, forward: true, left: true }, { ...idleKeys, up: true });

    expect(merged).toEqual({ ...idleKeys, forward: true, left: true, up: true });
  });
});
