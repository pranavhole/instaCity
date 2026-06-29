"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { emptyFlightKeys, flightKeysFromJoystick, mergeFlightKeys, type FlightKeyState } from "@/lib/flight-controls";
import { useCityStore } from "@/stores/cityStore";

const STICK_RADIUS = 46;

type StickOffset = {
  x: number;
  y: number;
};

function limitStick(dx: number, dy: number): StickOffset {
  const distance = Math.hypot(dx, dy);
  if (distance <= STICK_RADIUS) {
    return { x: dx, y: dy };
  }
  const ratio = STICK_RADIUS / distance;
  return { x: dx * ratio, y: dy * ratio };
}

export function MobileFlightControls() {
  const padRef = useRef<HTMLDivElement>(null);
  const joystickKeys = useRef<FlightKeyState>({ ...emptyFlightKeys });
  const altitudeKeys = useRef<FlightKeyState>({ ...emptyFlightKeys });
  const activePointerId = useRef<number | null>(null);
  const [stick, setStick] = useState<StickOffset>({ x: 0, y: 0 });
  const setMobileKeys = useCityStore((state) => state.setMobileKeys);
  const resetMobileKeys = useCityStore((state) => state.resetMobileKeys);

  const publish = useCallback(() => {
    setMobileKeys(mergeFlightKeys(joystickKeys.current, altitudeKeys.current));
  }, [setMobileKeys]);

  const updateStick = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offset = limitStick(clientX - centerX, clientY - centerY);
      setStick(offset);
      joystickKeys.current = flightKeysFromJoystick({
        x: offset.x / STICK_RADIUS,
        y: offset.y / STICK_RADIUS
      });
      publish();
    },
    [publish]
  );

  const releaseStick = useCallback(() => {
    activePointerId.current = null;
    setStick({ x: 0, y: 0 });
    joystickKeys.current = { ...emptyFlightKeys };
    publish();
  }, [publish]);

  const setAltitude = useCallback(
    (key: "up" | "down", active: boolean) => {
      altitudeKeys.current = {
        ...altitudeKeys.current,
        [key]: active
      };
      publish();
    },
    [publish]
  );

  useEffect(() => resetMobileKeys, [resetMobileKeys]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-5 p-5 md:hidden">
      <div
        ref={padRef}
        className="pointer-events-auto relative h-32 w-32 touch-none select-none rounded-full border border-white/15 bg-brand-panel/70 shadow-glow backdrop-blur"
        onPointerDown={(event) => {
          activePointerId.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateStick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activePointerId.current === event.pointerId) {
            updateStick(event.clientX, event.clientY);
          }
        }}
        onPointerUp={releaseStick}
        onPointerCancel={releaseStick}
        aria-label="Flight joystick"
      >
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-brand-gradient shadow-[0_0_26px_rgba(255,47,135,0.35)]" style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }} />
      </div>
      <div className="pointer-events-auto flex touch-none select-none flex-col gap-3">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-brand-panel/80 text-white shadow-glow backdrop-blur active:bg-signal/80"
          onPointerDown={() => setAltitude("up", true)}
          onPointerUp={() => setAltitude("up", false)}
          onPointerCancel={() => setAltitude("up", false)}
          onPointerLeave={() => setAltitude("up", false)}
          aria-label="Fly up"
        >
          <ChevronUp className="h-7 w-7" />
        </button>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-brand-panel/80 text-white shadow-glow backdrop-blur active:bg-skyline/80"
          onPointerDown={() => setAltitude("down", true)}
          onPointerUp={() => setAltitude("down", false)}
          onPointerCancel={() => setAltitude("down", false)}
          onPointerLeave={() => setAltitude("down", false)}
          aria-label="Fly down"
        >
          <ChevronDown className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
