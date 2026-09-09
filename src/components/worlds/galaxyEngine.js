import { galaxyBudget, galaxyLayout } from './galaxySettings.js'

// Adapted from the supplied galaxia_mistica.html; React owns timing and lifecycle.
export function createGalaxyEngine(canvas, profile, capture = false) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D unavailable');
    let reduceMotion = false;
    let budget = galaxyBudget(profile.galaxyStars);
    let quality = profile;
    let sceneTime = 0;
    let initialized = false;
    let backgroundImage;
    let nebulaImage;
    const glowSprites = new Map();
    let seed = 170923;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const TAU = Math.PI * 2;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -9999, py: -9999, active: false };
    const stars = [];
    const galaxy = [];
    const dustLanes = [];
    const coreDust = [];
    const creationMatter = [];
    const comets = [];
    const novae = [];
    const phenomena = [];

    let w = 1, h = 1, dpr = 1, cx = 0, cy = 0, radius = 300;
    let originTime = sceneTime;
    let lastTime = originTime;
    let nextComet = originTime + 12800;
    let nextNova = originTime + 11600;
    let nextPhenomenon = originTime + 17800;
    let hoveredStar = null;

    const rand = (a, b) => a + random() * (b - a);
    const clamp = n => Math.max(0, Math.min(1, n));
    const easeOutCubic = n => 1 - Math.pow(1 - n, 3);
    const easeOutExpo = n => n >= 1 ? 1 : 1 - Math.pow(2, -10 * n);
    const gaussian = () => (random() + random() + random() + random() - 2) / 2;

    function resize() {
      w = Math.max(1, canvas.clientWidth);
      h = Math.max(1, canvas.clientHeight);
      dpr = Math.min(devicePixelRatio || 1, quality.pixelRatio);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ({ cx, cy, radius } = galaxyLayout(w, h, capture));
      seed = 170923;
      makeUniverse();
      for (const particle of galaxy) {
        particle.ink = `rgb(${particle.color.join(',')})`;
        particle.hue = particle.color[0] > 240 ? 40 : particle.color[0] < 150 ? 200 : 285;
      }
      novae.length = 0;
      comets.length = 0;
      phenomena.length = 0;
      backgroundImage = null;
      nebulaImage = null;
      initialized = true;
    }

    function makeUniverse() {
      stars.length = 0;
      galaxy.length = 0;
      dustLanes.length = 0;
      coreDust.length = 0;
      creationMatter.length = 0;

      const { stars: starCount, galaxy: galaxyCount, dust: dustCount,
        core: coreCount, birth: birthCount } = galaxyBudget(6500);

      for (let i = 0; i < starCount; i++) {
        const kindRoll = random();
        const hueRoll = random();
        stars.push({
          x: random() * w, y: random() * h,
          z: rand(.08, 1), size: random() < .065 ? rand(1.18, 2.55) : rand(.2, 1.05),
          phase: rand(0, TAU), speed: rand(.35, 1.7),
          hue: hueRoll < .12 ? rand(2,22) : hueRoll < .42 ? rand(188,225) : hueRoll < .58 ? rand(272,307) : rand(38,56),
          kind: kindRoll < .018 ? 'double' : kindRoll < .075 ? 'cross' : 'normal',
          sx: -100, sy: -100, lastNova: -Infinity
        });
      }

      for (let i = 0; i < galaxyCount; i++) {
        const arm = i % 5;
        const n = Math.pow(random(), .6);
        const r = 9 + n * radius;
        const angle = arm * TAU / 5 + r / radius * 6.2 + gaussian() * (.18 + n * .76);
        const warm = random() < .2 + (1 - n) * .25;
        const cyan = !warm && random() < .48;
        galaxy.push({
          r, angle, z: gaussian() * radius * (.025 + n * .16),
          sx: -9999, sy: -9999, lastNova: -Infinity,
          size: rand(.34, 1.65) * (1.18 - n * .28),
          alpha: rand(.22, .83) * (1.1 - n * .3),
          phase: rand(0, TAU), speed: rand(.6, 1.55),
          color: warm ? [255, rand(176,225), rand(100,165)] : cyan ? [rand(82,140), rand(155,225), 255] : [rand(165,225), rand(86,148), 255]
        });
      }

      for (let i = 0; i < dustCount; i++) {
        const arm = i % 5;
        const n = Math.pow(random(), .72);
        const r = radius * (.12 + n * .88);
        dustLanes.push({
          r,
          angle: arm * TAU / 5 + r / radius * 6.2 + .19 + gaussian() * (.09 + n * .28),
          z: gaussian() * radius * (.018 + n * .075),
          size: rand(1.1,4.8) * (.7 + n),
          alpha: rand(.025,.105) * (1.08 - n * .18),
          phase: rand(0,TAU)
        });
      }

      for (let i = 0; i < coreCount; i++) {
        const n = Math.pow(random(),1.8);
        coreDust.push({
          r: radius * (.018 + n * .23),
          angle: rand(0,TAU),
          z: gaussian() * radius * .04,
          size: rand(.35,1.5),
          alpha: rand(.22,.75),
          warm: random() < .67,
          speed: rand(.7,1.45)
        });
      }

      for (let i = 0; i < birthCount; i++) {
        const a = random() * TAU;
        creationMatter.push({
          a, curve: rand(-1.2, 1.2),
          max: rand(Math.min(w,h) * .24, Math.max(w,h) * .88),
          speed: rand(.72, 1.32), size: rand(.35, 2.05),
          phase: rand(0, TAU),
          hue: random() < .34 ? rand(30,58) : random() < .5 ? rand(190,225) : rand(270,315)
        });
      }
    }

    function* limited(array, count) {
      for (let i = 0; i < Math.min(count, array.length); i++) yield array[i];
    }

    function surface(width, height) {
      const result = document.createElement('canvas');
      result.width = width; result.height = height;
      return result;
    }

    function starGlow(hue) {
      const key = Math.round(hue / 30) * 30;
      if (!glowSprites.has(key)) {
        const sprite = surface(64, 64);
        const paint = sprite.getContext('2d');
        const glow = paint.createRadialGradient(32,32,0,32,32,32);
        glow.addColorStop(0, 'rgba(255,255,245,1)');
        glow.addColorStop(.15, `hsla(${key},100%,78%,.6)`);
        glow.addColorStop(.4, `hsla(${key},100%,60%,.12)`);
        glow.addColorStop(1, `hsla(${key},100%,55%,0)`);
        paint.fillStyle = glow; paint.fillRect(0,0,64,64);
        glowSprites.set(key, sprite);
      }
      return glowSprites.get(key);
    }

    function drawBackground(reveal) {
      ctx.fillStyle = '#01020a';
      ctx.fillRect(0, 0, w, h);
      if (reveal <= 0) return;
      ctx.save();
      ctx.globalAlpha = reveal;
      if (!backgroundImage) {
        backgroundImage = surface(Math.ceil(w / 2), Math.ceil(h / 2));
        const paint = backgroundImage.getContext('2d');
        paint.scale(.5,.5);
        const bg = paint.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.78);
        bg.addColorStop(0,'#120c2a');
        bg.addColorStop(.36,'#060719');
        bg.addColorStop(1,'#010209');
        paint.fillStyle = bg; paint.fillRect(0,0,w,h);
      }
      ctx.drawImage(backgroundImage,0,0,w,h);
      ctx.restore();
    }

    function novaDisplacement(x, y, t) {
      let offsetX = 0, offsetY = 0;
      for (const nova of novae) {
        const elapsed = t - nova.born - nova.preDelay;
        const p = elapsed / 1350;
        if (p <= 0 || p >= 1) continue;
        const dx = x - nova.x, dy = y - nova.y;
        const distance = Math.hypot(dx,dy) || 1;
        const wave = easeOutCubic(p) * 155 * nova.scale;
        const influence = Math.max(0, 1 - Math.abs(distance-wave) / 42);
        const force = influence * (1-p) * 11 * nova.scale;
        offsetX += dx / distance * force;
        offsetY += dy / distance * force;
      }
      return { x: offsetX, y: offsetY };
    }

    function drawStars(t, reveal) {
      if (reveal <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const s of limited(stars, budget.stars)) {
        const twinkle = .56 + Math.sin(t * .001 * s.speed + s.phase) * .36;
        const parallax = 4 + Math.pow(s.z,1.7) * 34;
        let x = (s.x + pointer.x * parallax + Math.sin(t*.000025+s.phase)*s.z*1.8 + w) % w;
        let y = (s.y + pointer.y * parallax * .68 + Math.cos(t*.000021+s.phase)*s.z*1.1 + h) % h;
        const push = novaDisplacement(x,y,t);
        x += push.x;
        y += push.y;
        s.sx = x;
        s.sy = y;
        const isHovered = s === hoveredStar;
        const hoverPulse = isHovered ? .7 + Math.sin(t*.008)*.3 : 0;
        const depthAlpha = .22 + Math.pow(s.z,.72) * .78;
        const alpha = Math.min(1, Math.max(.08, twinkle) * depthAlpha * reveal + hoverPulse * .5);
        const drawnSize = s.size * (.72 + s.z * .36) * (1 + hoverPulse * .48);
        if (drawnSize > 1.3 || isHovered) {
          const glowSize = drawnSize * (isHovered ? 10.5 : 6.3);
          ctx.globalAlpha = alpha;
          ctx.drawImage(starGlow(s.hue),x-glowSize,y-glowSize,glowSize*2,glowSize*2);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `hsla(${s.hue},92%,94%,${alpha})`;
        ctx.beginPath(); ctx.arc(x,y,Math.max(.22,drawnSize * twinkle),0,TAU); ctx.fill();

        if ((s.kind === 'cross' && drawnSize > 1.05) || drawnSize > 2.15 || isHovered) {
          const rayAlpha = alpha * (isHovered ? .65 : .34);
          const ray = drawnSize * (isHovered ? 7.5 : 4.8);
          ctx.strokeStyle = `hsla(${s.hue},100%,88%,${rayAlpha})`;
          ctx.lineWidth = .55;
          ctx.beginPath();
          ctx.moveTo(x-ray,y); ctx.lineTo(x+ray,y);
          ctx.moveTo(x,y-ray*.72); ctx.lineTo(x,y+ray*.72);
          ctx.stroke();
        }

        if (s.kind === 'double' && drawnSize > .85) {
          const companionAngle = s.phase;
          const companionDistance = drawnSize * 2.9;
          ctx.fillStyle = `hsla(${(s.hue+42)%360},90%,90%,${alpha*.72})`;
          ctx.beginPath();
          ctx.arc(x+Math.cos(companionAngle)*companionDistance,y+Math.sin(companionAngle)*companionDistance,Math.max(.38,drawnSize*.43),0,TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function drawCosmicClouds(t, reveal) {
      if (reveal <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = reveal * .58;
      const clouds = [
        { a: .25, d: .43, size: .52, color: [80,48,208] },
        { a: 2.18, d: .56, size: .43, color: [34,128,205] },
        { a: 3.7, d: .38, size: .48, color: [161,61,220] },
        { a: 5.25, d: .63, size: .38, color: [31,103,183] }
      ];
      for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const a = cloud.a + t * (i % 2 ? -.000003 : .0000025);
        const x = cx + Math.cos(a) * radius * cloud.d + pointer.x * (8 + i * 2);
        const y = cy + Math.sin(a) * radius * cloud.d * .45 + pointer.y * (5 + i);
        const r = radius * cloud.size;
        const [red, green, blue] = cloud.color;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, `rgba(${red},${green},${blue},.075)`);
        glow.addColorStop(.42, `rgba(${red},${green},${blue},.032)`);
        glow.addColorStop(1, `rgba(${red},${green},${blue},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawNebula(t, reveal, scale) {
      if (reveal <= 0) return;
      ctx.save();
      ctx.translate(cx + pointer.x * 11, cy + pointer.y * 7);
      ctx.rotate(pointer.x * .035 + t * .000004);
      ctx.scale(scale, scale * (.78 + pointer.y * .018));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = reveal;

      if (!nebulaImage) {
        nebulaImage = surface(768,768);
        const paint = nebulaImage.getContext('2d');
        const textureRadius = 340;
        paint.translate(384,384);
      const glow = paint.createRadialGradient(0,0,0,0,0,textureRadius * 1.08);
      glow.addColorStop(0, 'rgba(255,231,188,.27)');
      glow.addColorStop(.08, 'rgba(194,121,255,.24)');
      glow.addColorStop(.29, 'rgba(94,67,220,.12)');
      glow.addColorStop(.62, 'rgba(28,112,190,.045)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      paint.fillStyle = glow;
      paint.beginPath(); paint.arc(0,0,textureRadius * 1.08,0,TAU); paint.fill();

      for (let arm = 0; arm < 5; arm++) {
        for (let j = 1; j <= 5; j++) {
          const r = textureRadius * (j / 6) * .93;
          const a = arm * TAU / 5 + r / textureRadius * 6.2;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          const cloudR = textureRadius * (.27 - j * .018);
          const cloud = paint.createRadialGradient(x,y,0,x,y,cloudR);
          cloud.addColorStop(0, (arm + j) % 2 ? 'rgba(145,64,255,.078)' : 'rgba(50,161,255,.064)');
          cloud.addColorStop(.56, (arm + j) % 2 ? 'rgba(96,31,190,.027)' : 'rgba(28,78,180,.023)');
          cloud.addColorStop(1, 'rgba(0,0,0,0)');
          paint.fillStyle = cloud;
          paint.beginPath(); paint.arc(x,y,cloudR,0,TAU); paint.fill();
        }
      }

      }
      ctx.drawImage(nebulaImage,-radius*1.13,-radius*1.13,radius*2.26,radius*2.26);
      ctx.restore();
    }

    function drawGalaxy(t, reveal, scale) {
      if (reveal <= 0) return;
      const rotation = t * .000022;
      const tilt = .62 + pointer.y * .06;
      const cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);
      ctx.save();
      ctx.translate(cx,cy); ctx.scale(scale,scale); ctx.translate(-cx,-cy);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of limited(galaxy, budget.galaxy)) {
        const a = p.angle + rotation * (1.38 - p.r / radius * .5);
        const rawX = Math.cos(a) * p.r, rawY = Math.sin(a) * p.r;
        const projectedY = rawY * cosTilt - p.z * sinTilt;
        const depth = rawY * sinTilt + p.z * cosTilt;
        const perspective = 1 + depth / (radius * 3.2);
        let x = cx + rawX * perspective + pointer.x * (8 + depth * .025);
        let y = cy + projectedY * perspective + pointer.y * (5 + depth * .018);
        const push = novaDisplacement(x,y,t);
        x += push.x; y += push.y;
        p.sx = cx + (x - cx) * scale;
        p.sy = cy + (y - cy) * scale;
        const shimmer = .7 + Math.sin(t * .0012 * p.speed + p.phase) * .27;
        const hovered = p === hoveredStar;
        const alpha = Math.min(1,Math.max(.035, p.alpha * shimmer * reveal) + (hovered ? .35 : 0));
        const size = Math.max(.25, p.size * perspective) * (hovered ? 1.5 : 1);
        if (size > 1.1 && alpha > .34) {
          const glowSize = size * 5.5;
          ctx.globalAlpha = alpha * .32;
          ctx.drawImage(starGlow(p.hue),x-glowSize,y-glowSize,glowSize*2,glowSize*2);
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.ink;
        ctx.beginPath(); ctx.arc(x,y,size,0,TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = 'source-over';
      for (const dust of limited(dustLanes, budget.dust)) {
        const a = dust.angle + rotation * (1.34 - dust.r / radius * .48);
        const rawX = Math.cos(a) * dust.r, rawY = Math.sin(a) * dust.r;
        const projectedY = rawY * cosTilt - dust.z * sinTilt;
        const depth = rawY * sinTilt + dust.z * cosTilt;
        const perspective = 1 + depth / (radius * 3.2);
        const x = cx + rawX * perspective + pointer.x * (7 + depth * .018);
        const y = cy + projectedY * perspective + pointer.y * (4 + depth * .012);
        const dustPulse = .72 + Math.sin(t*.00034+dust.phase)*.18;
        ctx.fillStyle = `rgba(0,1,12,${dust.alpha*dustPulse*reveal})`;
        ctx.beginPath();
        ctx.arc(x,y,dust.size*perspective,0,TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'lighter';
      const coreR = radius * (.14 + Math.sin(t * .00075) * .004);
      const core = ctx.createRadialGradient(cx,cy,0,cx,cy,coreR * 4.15);
      core.addColorStop(0, `rgba(255,244,204,${.84 * reveal})`);
      core.addColorStop(.045, `rgba(255,202,117,${.74 * reveal})`);
      core.addColorStop(.16, `rgba(228,143,255,${.47 * reveal})`);
      core.addColorStop(.38, `rgba(106,99,235,${.25 * reveal})`);
      core.addColorStop(.72, `rgba(42,151,205,${.1 * reveal})`);
      core.addColorStop(1, 'rgba(20,16,100,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx,cy,coreR * 4.15,0,TAU); ctx.fill();

      for (const grain of limited(coreDust, budget.core)) {
        const a = grain.angle + rotation * 4.8 * grain.speed;
        const rawX = Math.cos(a) * grain.r;
        const rawY = Math.sin(a) * grain.r;
        const x = cx + rawX + pointer.x * 5;
        const y = cy + rawY * .44 - grain.z * .22 + pointer.y * 3;
        const alpha = grain.alpha * reveal * (.7 + Math.sin(t*.002*grain.speed+grain.angle)*.24);
        ctx.fillStyle = grain.warm ? `rgba(255,198,113,${alpha})` : `rgba(174,126,255,${alpha})`;
        ctx.beginPath(); ctx.arc(x,y,grain.size,0,TAU); ctx.fill();
      }

      const inner = ctx.createRadialGradient(cx,cy,0,cx,cy,coreR*.72);
      inner.addColorStop(0, `rgba(255,251,225,${.94*reveal})`);
      inner.addColorStop(.16, `rgba(255,204,126,${.82*reveal})`);
      inner.addColorStop(.55, `rgba(183,96,241,${.23*reveal})`);
      inner.addColorStop(1, 'rgba(93,40,190,0)');
      ctx.fillStyle = inner;
      ctx.beginPath(); ctx.arc(cx,cy,coreR*.72,0,TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,239,190,${.9 * reveal})`;
      ctx.beginPath(); ctx.arc(cx,cy,Math.max(1.25,coreR * .045),0,TAU); ctx.fill();
      ctx.restore();
    }

    function drawCreation(t) {
      const age = t - originTime;
      if (age < 650 || age > 7350) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      if (age < 2450) {
        const gather = easeOutCubic(clamp((age-650) / 1800));
        const pulse = .76 + Math.sin(age * (.009 + gather*.018)) * .24;
        const pointR = 1.1 + gather * 5.2 * pulse;
        const glowR = 86 - gather * 48 + pulse * 7;

        for (let i = 0; i < budget.birth; i += 3) {
          const matter = creationMatter[i];
          const dist = 7 + (1-gather) * Math.min(matter.max*.23,Math.min(w,h)*.3);
          const a = matter.a - gather * matter.curve * .85;
          const x = cx + Math.cos(a)*dist;
          const y = cy + Math.sin(a)*dist*.74;
          const fade = gather * (.2 + matter.size*.2);
          ctx.fillStyle = `hsla(${matter.hue},100%,78%,${fade})`;
          ctx.beginPath(); ctx.arc(x,y,Math.max(.25,matter.size*.52),0,TAU); ctx.fill();
        }

        const point = ctx.createRadialGradient(cx,cy,0,cx,cy,glowR);
        point.addColorStop(0, 'rgba(255,255,255,1)');
        point.addColorStop(.08, `rgba(255,226,159,${.68 + .28 * gather})`);
        point.addColorStop(.32, `rgba(201,103,255,${.18 + .45 * gather})`);
        point.addColorStop(1, 'rgba(77,33,210,0)');
        ctx.fillStyle = point;
        ctx.beginPath(); ctx.arc(cx,cy,glowR,0,TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${.75+gather*.25})`;
        ctx.beginPath(); ctx.arc(cx,cy,pointR,0,TAU); ctx.fill();
      }

      if (age >= 2380) {
        const p = clamp((age - 2380) / 4300);
        const expansion = easeOutExpo(p);
        const flash = Math.max(0, 1 - p * 11.5);
        if (flash > 0) {
          ctx.globalAlpha = flash * .65;
          const lightR = radius * .8;
          ctx.drawImage(starGlow(40),cx-lightR,cy-lightR,lightR*2,lightR*2);
          ctx.globalAlpha = 1;
        }

        for (let ring = 0; ring < 4; ring++) {
          const rp = clamp(p * 1.16 - ring * .085);
          if (rp <= 0) continue;
          const rr = easeOutCubic(rp) * radius * (1.1 + ring * .45);
          const alpha = Math.max(0, Math.pow(1 - rp, 2) * (.28 - ring * .045));
          ctx.strokeStyle = ring % 2 ? `rgba(187,102,255,${alpha})` : `rgba(126,215,255,${alpha})`;
          ctx.lineWidth = Math.max(.5, 1.8 - ring*.3);
          ctx.beginPath(); ctx.arc(cx,cy,rr,0,TAU); ctx.stroke();
        }

        for (const m of limited(creationMatter, budget.birth)) {
          const local = clamp(p * m.speed);
          const dist = easeOutExpo(local) * m.max;
          const a = m.a + m.curve * local * .52;
          const x = cx + Math.cos(a) * dist;
          const y = cy + Math.sin(a) * dist * (.68 + Math.sin(m.phase) * .17);
          const fade = Math.max(0, 1 - Math.pow(local, 2.3));
          const tail = Math.min(38, m.max * .06) * Math.exp(-local * 5);
          if (tail > 1) {
            ctx.strokeStyle = `hsla(${m.hue},100%,78%,${fade * .38})`;
            ctx.lineWidth = Math.max(.45,m.size * .5);
            ctx.beginPath();
            ctx.moveTo(x-Math.cos(a)*tail,y-Math.sin(a)*tail*(.68+Math.sin(m.phase)*.17));
            ctx.lineTo(x,y); ctx.stroke();
          }
          ctx.fillStyle = `hsla(${m.hue},100%,${70 + m.size * 8}%,${fade * .9})`;
          ctx.beginPath(); ctx.arc(x,y,m.size * (1.12 - local * .45),0,TAU); ctx.fill();
        }

        const blastR = radius * (.04 + expansion * .22);
        const blast = ctx.createRadialGradient(cx,cy,0,cx,cy,blastR * 3.5);
        blast.addColorStop(0, `rgba(255,255,255,${Math.max(0,1-p)})`);
        blast.addColorStop(.13, `rgba(255,196,122,${Math.max(0,.88-p)})`);
        blast.addColorStop(.38, `rgba(190,86,255,${Math.max(0,.58-p*.55)})`);
        blast.addColorStop(1, 'rgba(35,30,190,0)');
        ctx.fillStyle = blast;
        ctx.beginPath(); ctx.arc(cx,cy,blastR * 3.5,0,TAU); ctx.fill();
      }
      ctx.restore();
    }

    function novaPalette() {
      const sets = [[195,225,255],[218,137,255],[255,194,112],[116,224,255]];
      return sets[Math.floor(random() * sets.length)];
    }

    function spawnNova(star, scale = .65, automatic = false) {
      if (!star) return false;
      if (novae.length >= budget.novae) novae.shift();
      const debris = [];
      const count = Math.round((automatic ? 18 : 26) * budget.effects);
      for (let i = 0; i < count; i++) {
        debris.push({ a: random() * TAU, speed: rand(.55,1.25), size: rand(.4,1.45), bend: rand(-.4,.4) });
      }
      const born = sceneTime;
      star.lastNova = born;
      novae.push({
        star, x: star.sx, y: star.sy, scale, automatic, born,
        preDelay: automatic ? rand(820,1180) : 720,
        blastDuration: automatic ? 1650 : 1850,
        remnantDuration: rand(3000,4100),
        color: novaPalette(), debris, spin: rand(-1,1)
      });
      return true;
    }

    function* interactiveStars() {
      yield* limited(stars, budget.stars);
      yield* limited(galaxy, budget.galaxy);
    }

    function nearestVisibleStar(x, y, maxDistance = 58) {
      let nearest = null;
      let nearestDistance = maxDistance * maxDistance;
      const now = sceneTime;
      for (const star of interactiveStars()) {
        if (now - star.lastNova < 6200) continue;
        const dx = star.sx - x;
        const dy = star.sy - y;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = star;
          nearestDistance = distance;
        }
      }
      return nearest;
    }

    function nearestHoverStar(x, y, maxDistance = 78) {
      let nearest = null;
      let nearestDistance = maxDistance * maxDistance;
      for (const star of interactiveStars()) {
        const dx = star.sx-x, dy = star.sy-y;
        const distance = dx*dx+dy*dy;
        if (distance < nearestDistance) {
          nearest = star;
          nearestDistance = distance;
        }
      }
      return nearest;
    }

    function randomVisibleStar() {
      const now = sceneTime;
      const candidates = stars.slice(0,budget.stars).filter(star =>
        star.size > 1.28 &&
        star.sx > 24 && star.sx < w - 24 &&
        star.sy > 24 && star.sy < h - 24 &&
        now - star.lastNova > 6200
      );
      return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
    }

    function explodeStar(star, scale, automatic) {
      return spawnNova(star,scale,automatic);
    }

    function drawNovae(t) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = novae.length - 1; i >= 0; i--) {
        const n = novae[i];
        const elapsed = t-n.born;
        const totalLife = n.preDelay+n.blastDuration+n.remnantDuration;
        if (elapsed >= totalLife) { novae.splice(i,1); continue; }
        if (elapsed < n.preDelay && n.star) {
          n.x = n.star.sx;
          n.y = n.star.sy;
        }
        const [r,g,b] = n.color;

        if (elapsed < n.preDelay) {
          const pre = clamp(elapsed/n.preDelay);
          const charge = easeOutCubic(pre);
          const pulse = .72+Math.sin(elapsed*.026)*.28;
          const chargeR = (7+charge*21)*n.scale;
          const charging = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,chargeR);
          charging.addColorStop(0,`rgba(255,255,255,${.72+charge*.28})`);
          charging.addColorStop(.18,`rgba(147,216,255,${(.35+charge*.54)*pulse})`);
          charging.addColorStop(.56,`rgba(104,113,255,${charge*.22})`);
          charging.addColorStop(1,'rgba(79,48,210,0)');
          ctx.fillStyle = charging;
          ctx.beginPath(); ctx.arc(n.x,n.y,chargeR,0,TAU); ctx.fill();
          ctx.strokeStyle = `rgba(195,232,255,${charge*.42})`;
          ctx.lineWidth = .65;
          ctx.beginPath(); ctx.arc(n.x,n.y,(5+charge*11)*n.scale,0,TAU); ctx.stroke();
          const ray = (4+charge*15)*n.scale;
          ctx.strokeStyle = `rgba(235,247,255,${charge*.6*pulse})`;
          ctx.beginPath();
          ctx.moveTo(n.x-ray,n.y); ctx.lineTo(n.x+ray,n.y);
          ctx.moveTo(n.x,n.y-ray); ctx.lineTo(n.x,n.y+ray);
          ctx.stroke();
          continue;
        }

        const blastElapsed = elapsed-n.preDelay;
        if (blastElapsed < n.blastDuration) {
          const p = clamp(blastElapsed/n.blastDuration);
          const bloom = Math.sin(Math.min(1,p*3)*Math.PI/2);
          const fade = Math.pow(1-p,1.3);
          const ringR = easeOutCubic(p)*82*n.scale;

          const halo = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,(20+62*bloom)*n.scale);
          halo.addColorStop(0,`rgba(255,255,255,${fade})`);
          halo.addColorStop(.1,`rgba(${r},${g},${b},${fade*.88})`);
          halo.addColorStop(.4,`rgba(${r},${g},${b},${fade*.24})`);
          halo.addColorStop(1,`rgba(${r},${g},${b},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(n.x,n.y,(20+62*bloom)*n.scale,0,TAU); ctx.fill();

          ctx.strokeStyle = `rgba(${r},${g},${b},${fade*.72})`;
          ctx.lineWidth = Math.max(.55,1.8*n.scale*fade);
          ctx.beginPath(); ctx.arc(n.x,n.y,ringR,0,TAU); ctx.stroke();

          for (let ray=0;ray<8;ray++) {
            const a=ray*TAU/8+n.spin*p;
            const inner=3*n.scale, outer=(14+36*bloom)*n.scale;
            const grad=ctx.createLinearGradient(n.x+Math.cos(a)*inner,n.y+Math.sin(a)*inner,n.x+Math.cos(a)*outer,n.y+Math.sin(a)*outer);
            grad.addColorStop(0,`rgba(255,255,255,${fade*.75})`);
            grad.addColorStop(1,`rgba(${r},${g},${b},0)`);
            ctx.strokeStyle=grad;
            ctx.lineWidth=ray%2?.7:1.1;
            ctx.beginPath();
            ctx.moveTo(n.x+Math.cos(a)*inner,n.y+Math.sin(a)*inner);
            ctx.lineTo(n.x+Math.cos(a)*outer,n.y+Math.sin(a)*outer);
            ctx.stroke();
          }

          for (const d of n.debris) {
            const dist=easeOutCubic(p)*118*n.scale*d.speed;
            const a=d.a+d.bend*p;
            ctx.fillStyle=`rgba(${r},${g},${b},${fade*.82})`;
            ctx.beginPath();
            ctx.arc(n.x+Math.cos(a)*dist,n.y+Math.sin(a)*dist,d.size*n.scale,0,TAU);
            ctx.fill();
          }
          continue;
        }

        const remnant = clamp((blastElapsed-n.blastDuration)/n.remnantDuration);
        const remnantFade = Math.pow(1-remnant,1.7)*.25;
        const drift = remnant*11*n.scale;
        const cloudR = (54+remnant*72)*n.scale;
        const cloud = ctx.createRadialGradient(n.x+Math.cos(n.spin)*drift,n.y+Math.sin(n.spin)*drift*.55,0,n.x,n.y,cloudR);
        cloud.addColorStop(0,`rgba(${r},${g},${b},${remnantFade})`);
        cloud.addColorStop(.38,`rgba(${Math.min(255,r+20)},${Math.max(0,g-30)},255,${remnantFade*.52})`);
        cloud.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle=cloud;
        ctx.beginPath(); ctx.arc(n.x,n.y,cloudR,0,TAU); ctx.fill();
      }
      ctx.restore();
    }

    function spawnPhenomenon() {
      const type = random() < .68 ? 'nebula' : 'eclipse';
      let x, y;
      do {
        x = rand(w*.12,w*.88);
        y = rand(h*.12,h*.82);
      } while (Math.hypot(x-cx,y-cy) < Math.min(w,h)*.2);
      phenomena.push({
        type,x,y,born:sceneTime,
        duration:type === 'nebula' ? rand(7600,10800) : rand(5200,7200),
        size:type === 'nebula' ? rand(100,220) : rand(13,24),
        hue:random()<.5?rand(188,218):rand(272,308),
        drift:rand(-1,1)
      });
      if (phenomena.length > 2) phenomena.shift();
    }

    function drawPhenomena(t, layer) {
      ctx.save();
      for (let i=phenomena.length-1;i>=0;i--) {
        const event=phenomena[i];
        const p=(t-event.born)/event.duration;
        if (p>=1) { phenomena.splice(i,1); continue; }
        const fade=Math.sin(clamp(p)*Math.PI);
        const x=event.x+event.drift*p*24;
        const y=event.y-event.drift*p*9;
        if (event.type==='nebula' && layer==='back') {
          ctx.globalCompositeOperation='lighter';
          const size=event.size*(.74+p*.32);
          const mist=ctx.createRadialGradient(x,y,0,x,y,size);
          mist.addColorStop(0,`hsla(${event.hue},92%,64%,${fade*.075})`);
          mist.addColorStop(.38,`hsla(${event.hue+28},86%,52%,${fade*.038})`);
          mist.addColorStop(1,`hsla(${event.hue},80%,30%,0)`);
          ctx.fillStyle=mist;
          ctx.beginPath();ctx.arc(x,y,size,0,TAU);ctx.fill();
        }
        if (event.type==='eclipse' && layer==='front') {
          ctx.globalCompositeOperation='source-over';
          const size=event.size*(.9+fade*.12);
          const halo=ctx.createRadialGradient(x,y,size*.72,x,y,size*2.25);
          halo.addColorStop(0,`hsla(${event.hue},100%,83%,${fade*.32})`);
          halo.addColorStop(.34,`hsla(${event.hue+30},100%,63%,${fade*.12})`);
          halo.addColorStop(1,`hsla(${event.hue},100%,50%,0)`);
          ctx.fillStyle=halo;
          ctx.beginPath();ctx.arc(x,y,size*2.25,0,TAU);ctx.fill();
          ctx.fillStyle=`rgba(0,1,8,${fade*.96})`;
          ctx.beginPath();ctx.arc(x,y,size,0,TAU);ctx.fill();
          ctx.strokeStyle=`hsla(${event.hue},100%,88%,${fade*.36})`;
          ctx.lineWidth=.75;
          ctx.beginPath();ctx.arc(x,y,size*1.04,0,TAU);ctx.stroke();
        }
      }
      ctx.restore();
    }

    function spawnComet() {
      const left = random() < .5;
      comets.push({
        x: left ? rand(-90,w*.22) : rand(w*.58,w+90), y: rand(h*.05,h*.34),
        vx: left ? rand(5.5,9.2) : -rand(5.5,9.2), vy: rand(2.1,4.3),
        life: 0, max: rand(55,95), hue: random() < .5 ? 202 : 286
      });
    }

    function drawComets(dt) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx * dt / 16.667; c.y += c.vy * dt / 16.667; c.life += dt / 16.667;
        const fade = Math.sin(Math.min(1,c.life/18)*Math.PI/2) * Math.max(0,1-c.life/c.max);
        const tx = c.x-c.vx*11, ty = c.y-c.vy*11;
        const grad = ctx.createLinearGradient(c.x,c.y,tx,ty);
        grad.addColorStop(0,`hsla(${c.hue},100%,96%,${fade})`);
        grad.addColorStop(.22,`hsla(${c.hue},100%,70%,${fade*.62})`);
        grad.addColorStop(1,`hsla(${c.hue},100%,55%,0)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.35;
        ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(tx,ty); ctx.stroke();
        if (c.life >= c.max) comets.splice(i,1);
      }
      ctx.restore();
    }

    function frame(now) {
      const dt = Math.min(80, Math.max(0, now-lastTime));
      lastTime = now;
      pointer.x += (pointer.tx-pointer.x) * Math.min(.08,dt*.004);
      pointer.y += (pointer.ty-pointer.y) * Math.min(.08,dt*.004);

      const age = now-originTime;
      const worldReveal = easeOutCubic(clamp((age-2420)/4300));
      const starReveal = easeOutCubic(clamp((age-2920)/3450));
      const galaxyScale = .012 + easeOutExpo(clamp((age-2380)/4700)) * .988;

      hoveredStar = pointer.active && age > 6900 ? nearestHoverStar(pointer.px,pointer.py,w<700?56:78) : null;
      canvas.style.cursor = hoveredStar ? 'pointer' : 'crosshair';

      drawBackground(worldReveal);
      drawPhenomena(now,'back');
      drawStars(now,starReveal);
      drawCosmicClouds(now,worldReveal);
      drawNebula(now,worldReveal,galaxyScale);
      drawGalaxy(now,worldReveal,galaxyScale);
      drawCreation(now);
      drawComets(dt);
      drawPhenomena(now,'front');
      drawNovae(now);

      if (!reduceMotion && !capture && age > 8200 && now > nextComet) {
        spawnComet();
        nextComet = now + rand(11000,23000);
      }
      if (!reduceMotion && !capture && age > 9000 && now > nextNova) {
        explodeStar(randomVisibleStar(), rand(.38,.66), true);
        nextNova = now + rand(8500,15500);
      }
      if (!reduceMotion && !capture && age > 10500 && now > nextPhenomenon) {
        spawnPhenomenon();
        nextPhenomenon = now + rand(19000,36000);
      }

    }

    function movePointer(x,y) {
      pointer.tx = Math.max(-1,Math.min(1,x/w*2-1));
      pointer.ty = Math.max(-1,Math.min(1,y/h*2-1));
      pointer.px = x;
      pointer.py = y;
      pointer.active = true;
    }


    function configure(nextProfile) {
      quality = nextProfile;
      budget = galaxyBudget(nextProfile.galaxyStars);
      if (initialized) {
        const nextDpr = Math.min(devicePixelRatio || 1, quality.pixelRatio);
        if (nextDpr !== dpr) {
          dpr = nextDpr;
          canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
          ctx.setTransform(dpr,0,0,dpr,0,0);
        }
      }
    }

    function draw(age, motion = true) {
      reduceMotion = !motion;
      sceneTime = age * 1000;
      frame(sceneTime);
    }

    function touch(x, y, age) {
      if (age < 7 || reduceMotion) return false;
      x ??= cx; y ??= cy;
      movePointer(x,y);
      const star = nearestVisibleStar(x,y,Math.max(48,Math.min(w,h)*.13));
      return explodeStar(star,.72,false);
    }

    function reset() {
      novae.length = 0; comets.length = 0; phenomena.length = 0;
      for (const star of interactiveStars()) star.lastNova = -Infinity;
      sceneTime = 0; originTime = 0; lastTime = 0;
      nextComet = 12800; nextNova = 11600; nextPhenomenon = 17800;
    }

    resize();
    return { draw, resize, configure, touch, reset, movePointer,
      leave() { pointer.tx=0; pointer.ty=0; pointer.active=false; },
      dispose() {
        stars.length=0; galaxy.length=0; dustLanes.length=0; coreDust.length=0;
        creationMatter.length=0; novae.length=0; comets.length=0; phenomena.length=0;
        glowSprites.clear(); backgroundImage=null; nebulaImage=null;
      },
    };
}
