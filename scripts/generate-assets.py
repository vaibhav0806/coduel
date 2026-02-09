#!/usr/bin/env python3
"""
GitGud Brand Asset Generator
─────────────────────────────
Cyber-terminal aesthetic with multi-layered neon glow,
CRT scanlines, hex grid texture, and HUD framing.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import math
import random
import os

# ── Paths ──────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'assets', 'images')
FONT_BOLD  = '/System/Library/Fonts/Supplemental/Courier New Bold.ttf'

# ── Palette ────────────────────────────────────────────────────────
NEON       = (57, 255, 20)       # #39FF14  core brand green
NEON_OUTER = (30, 255, 120)      # teal-shifted outer glow
BG         = (15, 15, 26)        # #0F0F1A  primary dark
WHITE      = (255, 255, 255)


# ── Utilities ──────────────────────────────────────────────────────

def lerp_color(c1, c2, t):
    """Linearly interpolate two RGB tuples."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_chevron(draw, cx, cy, w, h, notch, fill):
    """Draw a bold > chevron as a polygon (not font text)."""
    draw.polygon([
        (cx - w / 2, cy - h / 2),      # top-left
        (cx + w / 2, cy),               # right tip
        (cx - w / 2, cy + h / 2),       # bottom-left
        (cx - w / 2 + notch, cy),       # inner notch
    ], fill=fill)


def glow_composite(base, draw_fn, passes):
    """Build multi-layered glow by blurring + compositing."""
    for blur_r, opacity, color in passes:
        layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        draw_fn(d, color[:3] + (min(255, opacity),))
        if blur_r > 0:
            layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
        base = Image.alpha_composite(base, layer)
    return base


def radial_gradient_layer(size, radius_frac=0.55, peak_brightness=15, alpha=30):
    """Subtle center-bright radial gradient on transparent layer."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = size // 2, size // 2
    max_r = int(size * radius_frac)
    for r in range(max_r, 0, -4):
        b = int(peak_brightness * (1 - r / max_r))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(b, b, b + 3, alpha))
    return layer


def hex_grid_layer(size, cell_r=24, color=NEON, alpha=5):
    """Subtle hexagonal mesh background."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    row_h = cell_r * math.sqrt(3)
    col_w = cell_r * 1.5
    for row in range(int(size / row_h) + 2):
        for col in range(int(size / col_w) + 2):
            hx = col * col_w
            hy = row * row_h + (col % 2) * row_h / 2
            pts = [(hx + cell_r * 0.85 * math.cos(math.pi / 3 * i),
                     hy + cell_r * 0.85 * math.sin(math.pi / 3 * i))
                    for i in range(6)]
            d.polygon(pts, outline=color + (alpha,))
    return layer


def hud_brackets_layer(size, margin, length, thickness=2, color=NEON, alpha=30):
    """HUD-style targeting brackets in each corner."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = color + (alpha,)
    m, ln = margin, length
    corners = [
        # (start_h, end_h, start_v, end_v)
        ((m, m, m + ln, m),          (m, m, m, m + ln)),          # top-left
        ((size-m, m, size-m-ln, m),  (size-m, m, size-m, m+ln)),  # top-right
        ((m, size-m, m+ln, size-m),  (m, size-m, m, size-m-ln)),  # bottom-left
        ((size-m, size-m, size-m-ln, size-m), (size-m, size-m, size-m, size-m-ln)),
    ]
    for h_line, v_line in corners:
        d.line(h_line, fill=c, width=thickness)
        d.line(v_line, fill=c, width=thickness)
    return layer


def scanlines_layer(size, spacing=3, alpha=14):
    """CRT scanline overlay."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for y in range(0, size, spacing):
        d.line([(0, y), (size, y)], fill=(0, 0, 0, alpha))
    return layer


