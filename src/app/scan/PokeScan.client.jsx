"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// TFJS lazy imports (guard against HMR duplicating modules)
let tf, mobilenet, knnClassifier;

async function loadTfStuff() {
  if (!tf) {
    tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgl");
  }
  if (!mobilenet) {
    mobilenet = await import("@tensorflow-models/mobilenet");
  }
  if (!knnClassifier) {
    knnClassifier = await import("@tensorflow-models/knn-classifier");
  }
}

async function ensureTfReady() {
  if (!tf) await loadTfStuff();
  if (tf.getBackend?.() !== "webgl") await tf.setBackend("webgl");
  await tf.ready?.();
}

// ---- Canvas + image helpers ----

function setVideoAttrs(v) {
  if (!v) return;
  v.setAttribute("playsinline", "true");
  v.setAttribute("muted", "true");
  v.setAttribute("autoplay", "true");
  v.playsInline = true; v.muted = true; v.autoplay = true;
}

function waitForPlaying(video) {
  return new Promise((resolve) => {
    if (!video) return resolve();
    if (video.readyState >= 2 && !video.paused) return resolve();
    const onPlay = () => { cleanup(); resolve(); };
    const cleanup = () => {
      video.removeEventListener("loadeddata", onPlay);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("canplay", onPlay);
    };
    video.addEventListener("loadeddata", onPlay, { once: true });
    video.addEventListener("playing", onPlay, { once: true });
    video.addEventListener("canplay", onPlay, { once: true });
  });
}

// draw with "object-fit: contain"
function drawContain(ctx, src, W, H) {
  const iw = src.videoWidth || src.width, ih = src.videoHeight || src.height;
  if (!iw || !ih) return;
  const r = Math.min(W / iw, H / ih);
  const nw = iw * r, nh = ih * r;
  const x = (W - nw) / 2, y = (H - nh) / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(src, x, y, nw, nh);
}

