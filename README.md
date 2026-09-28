# Little Fairytales

A small game prototype for children: dress up a princess, build a castle, meet a cat, and open a gift. Built with TypeScript, Phaser 3, and Vite. The built files run without backend logic, accounts, ads, or external APIs.

## Getting started

```sh
npm ci
npm run dev
```

To preview the production build and test offline mode:

```sh
npm run build
npm run preview -- --port 4174
```

Open http://localhost:4174 on your computer. Vite also prints a network address that you can open on a phone connected to the same Wi-Fi network. Keep the server running while playing.

## How to play

1. Choose clothes, shoes, a crown or bow, and earrings. Each category has four options, and earrings can be removed. Tap an item or drag it onto the princess.
2. Continue to the castle. Choose one of four castle colors. Place four pieces by tapping them or dragging them onto their outlines. Tap a placed piece or its card to cycle through three designs.
3. Continue to the visitor scene, tap the door, then tap the cat and the gift.

An incorrect drop returns the item to the tray. Pieces snap into place when dropped near their target. The outfit, stage, building pieces, gift, and sound preference are saved in localStorage. Starting a new story resets its progress. Returning to the outfit keeps the completed castle.

## Android and offline play

The production build uses a service worker to cache all assets. Offline startup on localhost is covered by an automated test. Installation and offline play on Android require HTTPS hosting. A local network address such as http://192.168... works for an initial Wi-Fi play session, but does not enable the service worker. Open the game fully while online before playing offline. Clearing browser data removes both saved progress and cached assets.

Play on GitHub Pages: https://shumer.github.io/little-fairytales/. GitHub Actions publishes the game after a successful build and browser tests. This version has not yet been verified on a physical Android device. Checks cover desktop Chrome and an emulated small touchscreen.

## Checks

```sh
npm run build
npm test
```

Local tests require Google Chrome. Playwright checks the complete story, incorrect and correct drag-and-drop, progress after reloading, opening the gift, restarting, offline loading, touch input on a small screen, and recovery from corrupted saves. Tests also cover story selection, independent progress, music controls, and pet care.

## Files

- `src/main.ts`: scenes, interactions, animations, and sound effects.
- `src/art.ts`: vector layers for characters, clothing, and game items.
- `src/state.ts`: state validation and persistence.
- `public/garden.png`: background generated with the built-in ImageGen tool.
- `ART.md`: background description and original prompt.
- `scripts/offline.mjs`: production cache generation.

The game includes three fairytales: a castle party, space friends, and a dragon's home. Each has its own outfits or colors, building, pieces, and visitor. Animations are simple and do not include full walking cycles. In-game text is in Russian, and spoken instructions are not yet available. Further playtesting with a child should check whether the actions are clear, touch targets are comfortable, and the stories are fun to repeat.

## Music

An original 16-bar waltz loops roughly every 34 seconds, with a soft music-box sound and quiet accompaniment. It is synthesized through Web Audio without external audio files and starts after the first interaction. The speaker button mutes both music and effects, and the preference is saved. Audio pauses when the page is hidden. Switching scenes does not start a second copy of the melody. Notes and audio controls are in `src/music.ts`.

## Story selection and celebrations

Every launch starts with an animated selection screen: four large cards, gently swaying characters, a floating rocket, and twinkling stars. Tap a card to start or resume its activity. The button with four colored squares at the top returns to this screen. Each story has its own saved progress. The circular-arrow button in the menu restarts the current activity.

Opening the door reveals a visitor, a gift, confetti, and balloons. Picture buttons trigger dancing, balloons, bubbles, and a special action: fireworks, a rocket, or dragon hearts. Tap balloons and bubbles to pop them. The number of simultaneous play objects is limited. From the finale, return to the outfit, building, or story selection.

Story definitions and piece positions are in `src/stories.ts`. Additional story artwork is in `src/story-art.ts`.

## Deployment

Changes to `main` are automatically built, tested in Chromium, and published through GitHub Actions. GitHub Pages must use GitHub Actions as its publishing source. Only the contents of `dist` are published.

To roll back an update, revert its commit on `main` and wait for a successful deployment. An installed offline copy updates after reconnecting to the internet and reopening the game.

## Pet care

The fourth card opens a care activity for a cat or dog. Choose a pet using its picture. Tap the shower, brush, bowl, or ball, or drag it onto the pet. Each activity includes animation and hearts. Completed activities are saved separately for the cat and dog and can be repeated. There are no hunger timers, penalties, or required order. Tap the pet to give it affection.

Pets also stroll, stretch, and curl up for a nap when idle. Use the moon button for a nap and the stretching-pet picture to stretch. Tap or stroke a pet to wake it and receive an affectionate reaction. Tap or drag the ball beside the pet to send it chasing the toy.

Pet movement uses a single articulated character with continuous leg motion tied to travel distance, a flexible tail, blinking, breathing, and blended resting poses. The renderer is in `src/pet-rig.ts`.
