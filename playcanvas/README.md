# PlayCanvas conversion prototype

This folder is the first web/PlayCanvas-oriented rebuild of the Madagascar edition.

## Important
The original project in the repository root is a Godot 4.7 project. Godot `.tscn`, `.gd` and `.gdshader` files are not directly editable PlayCanvas assets. This folder therefore rebuilds the initial driving scene using PlayCanvas Engine JavaScript and procedural geometry. It is not a one-click conversion and it is not yet feature-equivalent to the Godot project.

## Run
Open `index.html` through a web server or host it with GitHub Pages. It loads the PlayCanvas Engine from the official CDN, so internet access is needed.

Controls:
- Keyboard: WASD or arrow keys
- Touch: left/right, FREIN and GAZ buttons

## Current prototype
- Madagascar-inspired red-earth road and village houses
- Basic truck made from editable primitive shapes
- Follow camera
- Keyboard and touchscreen driving input
- Speed display

## Next migration steps
1. Replace the placeholder truck with a licensed GLB vehicle model.
2. Import the existing Quaternius character GLB where needed, respecting its included license.
3. Rebuild the original traffic, pedestrians, vehicle entry/exit, missions, and improved physics in JavaScript.
4. Test on Android Chrome and optimize draw calls, shadows and geometry.
5. Package as an Android app only after the web version is stable.

The original Godot project remains unchanged in the repository root.