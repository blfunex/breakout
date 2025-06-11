import WebFont from "webfontloader";
import { songs } from "./songs";

WebFont.load({
  google: {
    families: ["Press Start 2P"],
  },
});

const isAutoPlay = location.search.includes("auto");

// --- CONSTANTS ---
const WIDTH = 600;
const HEIGHT = 800;
const BALL_SPEED = 600;
const BALL_RADIUS = 8;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_LEVEL_UP_OFFSET = 30;
const MAX_LIVES = 5;
const START_LEVEL = 1;
const BRICK_SCORE_BONUS = 20;
const PADDLE_SCORE_BONUS = 5;
let BRICK_PER_ROW = 10;
let BRICK_ROW_COUNT = 6;
const BRICK_PADDING_X = BALL_RADIUS * 2;
const BRICK_PADDING_Y = 10;
const BRICK_HEIGHT = 20;
const BRICK_OFFSET = 150;

// --- CANVAS & CONTEXT ---
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d", { alpha: false })!;

// --- TYPE DEFINITIONS ---
type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
type NoteOctave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type NoteNotation =
  | `${NoteLetter}${NoteOctave}`
  | `${NoteLetter}b${NoteOctave}`
  | `${NoteLetter}#${NoteOctave}`;

type SongNoteNotation = NoteNotation | `${InstrumentName} ${NoteNotation}`;

export interface SongData {
  instrument: InstrumentName;
  notes: SongNoteNotation[];
  bpm?: number;
}

type OscSettings = {
  type: OscillatorType;
  gain: number;
  detune: number;
  coarse: number;
};

type Instrument = {
  oscillators: OscSettings[];
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  isRhythmic?: boolean;
};

