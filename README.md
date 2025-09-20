Pokédex + Camera Scanner (Next.js 15)

A phone-styled Pokédex built with Next.js 15 (App Router), styled with CSS variables/Tailwind, backed by PokeAPI, and supercharged with a camera scanner that identifies Pokémon using TensorFlow.js (MobileNet embeddings + KNN classifier). Supports Google Sign-In via Auth.js (NextAuth).

Features

Pokédex list with responsive, centered grid and smooth hover

Detail pages at /Pokemon/[id] (background blends with the Pokémon’s type)

Camera Scanner at /scan

Build/clear a local KNN index (Gen 1 by default)

Identify from camera or imported image

Tunables: k (neighbors) and decision threshold

Type-aware hover colors on tiles

Sprite size independent from other tile elements (--sprite-size)

Google Auth (Auth.js / NextAuth) ready

Production-grade tweaks for mobile performance

Stack

Frontend: Next.js 15 (App Router), React 19, Tailwind/CSS variables

Data: PokeAPI

ML: TensorFlow.js (MobileNet v2) + @tensorflow-models/knn-classifier

Auth: Auth.js (NextAuth)
