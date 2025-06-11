// songs.ts

import type { SongData } from "./main";

function shuffleSongs(
  songs: Record<string, SongData>
): Record<string, SongData> {
  const entries = Object.entries(songs);
  let currentIndex = entries.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [entries[currentIndex], entries[randomIndex]] = [
      entries[randomIndex],
      entries[currentIndex],
    ];
  }
  return Object.fromEntries(entries);
}

// prettier-ignore
export const songs = shuffleSongs({
  // --- Retro & Chiptune (Sharp) ---
  "Super Mario Bros. - Main Theme":  { instrument: "chiptune_square", bpm: 200, notes: ["E5", "E5", "E5", "plucked_bass C5", "E5", "G5", "plucked_bass G4"] },
  "Tetris - Theme A":                 { instrument: "chiptune_square", bpm: 155, notes: ["E5", "plucked_bass B4", "C5", "D5", "C5", "B4", "A4", "plucked_bass A4", "C5", "E5", "D5", "C5", "plucked_bass B4"] },
  "Castlevania - Vampire Killer":     { instrument: "chiptune_square", bpm: 160, notes: ["C4", "bass_deep_square C3", "B3", "bass_deep_square B2", "A3", "bass_deep_square A2", "G3", "bass_deep_square G2"] },
  "Sonic - Green Hill Zone":          { instrument: "chiptune_square", bpm: 200, notes: ["C#5", "F#5", "F#5", "G#5", "F#5", "E5", "F#5", "C#5"] },
  "Mega Man 2 - Dr. Wily's Castle":   { instrument: "lead_80s_hero", bpm: 170, notes: ["F#4", "B4", "A4", "G4", "F#4", "E4", "bass_funky_saw F#3", "bass_funky_saw G3", "bass_funky_saw A3", "bass_funky_saw B3"] },
  "Street Fighter II - Guile's Theme":{ instrument: "lead_hollow", bpm: 125, notes: ["D#4", "D#4", "D#4", "D4", "D#4", "plucked_bass G#3", "D#4", "plucked_bass G#3", "D#4"] },
  "The Simpsons - Main Theme":        { instrument: "emulation_brass", bpm: 160, notes: ["C5", "E5", "F#5", "A5", "keys_rock_organ G5", "E5", "C5", "plucked_bass A4"] },
  "Benny Hill - Yakety Sax":          { instrument: "emulation_brass", bpm: 150, notes: ["G4", "G5", "F5", "E5", "D5", "C#5", "D5", "E5"] },

  // --- Aggressive & Distorted Synth ---
  "Undertale - Megalovania":          { instrument: "distorted_lead", bpm: 240, notes: ["D4", "bass_wobble_growl D3", "D4", "bass_wobble_growl D3", "D5", "bass_wobble_growl D3", "A4", "bass_wobble_growl D3", "G#4", "G4", "F4", "D4", "F4", "G4"] },
  "Mortal Kombat - Techno Syndrome":  { instrument: "lead_acid", bpm: 127, notes: ["A3", "C4", "bass_funky_saw A2", "D4", "bass_funky_saw A2", "E4", "bass_funky_saw A2", "G4"] },
  "F-Zero - Mute City":               { instrument: "distorted_lead", bpm: 180, notes: ["A4", "G4", "A4", "C5", "A4", "G4", "bass_resonant F4", "bass_resonant E4"] },
  "Doom (1993) - E1M1":               { instrument: "distorted_lead", bpm: 110, notes: ["E2", "E2", "B2", "E2", "E2", "A2", "E2", "E2", "sfx_explosion G#2", "sfx_explosion G2", "sfx_explosion F#2"] },
  "Attack on Titan - Guren no Yumiya":{ instrument: "emulation_violin", bpm: 180, notes: ["E4", "F#4", "G4", "emulation_brass A4", "B4", "emulation_brass C5", "B4", "A4"] },
  "Initial D - Deja Vu":              { instrument: "lead_80s_hero", bpm: 158, notes: ["A4", "B4", "C#5", "D5", "E5", "D5", "C#5", "B4"] },
  "Darude - Sandstorm":               { instrument: "lead_acid", bpm: 136, notes: ["B4", "B4", "B4", "B4", "B4"] },
  
  // --- Flute, Ocarina & Softer Chiptune ---
  "Zelda: Ocarina of Time - Main Theme": { instrument: "emulation_flute", bpm: 130, notes: ["G4", "chiptune_triangle G4", "A4", "B4", "C5", "B4", "A4", "chiptune_triangle G4", "A4", "B4", "G4"] },
  "The Witcher 3 - Geralt of Rivia":  { instrument: "emulation_violin", bpm: 90,  notes: ["E4", "B4", "A4", "G4", "E4", "F#4", "G4", "E4"] },
  "Pokemon R/B/Y - Pallet Town":      { instrument: "chiptune_triangle", bpm: 120, notes: ["G4", "G4", "F#4", "G4", "A4", "G4", "B4", "C5"] },
  "Kirby - Green Greens":             { instrument: "lead_soft_whistle", bpm: 150, notes: ["G5", "G5", "A5", "B5", "G5", "F#5", "E5", "D5", "plucked_bass B4"] },
  "Zelda - Saria's Song (Lost Woods)":{ instrument: "emulation_flute", bpm: 160, notes: ["F4", "A4", "B4", "F4", "A4", "B4", "F4", "A4", "B4", "E5", "D5"] },
  "Naruto - Sadness and Sorrow":      { instrument: "emulation_flute", bpm: 80,  notes: ["A4", "C5", "emulation_violin E5", "D5", "C5", "A4", "B4"] },
  
  // --- Piano, Guitar & Soft Synth ---
  "Minecraft - Sweden":               { instrument: "keys_electric_piano", bpm: 110, notes: ["F#4", "A4", "C#5", "pad_warm_analog E5", "A5", "C#5", "A4", "F#4"] },
  "The Last of Us - Main Theme":      { instrument: "clean_guitar", bpm: 100, notes: ["E3", "G3", "A3", "G3", "E3", "C4", "B3"] },
  "Silent Hill 2 - Theme of Laura":   { instrument: "keys_electric_piano", bpm: 105, notes: ["E4", "B4", "C5", "pad_shimmer B4", "A4", "F#4", "G4"] },
  "Final Fantasy X - To Zanarkand":   { instrument: "keys_electric_piano", bpm: 80,  notes: ["A3", "B3", "C4", "E4", "D4", "E4", "pad_celestial G4", "E4"] },
  "Chrono Trigger - Main Theme":      { instrument: "lead_soft_whistle", bpm: 120, notes: ["B4", "A4", "G4", "E4", "G4", "A4", "B4", "emulation_bells C5", "A4"] },
  "Celeste - First Steps":            { instrument: "soft_synth", bpm: 140, notes: ["C5", "G4", "A4", "B4", "C5", "pad_shimmer E5", "D5"] },
  "Mii Channel Theme":                { instrument: "soft_synth", bpm: 114, notes: ["F#3", "A3", "C#4", "A3", "F#3", "plucked_bass D3", "plucked_bass E3", "plucked_bass F#3"] },
  
  // --- Bass-heavy & Plucked Themes ---
  "GTA: San Andreas - Main Theme":    { instrument: "plucked_bass", bpm: 95,  notes: ["E3", "G3", "A3", "B3", "A3", "G3", "E3", "D3", "E3"] },
  "Luigi's Mansion - Main Theme":     { instrument: "plucked_bass", bpm: 110, notes: ["E3", "A3", "B3", "E3", "pad_dark_drone A3", "C4", "E3", "A3"] },
  "Earthbound - Pollyanna":           { instrument: "plucked_bass", bpm: 108, notes: ["G2", "C3", "D3", "D#3", "D3", "C3"] },
  "The Fresh Prince of Bel-Air":      { instrument: "plucked_bass", bpm: 101, notes: ["G3", "A3", "B3", "C4", "D4", "C4", "B3", "A3"] },
  "Cowboy Bebop - Tank!":             { instrument: "plucked_bass", bpm: 140, notes: ["C4", "D#4", "emulation_brass F4", "G#4", "emulation_brass A#4", "G#4", "F4"] },
  
  // --- Orchestral, Epic & '80s Synth ---
  "Skyrim - Dragonborn":              { instrument: "emulation_brass", bpm: 130, notes: ["A3", "A3", "G3", "emulation_violin A3", "B3", "C4", "B3", "A3"] },
  "God of War (2018) - Main Theme":   { instrument: "epic_synth", bpm: 95,  notes: ["D3", "E3", "F3", "pad_dark_drone G3", "A3", "Bb3", "A3", "G3"] },
  "Halo - Main Theme":                { instrument: "pad_celestial", bpm: 80,  notes: ["A3", "C#4", "D4", "E4", "F#4", "E4", "D4", "C#4", "A3"] },
  "Elden Ring - Main Theme":          { instrument: "pad_dark_drone", bpm: 100, notes: ["E4", "emulation_violin G4", "F#4", "E4", "D4", "C4", "D4"] },
  "Neon Genesis Evangelion - A Cruel Angel's Thesis": { instrument: "epic_synth", bpm: 128, notes: ["A4", "G#4", "F#4", "E4", "F#4", "G#4", "A4", "B4"] },
  "Sweet Dreams (Are Made of This)":  { instrument: "synth_bass_80s", bpm: 125, notes: ["C4", "G3", "G#3", "G3", "C4", "pad_sci_fi C4", "pad_sci_fi D#4"] },
  "Take On Me - a-ha":                { instrument: "lead_80s_hero", bpm: 169, notes: ["F#5", "F#5", "D5", "synth_bass_80s B4", "B4", "E5", "E5", "E5", "G#5", "G#5", "A5"] },
  
  // --- Music Box & Delicate ---
  "Undertale - Home (Music Box)":     { instrument: "music_box", bpm: 110, notes: ["C4", "G4", "B4", "C5", "G4", "E4", "D4", "C4"] },
  "Hollow Knight - Main Theme":       { instrument: "keys_electric_piano", bpm: 90,  notes: ["D4", "A4", "D5", "C#5", "pad_shimmer A4", "F#4", "D4"] },
  "Secret of Mana - Fear of the Heavens": { instrument: "music_box", bpm: 120, notes: ["G5", "F#5", "D5", "E5", "G4", "A4", "B4", "C5"] },
  "Nier:Automata - City Ruins (Rays of Light)": { instrument: "music_box", bpm: 100, notes: ["A4", "E5", "D5", "C#5", "B4", "A4", "B4", "C#5"] },
  "Sailor Moon - Moonlight Densetsu": { instrument: "music_box", bpm: 130, notes: ["C#5", "D#5", "E5", "F#5", "G#5", "A5", "B5"] },
});