// prettier-ignore
const instruments = {
  // --- Original & Tweaked Instruments ---
  chiptune_square:   { oscillators: [{ type: "square", gain: 0.6, detune: 0, coarse: 0 }, { type: "square", gain: 0.4, detune: 0, coarse: 12 }, { type: "square", gain: 0.2, detune: 4, coarse: 0 }], envelope: { attack: 0.005, decay: 0.1, sustain: 0.7, release: 0.15 } },
  chiptune_triangle: { oscillators: [{ type: "triangle", gain: 0.8, detune: 0, coarse: 0 }, { type: "sine", gain: 0.2, detune: 0, coarse: 12 }], envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.25 } },
  soft_synth:        { oscillators: [{ type: "sine", gain: 0.7, detune: -3, coarse: 0 }, { type: "sine", gain: 0.7, detune: 3, coarse: 0 }, { type: "triangle", gain: 0.2, detune: 0, coarse: 12 }], envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.4 } },
  epic_synth:        { oscillators: [{ type: "sawtooth", gain: 0.6, detune: 0, coarse: 0 }, { type: "sawtooth", gain: 0.4, detune: 8, coarse: 0 }, { type: "sine", gain: 0.3, detune: 0, coarse: -12 }], envelope: { attack: 0.08, decay: 0.2, sustain: 0.6, release: 0.4 } },
  distorted_lead:    { oscillators: [{ type: "sawtooth", gain: 0.6, detune: 0, coarse: 0 }, { type: "sawtooth", gain: 0.5, detune: 10, coarse: 0 }, { type: "square", gain: 0.2, detune: 0, coarse: -12 }], envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 } },
  music_box:         { oscillators: [{ type: "triangle", gain: 0.6, detune: 0, coarse: 0 }, { type: "sine", gain: 0.4, detune: 0, coarse: 12 }, { type: "triangle", gain: 0.3, detune: 5, coarse: 24 }], envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.4 } },
  plucked_bass:      { oscillators: [{ type: "triangle", gain: 1.0, detune: 0, coarse: 0 }, { type: "sine", gain: 0.2, detune: 0, coarse: -12 }], envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 } },
  synth_bass_80s:    { oscillators: [{ type: "sawtooth", gain: 0.8, detune: 0, coarse: -12 }, { type: "square", gain: 0.4, detune: 3, coarse: -12 }, { type: "sine", gain: 1.0, detune: 0, coarse: -24 }], envelope: { attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.2 } },
  clean_guitar:      { oscillators: [{ type: "triangle", gain: 0.7, detune: -4, coarse: 0 }, { type: "triangle", gain: 0.7, detune: 4, coarse: 0 }, { type: "sine", gain: 0.2, detune: 0, coarse: 7 }], envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.2 } },

  // --- NEW: Synth Leads ---
  lead_80s_hero:     { oscillators: [{ type: "sawtooth", gain: 0.5, detune: -5, coarse: 0 }, { type: "sawtooth", gain: 0.5, detune: 5, coarse: 0 }, { type: "square", gain: 0.2, detune: 0, coarse: -12 }], envelope: { attack: 0.02, decay: 0.2, sustain: 0.8, release: 0.3 } },
  lead_acid:         { oscillators: [{ type: "sawtooth", gain: 1.0, detune: 0, coarse: 0 }, { type: "square", gain: 0.2, detune: 20, coarse: -12 }], envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.15 } },
  lead_hollow:       { oscillators: [{ type: "square", gain: 0.6, detune: -4, coarse: 0 }, { type: "square", gain: 0.6, detune: 4, coarse: 0 }, { type: "sine", gain: 0.2, detune: 0, coarse: 12 }], envelope: { attack: 0.03, decay: 0.2, sustain: 0.7, release: 0.2 } },
  lead_vibrato:      { oscillators: [{ type: "triangle", gain: 0.8, detune: -12, coarse: 0 }, { type: "triangle", gain: 0.8, detune: 12, coarse: 0 }], envelope: { attack: 0.1, decay: 0.15, sustain: 0.8, release: 0.2 } },
  lead_soft_whistle: { oscillators: [{ type: "sine", gain: 1.0, detune: 0, coarse: 0 }, { type: "sine", gain: 0.1, detune: 0, coarse: 24 }], envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 } },

  // --- NEW: Synth Basses ---
  bass_sub_sine:     { oscillators: [{ type: "sine", gain: 1.0, detune: 0, coarse: -24 }], envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2 } },
  bass_funky_saw:    { oscillators: [{ type: "sawtooth", gain: 0.8, detune: 0, coarse: -12 }], envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.15 } },
  bass_wobble_growl: { oscillators: [{ type: "sawtooth", gain: 0.7, detune: -25, coarse: -12 }, { type: "sawtooth", gain: 0.7, detune: 25, coarse: -12 }], envelope: { attack: 0.02, decay: 0.2, sustain: 0.8, release: 0.3 } },
  bass_deep_square:  { oscillators: [{ type: "square", gain: 0.9, detune: 0, coarse: -12 }, { type: "square", gain: 0.5, detune: 2, coarse: -24 }], envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2 } },
  bass_resonant:     { oscillators: [{ type: "triangle", gain: 1, detune: 0, coarse: -12 }, { type: "sine", gain: 0.5, detune: 0, coarse: -5 }], envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 } },

  // --- NEW: Pads & Atmospheres ---
  pad_warm_analog:   { oscillators: [{ type: "triangle", gain: 0.6, detune: -4, coarse: 0 }, { type: "triangle", gain: 0.6, detune: 4, coarse: 0 }, { type: "sine", gain: 0.3, detune: 0, coarse: -12 }], envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.5 } },
  pad_shimmer:       { oscillators: [{ type: "triangle", gain: 0.7, detune: 0, coarse: 0 }, { type: "sine", gain: 0.3, detune: 5, coarse: 12 }, { type: "sine", gain: 0.2, detune: -5, coarse: 24 }], envelope: { attack: 0.4, decay: 0.3, sustain: 0.9, release: 1.2 } },
  pad_dark_drone:    { oscillators: [{ type: "sawtooth", gain: 0.4, detune: 10, coarse: -12 }, { type: "triangle", gain: 0.6, detune: 0, coarse: 0 }, { type: "sine", gain: 0.4, detune: 0, coarse: -24 }], envelope: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 2.5 } },
  pad_celestial:     { oscillators: [{ type: "sine", gain: 0.5, detune: -7, coarse: 0 }, { type: "sine", gain: 0.5, detune: 7, coarse: 0 }, { type: "triangle", gain: 0.3, detune: 0, coarse: 19 }], envelope: { attack: 1.2, decay: 0.8, sustain: 0.7, release: 2.0 } },
  pad_sci_fi:        { oscillators: [{ type: "sawtooth", gain: 0.6, detune: 15, coarse: 0 }, { type: "sawtooth", gain: 0.6, detune: -15, coarse: -12 }], envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.8 } },

  // --- NEW: Keys & Plucked Sounds ---
  keys_electric_piano:{ oscillators: [{ type: "sine", gain: 0.8, detune: 0, coarse: 0 }, { type: "triangle", gain: 0.4, detune: 2, coarse: 12 }, { type: "sine", gain: 0.2, detune: 0, coarse: 24 }], envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.3 } },
  keys_harpsichord:  { oscillators: [{ type: "sawtooth", gain: 0.3, detune: 0, coarse: 0 }, { type: "square", gain: 0.5, detune: 5, coarse: 12 }], envelope: { attack: 0.001, decay: 0.15, sustain: 0.05, release: 0.15 } },
  keys_rock_organ:   { oscillators: [{ type: "sawtooth", gain: 0.5, detune: -3, coarse: 0 }, { type: "sawtooth", gain: 0.5, detune: 3, coarse: 0 }, { type: "square", gain: 0.3, detune: 0, coarse: 12 }], envelope: { attack: 0.01, decay: 0.05, sustain: 1.0, release: 0.2 } },
  pluck_kalimba:     { oscillators: [{ type: "sine", gain: 0.7, detune: 0, coarse: 12 }, { type: "triangle", gain: 0.5, detune: 0, coarse: 24 }], envelope: { attack: 0.005, decay: 0.25, sustain: 0.1, release: 0.25 } },
  pluck_synth_harp:  { oscillators: [{ type: "triangle", gain: 0.6, detune: -5, coarse: 0 }, { type: "triangle", gain: 0.6, detune: 5, coarse: 0 }, { type: "sine", gain: 0.4, detune: 0, coarse: 12 }], envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.4 } },
  
  // --- NEW: Acoustic Emulations (Approximations) ---
  emulation_flute:   { oscillators: [{ type: "sine", gain: 0.8, detune: 0, coarse: 0 }, { type: "triangle", gain: 0.2, detune: 3, coarse: 12 }], envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 } },
  emulation_clarinet:{ oscillators: [{ type: "square", gain: 0.7, detune: 0, coarse: 0 }, { type: "triangle", gain: 0.3, detune: 4, coarse: 12 }], envelope: { attack: 0.08, decay: 0.1, sustain: 0.8, release: 0.2 } },
  emulation_brass:   { oscillators: [{ type: "sawtooth", gain: 0.7, detune: 5, coarse: 0 }, { type: "sawtooth", gain: 0.5, detune: -5, coarse: -12 }], envelope: { attack: 0.15, decay: 0.1, sustain: 0.9, release: 0.25 } },
  emulation_violin:  { oscillators: [{ type: "sawtooth", gain: 0.5, detune: -8, coarse: 0 }, { type: "sawtooth", gain: 0.5, detune: 8, coarse: 0 }, { type: "sawtooth", gain: 0.2, detune: 2, coarse: 12 }], envelope: { attack: 0.25, decay: 0.2, sustain: 1.0, release: 0.4 } },
  emulation_bells:   { oscillators: [{ type: "sine", gain: 0.6, detune: 0, coarse: 12 }, { type: "triangle", gain: 0.4, detune: 0, coarse: 24 }, { type: "sine", gain: 0.2, detune: 0, coarse: 31 }], envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 1.0 } },

  // --- Non-Rhythmic SFX (isRhythmic is false) ---
  blip:              { isRhythmic: false, oscillators: [{ type: "triangle", gain: 1.0, detune: 0, coarse: 0 }], envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.08 } },
  sad_organ:         { isRhythmic: false, oscillators: [{ type: "sawtooth", gain: 0.5, detune: 0, coarse: 0 }, { type: "sawtooth", gain: 0.4, detune: 15, coarse: 0 }, { type: "sine", gain: 0.2, detune: 0, coarse: -12 }], envelope: { attack: 0.2, decay: 0.2, sustain: 0.4, release: 1.0 } },
  sfx_laser:         { isRhythmic: false, oscillators: [{ type: "sawtooth", gain: 0.8, detune: 20, coarse: 0 }], envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.1 } },
  sfx_coin:          { isRhythmic: false, oscillators: [{ type: "square", gain: 0.5, detune: 0, coarse: 12 }, { type: "sine", gain: 0.8, detune: 5, coarse: 24 }], envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 } },
  sfx_powerup:       { isRhythmic: false, oscillators: [{ type: "square", gain: 0.4, detune: 0, coarse: 0 }, { type: "square", gain: 0.4, detune: 0, coarse: 7 }, { type: "square", gain: 0.4, detune: 0, coarse: 12 }], envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2 } },
  sfx_explosion:     { isRhythmic: false, oscillators: [{ type: "sawtooth", gain: 1.0, detune: 50, coarse: -24 }, { type: "sawtooth", gain: 1.0, detune: -50, coarse: -36 }], envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.8 } },
  sfx_alarm:         { isRhythmic: false, oscillators: [{ type: "sawtooth", gain: 0.7, detune: 0, coarse: 0 }, { type: "sawtooth", gain: 0.7, detune: 0, coarse: 4 }], envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 } },
} satisfies Record<string, Instrument>;

