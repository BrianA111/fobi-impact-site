# FIBO Health Outreach Website

This is a responsive static website for the FIBO project on poverty, inequality, and health in Nigeria.

## Open in VS Code

Open the folder:

`/Users/brian/Library/Mobile Documents/com~apple~CloudDocs/Downloads/fibo-health-site`

## Files

- `index.html` contains the page structure and your project text.
- `styles.css` controls the design, colors, layout, and responsive behavior.
- `script.js` controls the media gallery for photos and videos.
- `assets/images` is where you place your photos.
- `assets/videos` is where you place your videos.

## How to add photos

1. Put your image files inside `assets/images`.
2. Open `script.js`.
3. Replace the sample entry in `photoItems` with your real files.

Example:

```js
const photoItems = [
  {
    src: "assets/images/orphanage-visit-1.jpg",
    alt: "FIBO team during the orphanage outreach",
    caption: "Sharing food and hygiene materials with children at the orphanage.",
  },
  {
    src: "assets/images/rehab-support.jpg",
    alt: "FIBO team at the rehabilitation centre",
    caption: "Offering support and listening to residents at the rehabilitation centre.",
  },
];
```

## How to add videos

1. Put your video files inside `assets/videos`.
2. Open `script.js`.
3. Replace the sample entry in `videoItems` with your real files.

Example:

```js
const videoItems = [
  {
    src: "assets/videos/project-overview.mp4",
    caption: "Short overview of the FIBO outreach project.",
  },
];
```

## How to view the site

Double-click `index.html` in Finder, or open the folder in VS Code and use a live preview extension if you prefer.

## How to publish for everyone

You can upload this folder to any static hosting service such as GitHub Pages, Netlify, or Vercel so anyone can open it from any device.
