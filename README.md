# Pokédex + Camera Scanner (Next.js 15)

A phone-styled Pokédex built with Next.js 15 (App Router), styled with CSS variables/Tailwind, backed by PokeAPI, and supercharged with a camera scanner that identifies Pokémon using TensorFlow.js (MobileNet embeddings + KNN classifier). Supports Google Sign-In via Auth.js (NextAuth).

<img width="1852" height="896" alt="image" src="https://github.com/user-attachments/assets/c50aed23-dcc4-4686-910f-88210bf6dedc" />


## Features:

-Pokédex list with responsive, centered grid and smooth hover

-Detail pages at /Pokemon/[id] (background blends with the Pokémon’s type)

-Camera Scanner at /scan

-Build/clear a local KNN index (Gen 1 by default)

-Identify from camera or imported image

-Tunables: k (neighbors) and decision threshold

-Type-aware hover colors on tiles

-Sprite size independent from other tile elements (--sprite-size)

-Google Auth (Auth.js / NextAuth) ready

-Production-grade tweaks for mobile performance

## Stack:

-Frontend: Next.js 15 (App Router), React 19, Tailwind/CSS variables

-Data: PokeAPI

-ML: TensorFlow.js (MobileNet v2) + @tensorflow-models/knn-classifier

-Auth: Auth.js (NextAuth)





## General Structure:

src/
  app/
    Pokemon/
      page.js             # Pokédex list (adds per-tile type classes)
      [id]/
        page.js           # Detail page (background from type)
    scan/
      page.jsx            # Renders the scanner client component
      PokeScan.client.jsx # All TFJS logic & camera
    api/
      auth/
        [...nextauth]/
          route.js        # Re-exports Auth handlers
  auth.js                 # Auth.js (NextAuth) configuration
  app/globals.css         # Shell styles (frame, notch, etc.)
  style.css               # Pokédex UI styles (grid/tiles; variables)


## Scanner: how it works!


<img width="1876" height="916" alt="image" src="https://github.com/user-attachments/assets/4fe4470d-97f3-46c1-b48e-b2cc16c67f46" />


Loads MobileNet v2 in TFJS and uses the penultimate embedding as a feature vector for images.

Builds a KNN index (k-nearest neighbors) locally in the browser using examples from official sprites/artwork.

<img width="1871" height="912" alt="image" src="https://github.com/user-attachments/assets/91539833-e394-47c0-b9d0-b873bd681ed9" />


For a camera frame or imported image:

Draws to a canvas (with several “views”: contain/cover, slight zoom/jitter).

Extracts an embedding with MobileNet.

Queries the KNN for the top classes and combines confidences across views.

If best confidence ≥ threshold → navigate to /Pokemon/[id]. Otherwise show top-3 guesses.

Controls on /scan:

Build Index (Gen 1): creates the examples in memory

Start/Stop Camera: turn camera on/off

Import Image: choose a file instead of using the camera

K (neighbors) and Decision threshold sliders

Clear Index to rebuild

iOS Safari may require HTTPS (or localhost) for camera access.


## Issues:

Performance on mobile devices is rather slow. Perhaps the build version would be faster but most of the problem arises from all the api calls to generate the 1000+ Pokemon tiles. Going forward, since I'm done with the main features I'll work on improving perfomrance. I could possibly divide them up into pages.

The UI is also still very middling and leaves a lot to be desired both in terms of looks and functionality. I plan to work on it soon to emulate a true Pokedex experience.

Using mobilenet with KNN is quite a bit less accurate and in some cases slower than using a properly trained model. I plan to train my own model to increase accuracy when I have the time.

A lot of the text is a bit small so there is an accesibility issue.



## Acknowledgements:

PokeAPI for data and sprites

TensorFlow.js, MobileNet v2, and KNN Classifier

Next.js & Auth.js (NextAuth)

My friend Max for beating me at Pokemon Showdown all the time.

## Note:

Further improvements in UI,QOL and accessibility on the way soon :)