const instrument_bank = instruments as Record<string, Instrument>;

type InstrumentName = keyof typeof instruments;

class AudioManager {
  private context: AudioContext;
  private song: SongData;
  private progressionIndex: number;
  private noteMap: { [key: string]: number };
  private nextNoteTime: number;

  constructor() {
    this.context = null!;
    this.song = { instrument: "chiptune_square", notes: [], bpm: 120 };
    this.progressionIndex = 0;
    this.nextNoteTime = 0;
    this.noteMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  }

  get time() {
    return this.context?.currentTime ?? 0;
  }

  #init() {
    if (!this.context || this.context.state === "closed") {
      try {
        this.context = new AudioContext();
        this.nextNoteTime = this.context.currentTime;
      } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
      }
    }
  }

  #getNoteFrequency(note: NoteNotation) {
    const noteRegex = /^([A-G])([#b]?)([0-9]{1,2})$/; // Allow 2-digit octaves
    const match = note.match(noteRegex);
    if (!match) return null;
    const [, letter, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    let semitone = this.noteMap[letter];
    if (semitone == null) return null;
    if (accidental === "#") semitone++;
    else if (accidental === "b") semitone--;
    const halfStepsFromA4 = (octave - 4) * 12 + (semitone - this.noteMap["A"]);
    return 440 * Math.pow(2, halfStepsFromA4 / 12);
  }

  setSong(songData: SongData) {
    this.song = songData;
    this.progressionIndex = 0;
  }

  /**
   * --- METHOD OVERHAULED ---
   * Plays the next note in the sequence, with duration based on BPM.
   */
  playNextInProgression() {
    if (!this.song || this.song.notes.length === 0)
      throw new Error("No song loaded");

    const noteToPlay = this.song.notes[this.progressionIndex];
    const bpm = this.song.bpm || 120;

    const parts = noteToPlay.split(" ");
    let instrumentName: InstrumentName;
    let note: NoteNotation;

    if (parts.length > 1) {
      // Format is "instrument note", e.g., "plucked_bass C3"
      instrumentName = parts[0] as InstrumentName;
      note = parts[1] as NoteNotation;
    } else {
      // Format is just "note", e.g., "C4"
      instrumentName = this.song.instrument; // Use the song's default instrument
      note = parts[0] as NoteNotation;
    }

    // Duration of one beat (a quarter note) in seconds.
    const beatDuration = 60 / bpm;

    // Make the note sound for about 80% of its rhythmic slot.
    // This gives a nice separation (staccato) feel.
    const soundDuration = beatDuration * 0.8;

    this.playNote(
      note as NoteNotation,
      soundDuration,
      instrumentName as InstrumentName
    );

    this.progressionIndex =
      (this.progressionIndex + 1) % this.song.notes.length;

    return noteToPlay;
  }

  /**
   * --- METHOD OVERHAULED ---
   * Schedules a single note to be played, managing timing based on BPM.
   */
  playNote(
    note: NoteNotation,
    duration: number,
    instrument: InstrumentName = "blip"
  ) {
    this.#init();
    if (!this.context) return; // Guard against unsupported environments

    const freq = this.#getNoteFrequency(note);
    if (!freq) return;

    const bpm = this.song?.bpm || 120;
    // The time until the *next* note can be played is one beat.
    const timeUntilNextNote = 60 / bpm;

    const scheduledTime = Math.max(this.context.currentTime, this.nextNoteTime);
    this.#playSound(freq, duration, scheduledTime, instrument);

    // Update the next available time slot.
    this.nextNoteTime = scheduledTime + timeUntilNextNote;
  }

  #playSound(
    baseFrequency: number,
    duration: number,
    startTime: number,
    instrumentKey: InstrumentName
  ) {
    const instrument = instrument_bank[instrumentKey];
    if (!instrument) {
      console.warn(
        `Instrument "${instrumentKey}" not found. Defaulting to blip.`
      );
      instrumentKey = "blip";
    }

    const envelope = instrument.envelope;
    const masterGain = this.context.createGain();
    masterGain.connect(this.context.destination);

    // ADSR Envelope
    masterGain.gain.setValueAtTime(0, startTime);
    const peakTime = startTime + envelope.attack;
    masterGain.gain.linearRampToValueAtTime(1.0, peakTime);
    masterGain.gain.setTargetAtTime(
      envelope.sustain,
      peakTime,
      envelope.decay + 0.001 // Add small value to avoid issues if decay is 0
    );

    let noteEndTime: number;

    if (instrument.isRhythmic === false) {
      // For SFX, the duration is inherent to its envelope.
      // The "note" ends after the attack and decay phases are complete.
      noteEndTime = startTime + envelope.attack + envelope.decay;
    } else {
      // For rhythmic notes, use the duration passed in (from BPM).
      noteEndTime = startTime + duration;
    }

    // Schedule the start of the release phase.
    masterGain.gain.cancelScheduledValues(noteEndTime);
    // Using setTargetAtTime for release creates a more natural fade-out
    masterGain.gain.setTargetAtTime(0, noteEndTime, envelope.release / 2); // Divide by 2 for a quicker feeling release curve

    instrument.oscillators.forEach((oscSettings) => {
      const finalFrequency =
        baseFrequency * Math.pow(2, oscSettings.coarse / 12);

      const osc = this.context.createOscillator();
      const oscGain = this.context.createGain();

      osc.type = oscSettings.type;
      osc.detune.setValueAtTime(oscSettings.detune, startTime);
      osc.frequency.setValueAtTime(finalFrequency, startTime);

      oscGain.gain.value = oscSettings.gain;

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(startTime);
      // Stop the oscillator well after the sound has faded.
      osc.stop(noteEndTime + envelope.release * 2);
    });
  }

  stop() {
    if (this.context && this.context.state === "running") {
      this.context.close().then(() => {
        this.context = null!;
      });
    }
  }
}