// draw with "object-fit: cover" plus a bit of zoom/jitter
function drawCover(ctx, src, W, H, zoom = 1.0, jitter = 0) {
  const iw = src.videoWidth || src.width, ih = src.videoHeight || src.height;
  if (!iw || !ih) return;
  const r = Math.max(W / iw, H / ih) * zoom;
  const nw = iw * r, nh = ih * r;
  const jx = jitter ? (Math.random() * 2 - 1) * jitter * W : 0;
  const jy = jitter ? (Math.random() * 2 - 1) * jitter * H : 0;
  const x = (W - nw) / 2 + jx, y = (H - nh) / 2 + jy;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(src, x, y, nw, nh);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadFileImage(file) {
  if ("createImageBitmap" in window && typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { src: bitmap, kind: "bitmap" };
    } catch {
      // fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return { src: img, kind: "image", objectURL: url };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// ---- Data sources ----
const ART = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const SPRITE = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const HOME = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
const DREAM = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;

// ---- Tunables ----
const FIRST_ID = 1;
const LAST_ID = 151;

export default function PokeScan() {
  const router = useRouter();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // single file input ref

  const [ready, setReady] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(0);
  const [status, setStatus] = useState("Initializing…");

  const [kVal, setKVal] = useState(15);
  const [threshold, setThreshold] = useState(0.55);

  const [importPreviewURL, setImportPreviewURL] = useState(null);
  const importedRef = useRef(null);

  const [suggestions, setSuggestions] = useState(null);

  const classifierRef = useRef(null);
  const modelRef = useRef(null);

  // init TF + MobileNet + classifier (camera is manual)
  useEffect(() => {
    (async () => {
      try {
        setStatus("Loading TensorFlow…");
        await ensureTfReady();

        setStatus("Loading MobileNet…");
        modelRef.current = await mobilenet.load({ version: 2, alpha: 1.0 });

        classifierRef.current = knnClassifier.create();

        setReady(true);
        setStatus("Ready. Build index, then Start Camera or Import an Image.");
      } catch (err) {
        console.error(err);
        setStatus("Init error: " + String(err?.message || err));
      }
    })();

    return () => {
      stopCamera(videoRef, setCamReady);
      if (importedRef.current?.objectURL) URL.revokeObjectURL(importedRef.current.objectURL);
    };
  }, []);

  // start/stop camera on demand
  async function startCamera() {
    try {
      await ensureTfReady();
      setStatus("Starting camera…");
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      const v = videoRef.current;
      if (v) {
        setVideoAttrs(v);
        v.srcObject = stream;
        await v.play().catch(() => {});
        await waitForPlaying(v);
      }
      setCamReady(true);
      setStatus("Camera ready. You can Scan now.");
    } catch (e) {
      setStatus("Camera error: " + String(e?.message || e));
    }
  }

  function stopCamera(vRef = videoRef, setCam = setCamReady) {
    const v = vRef.current;
    const stream = v?.srcObject;
    if (stream?.getTracks) stream.getTracks().forEach((t) => t.stop());
    if (v) { v.srcObject = null; v.load?.(); }
    setCam(false);
    setStatus("Camera stopped.");
  }

  // lightweight augmentation for robustness
  const AUG_PER_SOURCE = 3;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function chance(p) { return Math.random() < p; }

  function drawAugmented(ctx, src, W, H) {
    ctx.save();
    const bright = rand(0.85, 1.15);
    const contrast = rand(0.85, 1.2);
    const saturate = rand(0.85, 1.2);
    const hue = rand(-8, 8);
    const blur = chance(0.2) ? rand(0, 0.8) : 0;
    ctx.filter = `brightness(${bright}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg) blur(${blur}px)`;
    if (chance(0.3)) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    const zoom = rand(1.05, 1.35);
    const jitter = 0.06;
    drawCover(ctx, src, W, H, zoom, jitter);
    ctx.restore();
  }

  // embed + L2-normalize
  function embedNormalized() {
    const input = tf.browser.fromPixels(canvasRef.current);
    const feats = modelRef.current.infer(input, "conv_preds");
    input.dispose();
    const norm = tf.norm(feats).add(1e-8);
    const embN = feats.div(norm);
    feats.dispose();
    norm.dispose();
    return embN;
  }

  // build the KNN index using multiple sprite sources + augs
  const buildIndex = async () => {
    try { await ensureTfReady(); } catch (e) { setStatus("TF not ready: " + String(e?.message || e)); return; }
    if (!modelRef.current) { setStatus("Model not loaded. Reload page."); return; }
    if (!classifierRef.current) { classifierRef.current = knnClassifier.create(); }

    setBuilding(true);
    setSuggestions(null);
    setStatus("Building Pokémon index…");

    const ctx = canvasRef.current.getContext("2d");
    const size = 224;
    canvasRef.current.width = size;
    canvasRef.current.height = size;

    let exemplars = 0;

    try {
      for (let id = FIRST_ID; id <= LAST_ID; id++) {
        const imgs = [];
        try { imgs.push(await loadImage(ART(id))); } catch {}
        try { imgs.push(await loadImage(HOME(id))); } catch {}
        try { imgs.push(await loadImage(SPRITE(id))); } catch {}
        try { imgs.push(await loadImage(DREAM(id))); } catch {}

        if (imgs.length === 0) continue;

        for (const img of imgs) {
          drawContain(ctx, img, size, size);
          classifierRef.current.addExample(embedNormalized(), String(id)); exemplars++;

          drawCover(ctx, img, size, size, 1.15, 0);
          classifierRef.current.addExample(embedNormalized(), String(id)); exemplars++;

          for (let a = 0; a < AUG_PER_SOURCE; a++) {
            drawAugmented(ctx, img, size, size);
            classifierRef.current.addExample(embedNormalized(), String(id)); exemplars++;
          }
        }

        setBuilt(id - FIRST_ID + 1);
        if (id % 10 === 0) setStatus(`Building… ${id}/${LAST_ID}`);
      }

      setStatus(`Index built. ~${exemplars} exemplars. Aim camera or import an image.`);
    } catch (err) {
      console.error(err);
      setStatus("Build error: " + String(err?.message || err));
    } finally {
      setBuilding(false);
    }
  };

  // classify from camera or imported image with a few views, then vote
  async function classifySource(source, labelForStatus) {
    try { await ensureTfReady(); } catch (e) { setStatus("TF not ready: " + String(e?.message || e)); return; }
    if (!classifierRef.current) { setStatus("Classifier missing (HMR?). Rebuild index."); return; }
    if (!modelRef.current) { setStatus("Model not loaded. Reload page."); return; }
    if (built === 0) { setStatus("Build the index first."); return; }

    const size = 224;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = size;
    canvasRef.current.height = size;

    setStatus(`Capturing from ${labelForStatus}…`);

    const views = [
      () => drawContain(ctx, source, size, size),
      () => drawCover(ctx, source, size, size, 1.1, 0.03),
      () => drawCover(ctx, source, size, size, 1.25, 0.05),
    ];

    const totals = new Map();
    for (const draw of views) {
      draw();
      await tf.nextFrame();
      const embN = embedNormalized();
      const res = await classifierRef.current.predictClass(embN, kVal);
      embN.dispose();
      Object.entries(res.confidences || {}).forEach(([label, conf]) => {
        totals.set(label, (totals.get(label) || 0) + conf);
      });
    }

    const ranked = [...totals.entries()]
      .map(([label, sum]) => ({ id: label, conf: sum }))
      .sort((a, b) => b.conf - a.conf);

    if (!ranked.length) {
      setSuggestions(null);
      setStatus("Could not identify. Try again.");
      return;
    }

    const total = ranked.reduce((acc, r) => acc + r.conf, 0) || 1;
    ranked.forEach(r => { r.conf = r.conf / total; });

    const best = ranked[0];

    if (best.conf < threshold) {
      setSuggestions(ranked.slice(0, 3));
      setStatus(`Not sure. Top guesses shown (best ${(best.conf*100).toFixed(1)}%).`);
    } else {
      setSuggestions(null);
      setStatus(`Detected #${best.id} (${(best.conf*100).toFixed(1)}%) → opening page…`);
      router.push(`/Pokemon/${best.id}`);
    }
  }

  // pick appropriate source then classify
  const scan = async () => {
    if (building) return;
    if (importedRef.current?.src) {
      await classifySource(importedRef.current.src, "image");
    } else if (camReady) {
      await waitForPlaying(videoRef.current);
      await classifySource(videoRef.current, "camera");
    } else {
      setStatus("Start the camera or import an image first.");
    }
  };

  // import image flow
  const onPickImageClick = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (importedRef.current?.objectURL) URL.revokeObjectURL(importedRef.current.objectURL);

    try {
      const loaded = await loadFileImage(file);
      importedRef.current = loaded;
      if (loaded.objectURL) setImportPreviewURL(loaded.objectURL);
      else {
        const off = document.createElement("canvas");
        off.width = loaded.src.width; off.height = loaded.src.height;
        off.getContext("2d").drawImage(loaded.src, 0, 0);
        setImportPreviewURL(off.toDataURL());
      }
      setStatus("Image loaded. Build index, then Scan.");
      setSuggestions(null);
    } catch (err) {
      console.error(err);
      setStatus("Image load error: " + String(err?.message || err));
      importedRef.current = null;
      setImportPreviewURL(null);
    } finally {
      e.target.value = "";
    }
  };

  // UI
  const tfLoaded = !!tf;

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1 className="body1-fonts">Pokémon Scanner</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 12,
            boxShadow: "var(--drop-shadow)",
            transform: "scaleX(-1)",
            background: camReady ? "#000" : "rgba(0,0,0,0.6)",
          }}
        />
        <div style={{ display: "grid", gap: 8, minWidth: 200 }}>
          <button onClick={camReady ? () => stopCamera() : startCamera} className="body2-fonts" style={btn()}>
            {camReady ? "Stop Camera" : "Start Camera"}
          </button>
          <button onClick={onPickImageClick} className="body2-fonts" style={btn()}>
            Import Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          {importPreviewURL && (
            <img
              src={importPreviewURL}
              alt="Imported preview"
              style={{ width: "100%", borderRadius: 8, boxShadow: "var(--drop-shadow)" }}
            />
          )}

          <div style={{ display: "grid", gap: 6, paddingTop: 6 }}>
            <label className="caption-fonts" style={{ display: "grid", gap: 4 }}>
              K (neighbors): {kVal}
              <input
                type="range" min={1} max={31} step={2}
                value={kVal}
                onChange={(e) => setKVal(parseInt(e.target.value, 10))}
              />
            </label>
            <label className="caption-fonts" style={{ display: "grid", gap: 4 }}>
              Decision threshold: {(threshold * 100).toFixed(0)}%
              <input
                type="range" min={0.3} max={0.8} step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
              />
            </label>
            <button
              className="body2-fonts"
              style={btn("var(--grayscale-background)", "var(--grayscale-dark)")}
              onClick={() => {
                classifierRef.current = knnClassifier.create();
                setBuilt(0);
                setSuggestions(null);
                setStatus("Index cleared. Build again.");
              }}
            >
              Clear Index
            </button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="body2-fonts" style={{ opacity: 0.85 }}>{status}</div>
      <div className="caption-fonts" style={{ opacity: 0.7 }}>
        TF: {tfLoaded ? (tf.getBackend ? tf.getBackend() : "loaded") : "not loaded"}
        {" • "}Cam: {String(camReady)}
        {" • "}Indexed IDs: {built}/{LAST_ID - FIRST_ID + 1}
        {" • "}Ready: {String(ready)}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={buildIndex}
          disabled={!ready || !tfLoaded || building || built === LAST_ID - FIRST_ID + 1}
          className="body2-fonts"
          style={btn()}
        >
          {built > 0 && built < LAST_ID - FIRST_ID + 1
            ? `Resume Build (${built}/${LAST_ID})`
            : built === 0
            ? "Build Index (Gen 1)"
            : "Rebuild Index"}
        </button>

        <button
          onClick={scan}
          disabled={!ready || !tfLoaded || building || built === 0}
          className="body2-fonts"
          style={btn("var(--identity-primary)", "white")}
        >
          {importedRef.current?.src ? "Identify Image" : "Scan & Identify"}
        </button>
      </div>

      {suggestions?.length ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => router.push(`/Pokemon/${s.id}`)}
              className="body2-fonts"
              style={btn("var(--grayscale-white)", "var(--grayscale-dark)")}
              title={`Confidence ~ ${(s.conf*100).toFixed(1)}%`}
            >
              #{String(s.id).padStart(3,"0")} — {(s.conf*100).toFixed(1)}%
            </button>
          ))}
        </div>
      ) : null}

      <p className="caption-fonts" style={{ opacity: 0.7 }}>
        Tip: On iPhone, use HTTPS (e.g., ngrok) so the camera can start.
      </p>
    </div>
  );
}

// tiny styles
function btn(bg = "var(--grayscale-white)", fg = "var(--grayscale-dark)") {
  return {
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "var(--drop-shadow)",
    cursor: "pointer",
  };
}
