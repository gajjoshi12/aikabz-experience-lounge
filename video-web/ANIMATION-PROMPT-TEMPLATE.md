# UI Motion Animation — Reusable Prompt + Storyboard Template

A toolkit for spinning up scripted "fake-app" UI motion animations (like the
iMessage → UberEats reel) as web-native HTML/CSS/JS.

---

## 1. What this is called

- **UI motion animation** / **UI animation** — animated app interfaces
- **Fake UI / scripted UI / mockup animation** — a *simulated* app flow (not a real app)
- **Kinetic typography** — the animated/typing text part
- **Motion graphics** — the broader design field
- Reel/TikTok slang: **"fake text message animation"**, **"app demo animation"**

The web version (what we build) = a **CSS/JS UI motion sequence**: a scripted
timeline of UI states.

---

## 2. The Prompt Template

Copy, fill in the `[BRACKETS]`, and paste:

```
Create a looping [ASPECT_RATIO, e.g. 9:16 portrait] UI motion animation as a
single self-contained HTML/CSS/JS file. It's a scripted fake-app sequence
(mockup, not a real app), pixel-precise on a [WIDTH]x[HEIGHT] canvas that scales
to fit the viewport, and it loops forever.

Drive the whole thing with ONE JavaScript async timeline (async/await + sleep
helpers) so every scene fires in order and stays in sync. Each scene is a
full-screen absolutely-positioned layer; show one at a time by toggling an
`.on` class; cross-fade between them with a CSS opacity transition.

Scenes in order:
1. [SCENE NAME] — [what happens, which micro-interactions]
2. [SCENE NAME] — [...]
3. [...]

Micro-interactions to use:
- [typewriter text] / [typing dots] / [cursor that glides + taps]
- [pop-in (scale bounce)] / [shimmer loader] / [progress bar fill]
- [drop-in notification] / [logo splash] / [moving map marker]

Style: [color palette, font, light/dark]. Keep it clean and modern.
No images or external dependencies — pure CSS shapes/gradients.
```

---

## 3. Prompt Ingredients That Make It Work

| Ingredient | Why it matters |
|---|---|
| **"Scene-by-scene storyboard"** | Forces a clear ordered sequence instead of vague "animate this" |
| **"ONE JS async timeline (async/await + sleep)"** | The #1 reliability trick — guarantees every scene fires in order & in sync |
| **Rough timings** ("~1.5s per scene") | Gives pacing; easy to tweak later |
| **Name the micro-interactions** | typewriter, cursor tap, bubble pop, shimmer, progress fill, drop-in |
| **Aspect ratio + fixed canvas that scales** | Pixel-precise positioning (cursor coords, bubble placement) |
| **"mockup vs real screen recording"** | Sets the visual fidelity expectation |
| **"pure CSS, no dependencies"** | Keeps it one portable file |

---

## 4. Micro-Interaction Cheat Sheet (the reusable building blocks)

- **Typewriter text** — JS loop appending one char every ~45ms
- **Typing dots** — 3 dots, staggered `@keyframes` opacity/translateY bounce
- **Bubble pop-in** — `transform:scale(.6)→1` + opacity, cubic-bezier overshoot
- **Persistent cursor** — one element, `transition:transform .55s` to glide,
  add a `.tap` class for a quick scale-down pulse
- **Shimmer loader** — pseudo-element gradient sweeping `translateX(-100%→100%)`
- **Progress fill** — `width:0→100%` keyframe
- **Drop-in notification** — `translateY(-160%→0)` with bezier overshoot
- **Splash / logo reveal** — opacity + slight scale
- **Moving map marker** — `@keyframes` animating `left/top` across a CSS map

---

## 5. The Skeleton (starter code)

Save as `index.html`, swap in your scenes:

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{height:100%;background:#111;overflow:hidden;display:flex;
    align-items:center;justify-content:center;
    font-family:-apple-system,'Segoe UI',Roboto,sans-serif;}
  .stage{position:relative;width:360px;height:640px;background:#000;
    overflow:hidden;transform-origin:top left;}
  .scene{position:absolute;inset:0;opacity:0;transition:opacity .4s ease;}
  .scene.on{opacity:1;}
  /* cursor that glides + taps */
  #cursor{position:absolute;width:30px;height:30px;z-index:50;opacity:0;
    transition:transform .55s cubic-bezier(.4,0,.2,1),opacity .25s;
    filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));}
  #cursor.show{opacity:1;}
  #cursor.tap .inner{animation:tap .4s ease;}
  @keyframes tap{0%{transform:scale(1);}45%{transform:scale(.75);}100%{transform:scale(1);}}
  /* === add your scene styles here === */
</style></head>
<body>
<div id="viewport"><div class="stage" id="stage">
  <div class="scene" id="s1"><!-- scene 1 --></div>
  <div class="scene" id="s2"><!-- scene 2 --></div>
  <!-- ...more scenes... -->
  <div id="cursor"><svg class="inner" viewBox="0 0 24 24" fill="#fff" stroke="#000"
    stroke-width="1.3" stroke-linejoin="round"><path d="M5 2.5l13.5 7.8-5.7 1.5-1.6 5.4z"/></svg></div>
</div></div>
<script>
(function(){
  const stage=document.getElementById('stage'),vp=document.getElementById('viewport');
  const $=id=>document.getElementById(id), cursor=$('cursor');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  // scale 360x640 canvas to fit the viewport
  function fit(){const s=Math.min(innerHeight/640,innerWidth/360);
    stage.style.transform=`scale(${s})`;vp.style.width=(360*s)+'px';vp.style.height=(640*s)+'px';}
  fit();addEventListener('resize',fit);

  const only=id=>document.querySelectorAll('.scene').forEach(s=>s.classList.toggle('on',s.id===id));
  const moveCursor=(x,y)=>{cursor.classList.add('show');
    cursor.style.transform=`translate(${x}px,${y}px)`;return sleep(560);};
  async function tap(){cursor.classList.remove('tap');void cursor.offsetWidth;
    cursor.classList.add('tap');await sleep(400);}
  const hideCursor=()=>cursor.classList.remove('show');

  // typewriter helper (optionally show dots first)
  async function type(el,text,dotsMs){
    if(dotsMs){el.innerHTML='<span class="dots"><i></i><i></i><i></i></span>';await sleep(dotsMs);}
    el.textContent='';
    for(let i=0;i<text.length;i++){el.textContent=text.slice(0,i+1);await sleep(45);}
  }

  async function sequence(){
    only('s1'); await sleep(1500);   // each scene: show, then dwell
    only('s2'); await sleep(1500);
    // ...add cursor moves / typing / waits to taste...
  }
  (async function loop(){while(true){await sequence();}})();
})();
</script></body></html>
```

---

## 6. AI Video Tool Prompt (Sora / Runway / Kling — if you want real video, not code)

```
Screen recording of an iPhone showing a text conversation that transitions into
a food-delivery app ordering flow. Clean modern UI motion, typing animation,
cursor tapping, smooth scene transitions, looping, 9:16 vertical.
```

---

## 7. Working Reference

`video-web/index.html` in this repo is a complete, working example built from
this exact approach (iMessage → UberEats flow). Use it as the canonical model.
```
```