// --- UTILITY CLASSES AND FUNCTIONS ---
class Vector {
  constructor(public x: number, public y: number) {}
  static randomBallVelocity() {
    return new Vector(random(), remap(random(), 0, 1, -1, -2)).normalize(
      BALL_SPEED
    );
  }
  add(v: Vector, s = 1) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }
  sub(v: Vector, s = 1) {
    this.x -= v.x * s;
    this.y -= v.y * s;
    return this;
  }
  dot(v: Vector) {
    return this.x * v.x + this.y * v.y;
  }
  length() {
    return Math.hypot(this.x, this.y);
  }
  normalize(s = 1) {
    const l = this.length();
    if (l > 0) {
      this.x /= l;
      this.y /= l;
    }
    return this.scale(s);
  }
  scale(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }
  clone() {
    return new Vector(this.x, this.y);
  }
}
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const saturate = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const unlerp = (v: number, a: number, b: number) =>
  a === b ? 0 : (v - a) / (b - a);
const remap = (
  v: number,
  fMin: number,
  fMax: number,
  tMin: number,
  tMax: number,
  ease = (t: number) => t
) => lerp(tMin, tMax, ease(unlerp(v, fMin, fMax)));
const damp = (v: number, t: number, l: number, dt = 1) =>
  lerp(v, t, 1 - Math.exp(-l * dt));
