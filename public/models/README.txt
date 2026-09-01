Drop the photogrammetry scan of Stardom Resort here as:  stardom.glb

How to capture it (free, ~20 minutes on site):
  1. Install Polycam or Luma AI on a phone
  2. Walk the resort perimeter slowly (or fly a drone orbit), keeping
     the whole building in frame; capture in good daylight
  3. Export as GLB (choose the highest quality your plan allows)
  4. Put the file here, then rebuild + deploy
     (or send it to Claude - it will optimize and deploy it)

The site auto-detects this file: with it present the real building
replaces the stylized block at the end of the walkway - auto-scaled
to ~26m wide, grounded, facing the path. Tune SCAN in
src/scene/Resort.jsx (rotationY etc.) if the scan faces the wrong way.
