'use client';

import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';

type Props = {
  /** Called once the first time the child gets 3/4 correct.
   *  You can reset the ability to fire again by pressing "Reset". */
  onComplete?: () => void;
};

type Slot = number | null; // stores tile id or null

export default function DragFractions({ onComplete }: Props) {
  // four slots that make up the fraction bar
  const [slots, setSlots] = useState<Slot[]>([null, null, null, null]);
  // four draggable "1/4" tiles (ids 0..3)
  const [tiles, setTiles] = useState<number[]>([0, 1, 2, 3]);

  // checking state
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);

  // ensure we only call onComplete once per successful attempt
  const [fired, setFired] = useState(false);

  // ----- DnD handlers (HTML5 drag & drop) -----
  const onDragStart = (e: DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
  };

  const onDropToSlot = (slotIndex: number, e: DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(id)) return;

    setSlots(prev => {
      if (prev[slotIndex] !== null) return prev; // already occupied
      const next = [...prev];
      next[slotIndex] = id;
      return next;
    });
    setTiles(prev => prev.filter(t => t !== id));
    setDone(false); // new move invalidates previous check
  };

  const onDropToTray = (e: DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(id)) return;

    // remove from any slot, return to tray
    setSlots(prev => prev.map(v => (v === id ? null : v)));
    setTiles(prev => (prev.includes(id) ? prev : [...prev, id]));
    setDone(false);
  };

  const allowDrop = (e: DragEvent) => e.preventDefault();

  // ----- Actions -----
  const handleReset = () => {
    setSlots([null, null, null, null]);
    setTiles([0, 1, 2, 3]);
    setDone(false);
    setCorrect(false);
    setFired(false); // allow onComplete to fire again
  };

  const handleCheck = () => {
    const filled = slots.filter(s => s !== null).length;
    const isCorrect = filled === 3; // exactly 3 of 4 parts filled
    setDone(true);
    setCorrect(isCorrect);
  };

  // Fire onComplete once when the attempt is checked and correct
  useEffect(() => {
    if (!fired && done && correct) {
      setFired(true);
      onComplete?.();
    }
  }, [done, correct, fired, onComplete]);

  // ----- UI -----
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Build the fraction 3/4</h2>
      <p className="text-sm text-gray-600">
        Drag quarter tiles into the bar until it shows three out of four parts.
      </p>

      {/* Fraction bar with 4 slots */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-3 justify-between mx-auto max-w-3xl">
          {slots.map((val, idx) => (
            <div
              key={idx}
              onDrop={(e) => onDropToSlot(idx, e)}
              onDragOver={allowDrop}
              className="h-16 flex-1 rounded-xl border bg-gray-50 flex items-center justify-center text-sm"
              aria-label={`slot ${idx + 1}`}
            >
              {val !== null ? '1/4' : ''}
            </div>
          ))}
        </div>

        {/* Tray */}
        <div
          className="mt-4 rounded-xl border p-3 bg-white"
          onDrop={onDropToTray}
          onDragOver={allowDrop}
          aria-label="Tiles"
        >
          <div className="text-sm text-gray-600 mb-2">Tiles</div>
          <div className="flex gap-3 flex-wrap">
            {tiles.map((id) => (
              <div
                key={id}
                draggable
                onDragStart={(e) => onDragStart(e, id)}
                className="px-5 py-3 rounded-xl border bg-white shadow-sm cursor-grab active:cursor-grabbing select-none"
              >
                1/4
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="rounded-2xl px-4 py-2 border shadow-sm bg-white hover:bg-gray-50 text-sm"
            onClick={handleCheck}
          >
            Check
          </button>
          {done && (
            <span
              className={`text-sm font-medium ${
                correct ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {correct
                ? 'Great job! That makes 3/4.'
                : `Not yet — you have ${slots.filter(s => s !== null).length}/4. Try again!`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}