const random = () => randomSign() * (Math.random() * 2 - 1);
const randomSign = () => (Math.random() >= 0.5 ? 1 : -1);

// --- GAME OBJECTS AND LOGIC ---
const audio = new AudioManager();

const ball = {
  position: new Vector(WIDTH / 2, HEIGHT / 2),
  velocity: Vector.randomBallVelocity(),
  radius: BALL_RADIUS,
  update() {
    this.position.add(this.velocity, dt);
    if (this.position.y <= this.radius)
      this.velocity.y = Math.abs(this.velocity.y);
    if (this.position.x <= this.radius)
      this.velocity.x = Math.abs(this.velocity.x);
    if (this.position.x >= WIDTH - this.radius)
      this.velocity.x = -1 * Math.abs(this.velocity.x);
  },
  draw() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  },
};

const paddle = {
  position: new Vector((WIDTH - PADDLE_WIDTH) / 2, HEIGHT - PADDLE_HEIGHT - 10),
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  target: 0,
  init() {
    this.target = this.position.x;
    if (isAutoPlay) return;
    window.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      this.target = clamp(
        event.clientX - rect.left - PADDLE_WIDTH / 2,
        0,
        WIDTH - PADDLE_WIDTH
      );
    });
  },
  update() {
    this.position.x = damp(this.position.x, this.target, 10, dt);
  },
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  },
};