def vignette(img, strength=0.55):
    """CRT-style darkened edges."""
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    m = int(w * 0.05)
    d.ellipse([m, m, w - m, h - m], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(w // 3))
    inv = ImageOps.invert(mask)
    dark = Image.new('RGBA', (w, h), (5, 5, 18, 0))
    dark.putalpha(inv.point(lambda x: int(x * strength)))
    return Image.alpha_composite(img, dark)


def chevron_highlight_layer(size, cx, cy, w, h):
    """Subtle specular highlight along the upper arm of the chevron."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # Upper arm: top-left → right tip
    x1, y1 = cx - w / 2 + w * 0.08, cy - h / 2 + h * 0.06
    x2, y2 = cx + w / 2 - w * 0.05, cy - h * 0.02
    d.line([(x1, y1), (x2, y2)], fill=WHITE + (35,), width=3)
    layer = layer.filter(ImageFilter.GaussianBlur(4))
    return layer


# ── Icon ───────────────────────────────────────────────────────────

def create_icon(size=1024):
    img = Image.new('RGBA', (size, size), BG + (255,))

    # Background atmosphere
    img = Image.alpha_composite(img, radial_gradient_layer(size, 0.55, 15, 30))
    img = Image.alpha_composite(img, hex_grid_layer(size, cell_r=28, alpha=5))
    img = Image.alpha_composite(img, hud_brackets_layer(
        size, margin=int(size * 0.08), length=int(size * 0.12),
        thickness=2, alpha=22))

    # ── Chevron geometry ──
    chev_cx    = size * 0.44
    chev_cy    = size * 0.50
    chev_w     = size * 0.46
    chev_h     = size * 0.48
    chev_notch = chev_w * 0.38

    # Multi-layered glow: teal outer → green inner (color-shifted neon)
    chev_glow = [
        (90,  10,  NEON_OUTER),
        (60,  18,  NEON_OUTER),
        (40,  30,  lerp_color(NEON_OUTER, NEON, 0.3)),
        (25,  50,  lerp_color(NEON_OUTER, NEON, 0.6)),
        (12,  85,  NEON),
        (4,   150, NEON),
        (0,   255, NEON),
    ]
    img = glow_composite(img,
        lambda d, c: draw_chevron(d, chev_cx, chev_cy, chev_w, chev_h, chev_notch, c),
        chev_glow)

    # Specular highlight on upper arm
    img = Image.alpha_composite(img,
        chevron_highlight_layer(size, chev_cx, chev_cy, chev_w, chev_h))

    # ── Cursor block ──
    cur_x = chev_cx + chev_w / 2 + size * 0.025
    cur_h = size * 0.14
    cur_y = chev_cy - cur_h * 0.35
    cur_w = size * 0.06

    cur_glow = [
        (22, 20,  NEON_OUTER),
        (10, 55,  NEON),
        (3,  125, NEON),
        (0,  230, NEON),
    ]
    img = glow_composite(img,
        lambda d, c: d.rounded_rectangle(
            [cur_x, cur_y, cur_x + cur_w, cur_y + cur_h], radius=4, fill=c),
        cur_glow)

    # Finishing passes
    img = Image.alpha_composite(img, scanlines_layer(size, spacing=3, alpha=12))
    img = vignette(img, 0.45)

    img.convert('RGB').save(os.path.join(OUTPUT_DIR, 'icon.png'), 'PNG')
    print('  icon.png')


# ── Splash Screen ─────────────────────────────────────────────────

def create_splash(size=1024):
    img = Image.new('RGBA', (size, size), BG + (255,))

    # Atmosphere
    img = Image.alpha_composite(img, radial_gradient_layer(size, 0.5, 10, 25))

    # Matrix rain particles
    rain = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rain)
    random.seed(77)
    for _ in range(110):
        x = random.randint(0, size)
        start_y = random.randint(0, size)
        length = random.randint(3, 7)
        for j in range(length):
            y = start_y + j * 14
            if 0 <= y < size:
                a = max(3, 14 - j * 3)
                r = random.choice([1, 1, 2])
                rd.ellipse([x - r, y - r, x + r, y + r], fill=NEON + (a,))
    img = Image.alpha_composite(img, rain.filter(ImageFilter.GaussianBlur(1)))

    # HUD brackets (tighter around text area)
    img = Image.alpha_composite(img, hud_brackets_layer(
        size, margin=int(size * 0.18), length=int(size * 0.08),
        thickness=1, alpha=18))

    # Accent lines framing text
    accent = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ad = ImageDraw.Draw(accent)
    lm = int(size * 0.22)
    ad.line([(lm, int(size * 0.42)), (size - lm, int(size * 0.42))],
            fill=NEON + (12,), width=1)
    ad.line([(lm, int(size * 0.58)), (size - lm, int(size * 0.58))],
            fill=NEON + (12,), width=1)
    img = Image.alpha_composite(img, accent)

    # ── Text: "$ git gud" with glow ──
    font_size = int(size * 0.085)
    font = ImageFont.truetype(FONT_BOLD, font_size)
    parts = [('$ ', NEON), ('git', WHITE), (' gud', NEON)]

    # Measure total width
    tmp_d = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    total_w = sum(tmp_d.textlength(t, font=font) for t, _ in parts)
    tx_start = (size - total_w) / 2
    ty = size * 0.465

    # Glow passes: outer layers use uniform teal, inner layers use per-part colors
    text_passes = [
        (50, 12,  NEON_OUTER),      # wide ambient
        (30, 22,  NEON_OUTER),
        (15, 45,  NEON),
        (8,  80,  None),            # None → per-part color
        (3,  140, None),
        (0,  255, None),
    ]
    for blur_r, opacity, override in text_passes:
        layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        x = tx_start
        for text, color in parts:
            c = (override or color) + (min(255, opacity),)
            ld.text((x, ty), text, fill=c, font=font)
            x += ld.textlength(text, font=font)
        if blur_r > 0:
            layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
        img = Image.alpha_composite(img, layer)

    # Blinking cursor block
    cur_x = tx_start + total_w + 6
    cur_y = ty + font_size * 0.1
    cur_w = font_size * 0.48
    cur_h = font_size * 0.78

    for blur_r, alpha in [(12, 25), (5, 70), (0, 150)]:
        layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.rectangle([cur_x, cur_y, cur_x + cur_w, cur_y + cur_h],
                     fill=NEON + (alpha,))
        if blur_r > 0:
            layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
        img = Image.alpha_composite(img, layer)

    # Finishing
    img = Image.alpha_composite(img, scanlines_layer(size, spacing=3, alpha=15))
    img = vignette(img, 0.6)

    img.convert('RGB').save(os.path.join(OUTPUT_DIR, 'splash-icon.png'), 'PNG')
    print('  splash-icon.png')


# ── Adaptive Icon (Android) ───────────────────────────────────────

def create_adaptive_icon(size=1024):
    img = Image.new('RGBA', (size, size), BG + (255,))

    img = Image.alpha_composite(img, radial_gradient_layer(size, 0.45, 12, 25))
    img = Image.alpha_composite(img, hex_grid_layer(size, cell_r=22, alpha=4))

    # Chevron in safe zone (~66%)
    safe = size * 0.66
    chev_cx    = size * 0.46
    chev_cy    = size * 0.50
    chev_w     = safe * 0.52
    chev_h     = safe * 0.55
    chev_notch = chev_w * 0.38

    glow_passes = [
        (70,  10,  NEON_OUTER),
        (45,  18,  NEON_OUTER),
        (30,  32,  lerp_color(NEON_OUTER, NEON, 0.4)),
        (18,  55,  NEON),
        (8,   95,  NEON),
        (3,   155, NEON),
        (0,   255, NEON),
    ]
    img = glow_composite(img,
        lambda d, c: draw_chevron(d, chev_cx, chev_cy, chev_w, chev_h, chev_notch, c),
        glow_passes)

    # Highlight
    img = Image.alpha_composite(img,
        chevron_highlight_layer(size, chev_cx, chev_cy, chev_w, chev_h))

    # Cursor
    cur_x = chev_cx + chev_w / 2 + size * 0.02
    cur_h = safe * 0.155
    cur_y = chev_cy - cur_h * 0.35
    cur_w = safe * 0.055

    cur_glow = [(18, 20, NEON_OUTER), (8, 55, NEON), (3, 125, NEON), (0, 230, NEON)]
    img = glow_composite(img,
        lambda d, c: d.rounded_rectangle(
            [cur_x, cur_y, cur_x + cur_w, cur_y + cur_h], radius=3, fill=c),
        cur_glow)

    img = Image.alpha_composite(img, scanlines_layer(size, spacing=3, alpha=10))

    img.convert('RGB').save(os.path.join(OUTPUT_DIR, 'adaptive-icon.png'), 'PNG')
    print('  adaptive-icon.png')


# ── Favicon ────────────────────────────────────────────────────────

def create_favicon(size=48):
    img = Image.new('RGBA', (size, size), BG + (255,))

    cx, cy = size * 0.44, size * 0.50
    w, h   = size * 0.58, size * 0.62
    notch  = w * 0.35

    # Minimal glow at this tiny size
    for blur_r, alpha in [(3, 50, ), (1, 130), (0, 255)]:
        layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        draw_chevron(d, cx, cy, w, h, notch, NEON + (min(255, alpha),))
        if blur_r > 0:
            layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
        img = Image.alpha_composite(img, layer)

    # Tiny cursor
    d = ImageDraw.Draw(img)
    cur_x = cx + w / 2 + 2
    d.rectangle([cur_x, cy - 3, cur_x + 4, cy + 5], fill=NEON + (200,))

    img.convert('RGB').save(os.path.join(OUTPUT_DIR, 'favicon.png'), 'PNG')
    print('  favicon.png')


# ── Main ───────────────────────────────────────────────────────────

if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print('Generating GitGud brand assets...\n')
    create_icon()
    create_splash()
    create_adaptive_icon()
    create_favicon()
    print('\nDone.')
