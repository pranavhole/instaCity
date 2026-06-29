export type PlaneFlightState = {
  x: number;
  y: number;
  z: number;
  heading: number;
};

export type FlightKeyState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type JoystickVector = {
  x: number;
  y: number;
};

export type FlightFrame = PlaneFlightState & {
  pitch: number;
  roll: number;
};

const CITY_BOUND = 410;
const MIN_ALTITUDE = 8;
const MAX_ALTITUDE = 120;
const LEVEL_PITCH = 0.08;
const CLIMB_PITCH = -0.2;
const DESCEND_PITCH = 0.28;
const MOUSE_ALTITUDE_SCALE = 0.08;
const JOYSTICK_DEAD_ZONE = 0.28;

export const emptyFlightKeys: FlightKeyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function flightKeyForCode(code: string): keyof FlightKeyState | null {
  if (code === "ArrowUp") return "forward";
  if (code === "ArrowDown") return "backward";
  if (code === "KeyA" || code === "ArrowLeft") return "left";
  if (code === "KeyD" || code === "ArrowRight") return "right";
  if (code === "KeyW" || code === "Space" || code === "KeyE") return "up";
  if (code === "KeyS" || code === "ShiftLeft" || code === "ShiftRight" || code === "KeyQ") return "down";
  return null;
}

export function nudgePlaneAltitude(state: PlaneFlightState, mouseMovementY: number): PlaneFlightState {
  return {
    ...state,
    y: clamp(state.y - mouseMovementY * MOUSE_ALTITUDE_SCALE, MIN_ALTITUDE, MAX_ALTITUDE)
  };
}

export function flightKeysFromJoystick(vector: JoystickVector): FlightKeyState {
  return {
    ...emptyFlightKeys,
    forward: vector.y < -JOYSTICK_DEAD_ZONE,
    backward: vector.y > JOYSTICK_DEAD_ZONE,
    left: vector.x < -JOYSTICK_DEAD_ZONE,
    right: vector.x > JOYSTICK_DEAD_ZONE
  };
}

export function mergeFlightKeys(...states: FlightKeyState[]): FlightKeyState {
  return states.reduce<FlightKeyState>(
    (merged, state) => ({
      forward: merged.forward || state.forward,
      backward: merged.backward || state.backward,
      left: merged.left || state.left,
      right: merged.right || state.right,
      up: merged.up || state.up,
      down: merged.down || state.down
    }),
    emptyFlightKeys
  );
}

export function advancePlaneFlight(state: PlaneFlightState, keys: FlightKeyState, delta: number): FlightFrame {
  const turnSpeed = 1.45 * delta;
  const moveSpeed = 46 * delta;
  const verticalSpeed = 32 * delta;
  const verticalIntent = Number(keys.up) - Number(keys.down);
  let heading = state.heading;
  let x = state.x;
  let y = state.y;
  let z = state.z;

  if (keys.left) heading += turnSpeed;
  if (keys.right) heading -= turnSpeed;

  const directionX = Math.sin(heading);
  const directionZ = Math.cos(heading);
  if (keys.forward) {
    x += directionX * moveSpeed;
    z += directionZ * moveSpeed;
  }
  if (keys.backward) {
    x -= directionX * moveSpeed * 0.6;
    z -= directionZ * moveSpeed * 0.6;
  }
  if (verticalIntent !== 0) {
    y += verticalIntent * verticalSpeed;
  }

  return {
    x: clamp(x, -CITY_BOUND, CITY_BOUND),
    y: clamp(y, MIN_ALTITUDE, MAX_ALTITUDE),
    z: clamp(z, -CITY_BOUND, CITY_BOUND),
    heading,
    pitch: verticalIntent > 0 ? CLIMB_PITCH : verticalIntent < 0 ? DESCEND_PITCH : LEVEL_PITCH,
    roll: keys.left ? 0.22 : keys.right ? -0.22 : 0
  };
}