type Note = {
  position: Vector;
  offset: number;
  jitter: number;
  wave: number;
  note: NoteNotation;
  time: number;
  start: number;
};

const game = {
  score: 0,
  level: START_LEVEL,
  lives: isAutoPlay ? MAX_LIVES * 10 : MAX_LIVES,
  over: false,
  started: false,
  showName: true,
  songTitle: "Witcher 3",
  paddle: paddle,
  ball: ball,
  bricks: new Set<{
    position: Vector;
    width: number;
    height: number;
    color: string;
  }>(),
  notes: new Set<Note>(),
  start() {
    audio.playNote("C4", 0.1, "soft_synth");
    audio.playNote("E4", 0.1, "soft_synth");
    audio.playNote("G4", 0.1, "soft_synth");
    audio.playNote("C5", 0.2, "soft_synth");
    setTimeout(() => {
      this.started = true;
    }, 800);
  },
  restart() {
    Object.assign(this, {
      over: false,
      lives: MAX_LIVES,
      level: START_LEVEL,
      score: 0,
    });
    this.bricks.clear();
    this.addBricks();
    this.resetBall();
  },
  end() {
    this.over = true;
    audio.stop();
    setTimeout(() => {
      audio.playNote("G4", 0.25, "sad_organ");
      audio.playNote("Eb4", 0.25, "sad_organ");
      audio.playNote("C4", 0.25, "sad_organ");
      audio.playNote("C3", 1.0, "sad_organ");
      if (isAutoPlay) setTimeout(() => this.restart(), 3000);
    }, 300);
  },
  resetBall() {
    this.ball.position.x = WIDTH / 2;
    this.ball.position.y = HEIGHT / 2;
    this.ball.velocity = Vector.randomBallVelocity();
    this.randomizeSong();
  },
  randomizeSong() {
    audio.stop();
    const names = Object.keys(songs);
    this.songTitle = names[Math.floor(Math.random() * names.length)];
    audio.setSong(songs[this.songTitle]);
  },
  init() {
    this.paddle.init();
    this.addBricks();
    this.resetBall();
    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.randomizeSong();
    });
    canvas.addEventListener("click", (event) => {
      if (this.started && !this.over)
        if (isAutoPlay) {
          this.addNote(
            audio.playNextInProgression(),
            this.nextNoteTime,
            new Vector(event.offsetX, event.offsetY)
          );
        } else this.randomizeSong();
      if (!this.started) this.start();
      if (!this.over) return;
      this.restart();
    });
  },
  levelUp() {
    this.level++;
    this.lives = Math.min(MAX_LIVES, this.lives + 1);
    if (this.level % 3 === 0)
      BRICK_ROW_COUNT = Math.min(7, BRICK_ROW_COUNT + 1);
    if (this.level % 5 === 0) BRICK_PER_ROW = Math.min(10, BRICK_PER_ROW + 1);
    this.bricks.clear();
    this.paddle.position.y -= PADDLE_LEVEL_UP_OFFSET;
    this.addBricks();
    this.resetBall();
  },
  addBricks() {
    const hue_step = 360 / (BRICK_ROW_COUNT - 0.01);
    const BRICK_WIDTH =
      (WIDTH - (BRICK_PER_ROW + 1) * BRICK_PADDING_X) / BRICK_PER_ROW;
    const BRICK_COLORS = Array.from(
      { length: BRICK_ROW_COUNT },
      (_, i) => `hsl(${i * hue_step}, 100%, 50%)`
    );
    for (let i = 0; i < BRICK_PER_ROW; i++) {
      const x = BRICK_PADDING_X + i * (BRICK_WIDTH + BRICK_PADDING_X);
      for (let c = 0; c < BRICK_COLORS.length; c++) {
        const y = c * (BRICK_HEIGHT + BRICK_PADDING_Y) + BRICK_OFFSET;
        this.bricks.add({
          position: new Vector(x, y),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[c],
        });
      }
    }
  },
  addNote(note: string, time: number, position = this.ball.position.clone()) {
    if (!this.started) return;
    this.notes.add({
      position: position,
      offset: 100 + Math.random() * 100,
      jitter: random() * 30,
      wave: random() * Math.PI * 2,
      note,
      time,
      start: audio.time,
    });
  },
  update() {
    if (this.over || !this.started) return;
    if (isAutoPlay) {
      this.paddle.target = clamp(
        this.ball.position.x - PADDLE_WIDTH / 2,
        0,
        WIDTH - PADDLE_WIDTH
      );
    }
    this.paddle.update();
    this.ball.update();
    if (this.ball.position.y >= HEIGHT - this.ball.radius) {
      audio.playNote("A2", 0.2);
      if (--this.lives > 0) this.resetBall();
      else this.end();
    }
    this.collideBallPaddle();
    for (const brick of this.bricks) {
      if (this.collideBallBrick(brick)) {
        this.bricks.delete(brick);
        this.score += BRICK_SCORE_BONUS;
        const note = audio.playNextInProgression();
        game.addNote(note, this.nextNoteTime);
      }
    }
    if (this.bricks.size === 0) {
      this.levelUp();
    }
    for (const note of this.notes) {
      if (audio.time > note.time) {
        this.notes.delete(note);
      }
    }
  },
  drawStart() {
    ctx.fillStyle = "white";
    ctx.font = 'bold 32px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CLICK HERE", WIDTH / 2, HEIGHT / 2);
    ctx.fillText("TO START", WIDTH / 2, HEIGHT / 2 + 50);
  },
  draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (!this.started) return this.drawStart();
    for (const brick of this.bricks) {
      ctx.fillStyle = brick.color;
      ctx.fillRect(
        brick.position.x,
        brick.position.y,
        brick.width,
        brick.height
      );
    }
    this.ball.draw();
    this.paddle.draw();
    ctx.fillStyle = "white";
    ctx.font = 'bold 16px "Press Start 2P", monospace';
    ctx.textAlign = "left";
    ctx.fillText(`Lives: ${this.lives}`, 10, 55);
    ctx.fillText(`Score: ${this.score}`, 10, 75);
    ctx.textAlign = "right";
    ctx.fillText(`Level: ${this.level}`, WIDTH - 10, 55);
    ctx.fillStyle = "gold";
    if (isAutoPlay) ctx.fillText("AUTO", WIDTH - 10, 75);
    ctx.textAlign = "left";
    ctx.fillStyle = "#555";
    if (this.showName) ctx.fillText(this.songTitle, 10, 30);
    for (const note of this.notes) this.renderNote(note);
    if (!this.over) return;
    ctx.fillStyle = "#F003";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "red";
    ctx.font = 'bold 32px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2);
  },
  renderNote(note: Note) {
    const progress = saturate(unlerp(audio.time, note.start, note.time));
    const alpha = lerp(0, 1, progress);
    const offset = lerp(0, note.offset, progress);
    const jitter = lerp(0, note.jitter, progress);
    const wave = lerp(0, note.wave, progress);
    const x = note.position.x + Math.sin(wave + time * 10) * jitter;
    const y = note.position.y + offset;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `white`;
    ctx.fillText(note.note, x, y);
    ctx.globalAlpha = 1.0;
  },
  collideBallBrick(brick: { position: Vector; width: number; height: number }) {
    const closestX = clamp(
      this.ball.position.x,
      brick.position.x,
      brick.position.x + brick.width
    );
    const closestY = clamp(
      this.ball.position.y,
      brick.position.y,
      brick.position.y + brick.height
    );
    const distanceX = this.ball.position.x - closestX;
    const distanceY = this.ball.position.y - closestY;
    if (
      distanceX * distanceX + distanceY * distanceY >=
      this.ball.radius * this.ball.radius
    )
      return false;

    const overlapX = this.ball.radius - Math.abs(distanceX);
    const overlapY = this.ball.radius - Math.abs(distanceY);

    if (overlapX > overlapY) {
      this.ball.velocity.y *= -1;
      this.ball.position.y += this.ball.velocity.y > 0 ? overlapY : -overlapY;
    } else {
      this.ball.velocity.x *= -1;
      this.ball.position.x += this.ball.velocity.x > 0 ? overlapX : -overlapX;
    }
    return true;
  },
  collideBallPaddle() {
    if (this.ball.velocity.y <= 0) return false;
    const closestX = clamp(
      this.ball.position.x,
      this.paddle.position.x,
      this.paddle.position.x + this.paddle.width
    );
    const closestY = clamp(
      this.ball.position.y,
      this.paddle.position.y,
      this.paddle.position.y + this.paddle.height
    );
    const distanceX = this.ball.position.x - closestX;
    const distanceY = this.ball.position.y - closestY;
    if (
      distanceX * distanceX + distanceY * distanceY >=
      this.ball.radius * this.ball.radius
    )
      return false;

    const hitPoint =
      this.ball.position.x - (this.paddle.position.x + this.paddle.width / 2);
    const bounceFactor = clamp(hitPoint / (this.paddle.width / 2), -1, 1);
    const bounceAngle = remap(bounceFactor, -1, 1, -75, 75);
    const outgoingAngleRad = (bounceAngle - 90) * (Math.PI / 180);

    this.ball.velocity.x = BALL_SPEED * Math.cos(outgoingAngleRad);
    this.ball.velocity.y = BALL_SPEED * Math.sin(outgoingAngleRad);
    this.ball.position.y = this.paddle.position.y - this.ball.radius - 0.1;
    this.score += PADDLE_SCORE_BONUS;
    audio.playNote("G2", 0.05, "blip");
    return true;
  },
};

// --- INITIALIZATION ---
canvas.width = WIDTH;
canvas.height = HEIGHT;

let lastTime = performance.now();
let dt = 0;
let time = 0;
let frameCount = 0;
let updating = true;

function animate() {
  const now = performance.now();
  dt = (now - lastTime) / 1000;
  time += dt;
  lastTime = now;
  frameCount++;

  if (updating) game.update();
  game.draw();
  requestAnimationFrame(animate);
}

game.init();
animate();
