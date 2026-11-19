"""Generates public/og.png (1200x630), the image shown when the site is shared on social media.
Run again after changing your name/role:  python scripts/make-og.py
Needs Pillow (pip install pillow) and, for the site fonts, `npm install` first.
"""
import glob, math, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1200, 630
PAPER, INK, INK2 = "#f7f8fb", "#141a2e", "#434a60"
ACCENT, WARM, DRONE, RULE = "#1f2c86", "#b0500d", "#0b7774", "#e0e5ee"

NAME = "Andrea Mancuso"
LINE1 = "Postdoctoral Researcher · Adjunct Professor"
LINE2 = "University of Naples Federico II"
TOPICS = ["Operations Research · Mixed-integer programming", "Truck-and-drone routing · Healthcare · Location"]


def font(candidates, size):
    for c in candidates:
        for path in glob.glob(c):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                pass
    return ImageFont.load_default(size)


nm = os.path.join(ROOT, "node_modules", "@fontsource")
serif = font([os.path.join(ROOT, "node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2"), "C:/Windows/Fonts/georgiab.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"], 80)
sans = font([os.path.join(nm, "ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2"), "C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"], 32)
mono = font([os.path.join(nm, "ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"), "C:/Windows/Fonts/consola.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"], 24)
try:
    serif.set_variation_by_axes([560, 60])  # weight, optical size of the variable font
except Exception:
    pass

img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

# Street grid on the right.
for x in range(806, W, 38):
    d.line([(x, 0), (x, H)], fill=RULE, width=1)
for y in range(10, H, 36):
    d.line([(806, y), (W, y)], fill=RULE, width=1)

# Truck tour (clockwise from the depot) with three drone sorties.
tour = [(1130, 560), (1020, 584), (905, 540), (862, 430), (935, 330), (872, 220), (905, 92),
        (1012, 58), (1110, 138), (1152, 282), (1100, 420)]
sorties = [((905, 540), (836, 500), (862, 430)), ((872, 220), (834, 150), (905, 92)), ((1110, 138), (1172, 205), (1152, 282))]
d.line(tour + [tour[0]], fill=WARM, width=5, joint="curve")
for a, c, b in sorties:
    for (p, q) in ((a, c), (c, b)):
        L = math.dist(p, q)
        steps = max(2, int(L // 12))
        for k in range(0, steps, 2):
            t1, t2 = k / steps, min(1, (k + 1) / steps)
            d.line([(p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1), (p[0] + (q[0] - p[0]) * t2, p[1] + (q[1] - p[1]) * t2)], fill=DRONE, width=4)
    d.ellipse([c[0] - 12, c[1] - 12, c[0] + 12, c[1] + 12], fill="#def2f0", outline=DRONE, width=4)
for p in tour[1:]:
    d.ellipse([p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12], fill=PAPER, outline=WARM, width=4)
dx, dy = tour[0]
d.rounded_rectangle([dx - 15, dy - 15, dx + 15, dy + 15], radius=3, fill=WARM)

d.rectangle([0, 0, 14, H], fill=ACCENT)
d.text((80, 170), NAME, font=serif, fill=INK)
d.text((82, 285), LINE1, font=sans, fill=INK2)
d.text((82, 328), LINE2, font=sans, fill=INK2)
d.text((82, 420), TOPICS[0], font=mono, fill=ACCENT)
d.text((82, 456), TOPICS[1], font=mono, fill=ACCENT)

img.save(os.path.join(ROOT, "public", "og.png"), optimize=True)
print("written public/og.png")
