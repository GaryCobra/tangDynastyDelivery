#!/usr/bin/env python3
"""
《我在大唐送外卖》- 游戏素材生成器
Generates all placeholder game assets as PNG images using Pillow.
Q版卡通风格，色彩明亮，适配微信小游戏
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

BASE_DIR = '/home/xuebin/workspace/tangDynastyDelivery/assets/textures'
os.makedirs(f'{BASE_DIR}/characters', exist_ok=True)
os.makedirs(f'{BASE_DIR}/vehicles', exist_ok=True)
os.makedirs(f'{BASE_DIR}/buildings', exist_ok=True)
os.makedirs(f'{BASE_DIR}/commodities', exist_ok=True)
os.makedirs(f'{BASE_DIR}/ui', exist_ok=True)
os.makedirs(f'{BASE_DIR}/tiles', exist_ok=True)
os.makedirs(f'{BASE_DIR}/effects', exist_ok=True)
os.makedirs(f'{BASE_DIR}/backgrounds', exist_ok=True)

COLS = {
    'red': (220, 60, 60),
    'dark_red': (180, 40, 40),
    'gold': (240, 200, 50),
    'dark_gold': (200, 160, 30),
    'brown': (160, 100, 60),
    'dark_brown': (120, 70, 40),
    'skin': (255, 220, 180),
    'dark_skin': (230, 190, 150),
    'blue': (60, 120, 220),
    'dark_blue': (40, 80, 180),
    'green': (80, 180, 80),
    'dark_green': (50, 140, 50),
    'teal': (60, 180, 180),
    'purple': (160, 80, 200),
    'orange': (240, 160, 40),
    'white': (255, 255, 255),
    'gray': (180, 180, 180),
    'dark_gray': (100, 100, 100),
    'black': (40, 40, 40),
    'cream': (255, 240, 200),
    'pink': (255, 180, 200),
    'wood': (200, 150, 100),
    'dark_wood': (160, 110, 70),
    'roof_red': (200, 60, 60),
    'fence_brown': (140, 90, 50),
    'water_blue': (100, 180, 220),
    'sky_blue': (180, 220, 255),
}

def rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.pieslice([x1, y1, x1+radius*2, y1+radius*2], 180, 270, fill=fill, outline=outline)
    draw.pieslice([x2-radius*2, y1, x2, y1+radius*2], 270, 360, fill=fill, outline=outline)
    draw.pieslice([x1, y2-radius*2, x1+radius*2, y2], 90, 180, fill=fill, outline=outline)
    draw.pieslice([x2-radius*2, y2-radius*2, x2, y2], 0, 90, fill=fill, outline=outline)
    draw.rectangle([x1+radius, y1, x2-radius, y2], fill=fill, outline=outline)
    draw.rectangle([x1, y1+radius, x2, y2-radius], fill=fill, outline=outline)
    if outline:
        draw.arc([x1, y1, x1+radius*2, y1+radius*2], 180, 270, fill=outline, width=width)
        draw.arc([x2-radius*2, y1, x2, y1+radius*2], 270, 360, fill=outline, width=width)
        draw.arc([x1, y2-radius*2, x1+radius*2, y2], 90, 180, fill=outline, width=width)
        draw.arc([x2-radius*2, y2-radius*2, x2, y2], 0, 90, fill=outline, width=width)
        draw.line([x1+radius, y1, x2-radius, y1], fill=outline, width=width)
        draw.line([x1+radius, y2, x2-radius, y2], fill=outline, width=width)
        draw.line([x1, y1+radius, x1, y2-radius], fill=outline, width=width)
        draw.line([x2, y1+radius, x2, y2-radius], fill=outline, width=width)

def draw_character_head(draw, cx, cy, size, skin_color=COLS['skin'], hair_color=COLS['black'], hat_color=None):
    r = size // 2
    # Head circle
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=skin_color, outline=COLS['dark_skin'], width=1)
    # Eyes
    eye_y = cy - 2
    draw.ellipse([cx-5, eye_y-3, cx-2, eye_y+1], fill=COLS['black'])
    draw.ellipse([cx+2, eye_y-3, cx+5, eye_y+1], fill=COLS['black'])
    # Mouth
    draw.arc([cx-3, cy+1, cx+3, cy+5], 0, 180, fill=COLS['dark_red'], width=1)
    # Hair
    draw.arc([cx-r-1, cy-r-2, cx+r+1, cy+2], 180, 360, fill=hair_color, width=3)
    # Hat (Tang-style)
    if hat_color:
        draw.rectangle([cx-r-2, cy-r-6, cx+r+2, cy-r+2], fill=hat_color, outline=COLS['dark_red'], width=1)
        draw.rectangle([cx-r-4, cy-r-6, cx+r+4, cy-r-4], fill=hat_color, outline=COLS['dark_red'], width=1)

def draw_body(draw, x1, y1, x2, y2, color=COLS['blue'], has_belt=True):
    # Robe body
    draw.polygon([(x1, y1), (x2, y1), (x2+4, y2), (x1-4, y2)], fill=color, outline=COLS['dark_gray'], width=1)
    # Belt
    if has_belt:
        by = (y1 + y2) // 2
        draw.rectangle([x1-2, by-3, x2+2, by+3], fill=COLS['gold'], outline=COLS['dark_gold'], width=1)
    # Collar
    cx = (x1 + x2) // 2
    draw.polygon([(cx-3, y1+3), (cx+3, y1+3), (cx, y1+12)], fill=COLS['white'], outline=COLS['gray'], width=1)

def draw_legs(draw, cx, y1, y2, pants_color=COLS['brown']):
    w = 6
    draw.rectangle([cx-w, y1, cx-1, y2], fill=pants_color, outline=COLS['dark_brown'], width=1)
    draw.rectangle([cx+1, y1, cx+w, y2], fill=pants_color, outline=COLS['dark_brown'], width=1)
    # Shoes
    draw.ellipse([cx-w-1, y2-2, cx-1, y2+4], fill=COLS['black'])
    draw.ellipse([cx+1, y2-2, cx+w+1, y2+4], fill=COLS['black'])

# ============================================================
# CHARACTERS
# ============================================================
def create_player_male():
    img = Image.new('RGBA', (64, 96), (0,0,0,0))
    d = ImageDraw.Draw(img)
    draw_character_head(d, 32, 15, 18, hat_color=COLS['dark_red'])
    draw_body(d, 20, 28, 44, 62, color=COLS['blue'])
    draw_legs(d, 32, 62, 90, COLS['brown'])
    img.save(f'{BASE_DIR}/characters/player_male.png')
    # Run frame
    img2 = Image.new('RGBA', (64, 96), (0,0,0,0))
    d2 = ImageDraw.Draw(img2)
    draw_character_head(d2, 32, 15, 18, hat_color=COLS['dark_red'])
    draw_body(d2, 18, 28, 42, 62, color=COLS['blue'])
    d2.rectangle([14, 62, 22, 80], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
    d2.rectangle([42, 62, 50, 80], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
    d2.ellipse([13, 78, 23, 86], fill=COLS['black'])
    d2.ellipse([41, 78, 51, 86], fill=COLS['black'])
    img2.save(f'{BASE_DIR}/characters/player_male_run.png')
    # Carry frame
    img3 = Image.new('RGBA', (80, 96), (0,0,0,0))
    d3 = ImageDraw.Draw(img3)
    draw_character_head(d3, 32, 15, 18, hat_color=COLS['dark_red'])
    draw_body(d3, 20, 28, 44, 62, color=COLS['blue'])
    draw_legs(d3, 32, 62, 90, COLS['brown'])
    d3.rectangle([44, 30, 72, 42], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
    d3.rectangle([44, 30, 48, 55], fill=COLS['wood'], outline=COLS['dark_wood'], width=1)
    img3.save(f'{BASE_DIR}/characters/player_male_carry.png')

def create_player_female():
    img = Image.new('RGBA', (64, 96), (0,0,0,0))
    d = ImageDraw.Draw(img)
    draw_character_head(d, 32, 15, 18, hair_color=COLS['black'], hat_color=COLS['pink'])
    draw_body(d, 20, 28, 44, 65, color=COLS['pink'])
    draw_legs(d, 32, 62, 90, COLS['purple'])
    # Hair bun
    d.ellipse([27, 5, 37, 13], fill=COLS['black'])
    d.ellipse([24, 8, 40, 14], fill=COLS['black'])
    img.save(f'{BASE_DIR}/characters/player_female.png')

def create_npcs():
    npcs = [
        ('merchant', COLS['green'], (55, 75)),
        ('worker', COLS['brown'], (50, 70)),
        ('customer', COLS['teal'], (50, 70)),
        ('official', COLS['red'], (55, 75)),
    ]
    for name, color, size in npcs:
        img = Image.new('RGBA', (size[0], size[1]), (0,0,0,0))
        d = ImageDraw.Draw(img)
        cx = size[0] // 2
        head_size = min(size[0], size[1]) // 4
        draw_character_head(d, cx, head_size, head_size, hat_color=color)
        body_top = head_size * 2
        body_bot = size[1] - 15
        draw_body(d, cx-head_size, body_top, cx+head_size, body_bot, color=color)
        draw_legs(d, cx, body_bot, size[1]-2, COLS['dark_brown'])
        img.save(f'{BASE_DIR}/characters/npc_{name}.png')

# ============================================================
# VEHICLES
# ============================================================
def create_vehicles():
    vehicles = [
        ('legs', 48, 64, None),
        ('handcart', 80, 56, '三轮推车'),
        ('flatbed', 96, 48, '四轮平板车'),
        ('ox_cart', 100, 72, '牛车'),
        ('horse_cart', 110, 80, '马车'),
    ]
    for name, w, h, label in vehicles:
        img = Image.new('RGBA', (w+20, h+20), (0,0,0,0))
        d = ImageDraw.Draw(img)
        cx = (w+20) // 2
        by = h + 10  # bottom y

        if name == 'legs':
            # Walking legs icon
            d.rectangle([cx-15, by-50, cx-5, by-8], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
            d.rectangle([cx+5, by-50, cx+15, by-8], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
            d.ellipse([cx-18, by-12, cx-2, by-4], fill=COLS['black'])
            d.ellipse([cx+2, by-12, cx+18, by-4], fill=COLS['black'])
            # Shadow
            d.ellipse([cx-12, by-2, cx+12, by+4], fill=(0,0,0,30))

        elif name == 'handcart':
            # Cart body
            d.rectangle([cx-w//2, by-28, cx+w//2, by-8], fill=COLS['wood'], outline=COLS['dark_wood'], width=2)
            # Wheel
            r = 10
            d.ellipse([cx-w//4-r, by-r*2, cx-w//4+r, by], fill=COLS['gray'], outline=COLS['dark_gray'], width=2)
            d.ellipse([cx+w//4-r, by-r*2, cx+w//4+r, by], fill=COLS['gray'], outline=COLS['dark_gray'], width=2)
            # Handles
            d.line([cx-w//2, by-18, cx-w//2-15, by-35], fill=COLS['dark_wood'], width=3)
            d.line([cx-w//2, by-20, cx-w//2-15, by-33], fill=COLS['dark_wood'], width=3)

        elif name == 'flatbed':
            d.rectangle([cx-w//2, by-18, cx+w//2, by-5], fill=COLS['wood'], outline=COLS['dark_wood'], width=2)
            for x in [-w//4, w//4]:
                r = 8
                d.ellipse([x+cx-r, by-r*2, x+cx+r, by], fill=COLS['gray'], outline=COLS['dark_gray'], width=2)

        elif name == 'ox_cart':
            d.rectangle([cx-w//3, by-30, cx+w//3, by-5], fill=COLS['brown'], outline=COLS['dark_brown'], width=2)
            d.ellipse([cx-w//3-3, by-8, cx-w//3+3, by+2], fill=COLS['dark_gray'])
            d.ellipse([cx+w//3-3, by-8, cx+w//3+3, by+2], fill=COLS['dark_gray'])
            d.ellipse([cx-w//2-8, by-38, cx-w//2-2, by-20], fill=COLS['dark_brown'])

        elif name == 'horse_cart':
            d.rectangle([cx-w//3, by-35, cx+w//3, by-5], fill=COLS['dark_red'], outline=COLS['red'], width=2)
            d.ellipse([cx-w//3-4, by-8, cx-w//3+4, by+2], fill=COLS['dark_gray'])
            d.ellipse([cx+w//3-4, by-8, cx+w//3+4, by+2], fill=COLS['dark_gray'])
            d.polygon([(cx-w//2, by-30), (cx-w//2-15, by-20), (cx-w//2-15, by-5), (cx-w//3-5, by-5)], fill=COLS['gold'], outline=COLS['dark_gold'], width=1)

        if label:
            d.text((5, 2), label, fill=COLS['dark_gray'])
        img.save(f'{BASE_DIR}/vehicles/vehicle_{name}.png')

# ============================================================
# COMMODITIES
# ============================================================
def create_commodities():
    items = [
        ('grain', '🌾', (240,220,150), '粮'),
        ('silk', '🧣', (255,200,220), '绸'),
        ('porcelain', '🏺', (200,220,240), '瓷'),
        ('tea', '🍃', (150,200,150), '茶'),
        ('spice', '🌶️', (240,180,120), '香'),
    ]
    for name, emoji, color, label in items:
        img = Image.new('RGBA', (48, 48), (0,0,0,0))
        d = ImageDraw.Draw(img)
        # Draw simple commodity icon
        c = tuple(color)
        if name == 'grain':
            d.ellipse([8, 18, 40, 42], fill=(220,200,140), outline=(180,160,100), width=1)
            d.line([16, 28, 24, 8], fill=(160,140,80), width=2)
            d.line([24, 28, 32, 8], fill=(160,140,80), width=2)
            d.line([20, 28, 28, 10], fill=(160,140,80), width=2)
        elif name == 'silk':
            d.rectangle([12, 10, 36, 38], fill=c, outline=COLS['dark_gray'], width=1)
            d.line([12, 15, 36, 15], fill=COLS['pink'], width=1)
            d.line([12, 22, 36, 22], fill=COLS['pink'], width=1)
            d.line([12, 29, 36, 29], fill=COLS['pink'], width=1)
        elif name == 'porcelain':
            d.ellipse([14, 16, 34, 38], fill=c, outline=COLS['dark_blue'], width=1)
            d.ellipse([12, 12, 36, 22], fill=c, outline=COLS['dark_blue'], width=1)
            d.arc([14, 14, 34, 20], 0, 180, fill=COLS['dark_blue'], width=1)
        elif name == 'tea':
            d.polygon([(14, 30), (34, 30), (30, 10), (18, 10)], fill=(100,160,100), outline=(60,120,60), width=1)
            d.line([20, 10, 24, 4], fill=(80,140,80), width=2)
            d.line([28, 10, 32, 4], fill=(80,140,80), width=2)
        elif name == 'spice':
            d.polygon([(18, 36), (30, 36), (36, 10), (12, 10)], fill=(220,160,100), outline=(180,120,60), width=1)
            d.ellipse([14, 18, 22, 26], fill=COLS['red'])
            d.ellipse([26, 18, 34, 26], fill=COLS['red'])
            d.ellipse([20, 14, 28, 22], fill=COLS['orange'])

        # Label
        d.text((4, 2), label, fill=COLS['dark_gray'])
        img.save(f'{BASE_DIR}/commodities/commodity_{name}.png')

# ============================================================
# BUILDINGS
# ============================================================
def create_buildings():
    buildings = [
        ('rice_shop', '米铺', COLS['gold']),
        ('tavern', '酒肆', COLS['red']),
        ('cloth_shop', '布庄', COLS['teal']),
        ('blacksmith', '铁匠铺', COLS['dark_gray']),
        ('weapon_shop', '兵器铺', COLS['dark_red']),
        ('military_camp', '军营', COLS['dark_blue']),
        ('medical_bureau', '太医署', COLS['green']),
        ('financial_street', '金融街', COLS['gold']),
        ('home', '家', COLS['brown']),
    ]
    for name, label, color in buildings:
        img = Image.new('RGBA', (80, 80), (0,0,0,0))
        d = ImageDraw.Draw(img)
        c = tuple(color)
        # Roof
        d.polygon([(5, 35), (40, 5), (75, 35)], fill=COLS['roof_red'], outline=COLS['dark_red'], width=2)
        # Walls
        d.rectangle([15, 35, 65, 72], fill=c, outline=COLS['dark_gray'], width=1)
        # Door
        d.rectangle([33, 50, 47, 72], fill=COLS['brown'], outline=COLS['dark_brown'], width=1)
        # Sign
        d.rectangle([25, 18, 55, 28], fill=COLS['cream'], outline=COLS['dark_gray'], width=1)
        d.text((28, 19), label, fill=COLS['dark_red'])
        img.save(f'{BASE_DIR}/buildings/building_{name}.png')

# ============================================================
# UI ELEMENTS
# ============================================================
def create_ui():
    # Buttons
    buttons = [
        ('btn_delivery', '送货', 100, 40, COLS['blue']),
        ('btn_station', '站点', 100, 40, COLS['green']),
        ('btn_finance', '金融', 100, 40, COLS['gold']),
        ('btn_back', '返回', 80, 36, COLS['dark_gray']),
        ('btn_accept', '接单', 80, 36, COLS['green']),
        ('btn_upgrade', '升级', 80, 36, COLS['blue']),
        ('btn_hire', '雇佣', 80, 36, COLS['teal']),
        ('btn_buy', '买入', 80, 36, COLS['red']),
        ('btn_sell', '卖出', 80, 36, COLS['green']),
        ('btn_ad', '看广告', 100, 36, COLS['purple']),
    ]
    for name, txt, w, h, color in buttons:
        img = Image.new('RGBA', (w+8, h+8), (0,0,0,0))
        d = ImageDraw.Draw(img)
        c = tuple(color)
        rounded_rect(d, [4, 4, w+4, h+4], 8, fill=c, outline=COLS['dark_gray'], width=2)
        # Text
        tw = len(txt) * 7
        d.text(((w-tw)//2+4, (h-12)//2+4), txt, fill=COLS['white'])
        img.save(f'{BASE_DIR}/ui/{name}.png')

    # Icons
    icons = [
        ('icon_coins', '💰', (60,60)),
        ('icon_stamina', '⚡', (60,60)),
        ('icon_reputation', '⭐', (60,60)),
        ('icon_weather_sunny', '☀️', (40,40)),
        ('icon_weather_rainy', '🌧️', (40,40)),
        ('icon_weather_snowy', '❄️', (40,40)),
    ]
    for name, sym, size in icons:
        img = Image.new('RGBA', size, (0,0,0,0))
        d = ImageDraw.Draw(img)
        cx, cy = size[0]//2, size[1]//2
        if 'coins' in name:
            d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=COLS['gold'], outline=COLS['dark_gold'], width=2)
            d.text((cx-5, cy-5), '$', fill=COLS['dark_gold'])
        elif 'stamina' in name:
            d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=COLS['green'], outline=COLS['dark_green'], width=2)
            d.rectangle([cx-4, cy-6, cx+4, cy+6], fill=COLS['white'])
            d.rectangle([cx-6, cy-4, cx+6, cy+4], fill=COLS['white'])
        elif 'reputation' in name:
            d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=COLS['gold'], outline=COLS['dark_gold'], width=2)
            d.polygon([(cx, cy-8), (cx+4, cy-2), (cx+10, cy-2), (cx+6, cy+3), (cx+8, cy+10), (cx, cy+6), (cx-8, cy+10), (cx-6, cy+3), (cx-10, cy-2), (cx-4, cy-2)], fill=COLS['white'])
        elif 'sunny' in name:
            d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=COLS['gold'])
        elif 'rainy' in name:
            d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=COLS['gray'])
            d.line([cx-4, cy-2, cx-6, cy+8], fill=COLS['blue'], width=2)
            d.line([cx+2, cy-2, cx, cy+8], fill=COLS['blue'], width=2)
            d.line([cx+6, cy-2, cx+4, cy+8], fill=COLS['blue'], width=2)
        elif 'snowy' in name:
            d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=COLS['white'], outline=COLS['gray'], width=1)
        img.save(f'{BASE_DIR}/ui/{name}.png')

    # Panel backgrounds
    for name, w, h, color in [
        ('panel_bg', 300, 400, (250,245,235)),
        ('panel_dark', 300, 400, (200,195,185)),
    ]:
        img = Image.new('RGBA', (w, h), (0,0,0,0))
        d = ImageDraw.Draw(img)
        rounded_rect(d, [0, 0, w, h], 16, fill=tuple(color), outline=COLS['brown'], width=2)
        img.save(f'{BASE_DIR}/ui/{name}.png')

# ============================================================
# TILES
# ============================================================
def create_tiles():
    tiles = [
        ('tile_road', (200,185,160), None),
        ('tile_path', (220,210,185), None),
        ('tile_grass', (150,200,130), None),
        ('tile_stone', (190,190,185), None),
        ('tile_wood', (190,150,100), None),
        ('tile_water', (100,180,220), None),
    ]
    for name, color, _ in tiles:
        img = Image.new('RGBA', (64, 64), (0,0,0,0))
        d = ImageDraw.Draw(img)
        c = tuple(color)
        d.rectangle([0, 0, 64, 64], fill=c, outline=COLS['dark_gray'], width=1)
        # Add subtle texture
        if 'road' in name:
            d.line([0, 32, 64, 32], fill=(180,165,140), width=1)
        elif 'grass' in name:
            d.line([10, 20, 15, 10], fill=(130,180,110), width=1)
            d.line([30, 40, 35, 30], fill=(130,180,110), width=1)
            d.line([50, 18, 55, 8], fill=(130,180,110), width=1)
        elif 'water' in name:
            d.arc([10, 25, 30, 40], 0, 180, fill=(150,210,240), width=2)
            d.arc([35, 30, 55, 45], 0, 180, fill=(150,210,240), width=2)
        img.save(f'{BASE_DIR}/tiles/{name}.png')

# ============================================================
# EFFECTS
# ============================================================
def create_effects():
    effects = [
        ('effect_perfect', (64,64), COLS['gold']),
        ('effect_coin', (32,32), COLS['gold']),
        ('effect_stars', (48,48), COLS['gold']),
        ('effect_explosion', (48,48), COLS['orange']),
        ('effect_speed', (40,40), COLS['blue']),
    ]
    for name, size, color in effects:
        img = Image.new('RGBA', size, (0,0,0,0))
        d = ImageDraw.Draw(img)
        cx, cy = size[0]//2, size[1]//2
        c = tuple(color)

        if 'perfect' in name:
            # Star burst
            for i in range(8):
                angle = math.pi * i / 4
                x = cx + int(math.cos(angle) * 22)
                y = cy + int(math.sin(angle) * 22)
                d.ellipse([x-4, y-4, x+4, y+4], fill=c)
            d.ellipse([cx-10, cy-10, cx+10, cy+10], fill=c, outline=COLS['white'], width=2)
        elif 'coin' in name:
            d.ellipse([2, 2, 30, 30], fill=c, outline=COLS['dark_gold'], width=2)
            d.text((8, 7), '$', fill=COLS['white'])
        elif 'stars' in name:
            for i, (dx, dy) in enumerate([(10,10), (35,8), (20,35), (8,30), (40,28)]):
                d.ellipse([dx-3, dy-3, dx+3, dy+3], fill=c)
        elif 'explosion' in name:
            d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=COLS['red'])
            d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=COLS['orange'])
            d.ellipse([cx-4, cy-4, cx+4, cy+4], fill=COLS['gold'])
        elif 'speed' in name:
            d.polygon([(cx-12, cy), (cx+8, cy-12), (cx+4, cy-2), (cx+12, cy), (cx+4, cy+2), (cx+8, cy+12)], fill=c)

        img.save(f'{BASE_DIR}/effects/{name}.png')

# ============================================================
# BACKGROUNDS
# ============================================================
def create_backgrounds():
    for name, w, h, sky, ground in [
        ('bg_main', 360, 640, COLS['sky_blue'], COLS['green']),
        ('bg_delivery', 360, 640, COLS['sky_blue'], COLS['cream']),
        ('bg_finance', 360, 640, (200,180,160), COLS['brown']),
    ]:
        img = Image.new('RGBA', (w, h), (0,0,0,0))
        d = ImageDraw.Draw(img)
        # Sky
        d.rectangle([0, 0, w, h//2], fill=tuple(sky))
        # Ground
        d.rectangle([0, h//2, w, h], fill=tuple(ground))
        # Clouds
        d.ellipse([50, 60, 130, 90], fill=(255,255,255,200))
        d.ellipse([80, 50, 140, 85], fill=(255,255,255,200))
        d.ellipse([220, 80, 300, 110], fill=(255,255,255,180))
        # Sun
        d.ellipse([300, 30, 340, 70], fill=COLS['gold'])
        # Ground details
        if ground == COLS['green']:
            d.ellipse([20, h-30, 60, h-10], fill=(100,160,80))
            d.ellipse([280, h-25, 320, h-5], fill=(100,160,80))
        # Path
        d.rectangle([w//2-20, h//2, w//2+20, h], fill=(200,185,160), outline=COLS['gray'], width=1)

        img.save(f'{BASE_DIR}/backgrounds/{name}.png')

# ============================================================
# MAIN
# ============================================================
if __name__ == '__main__':
    print('Creating characters...')
    create_player_male()
    create_player_female()
    create_npcs()

    print('Creating vehicles...')
    create_vehicles()

    print('Creating commodities...')
    create_commodities()

    print('Creating buildings...')
    create_buildings()

    print('Creating UI elements...')
    create_ui()

    print('Creating tiles...')
    create_tiles()

    print('Creating effects...')
    create_effects()

    print('Creating backgrounds...')
    create_backgrounds()

    print('All assets generated successfully!')

    # Count files
    total = 0
    for root, dirs, files in os.walk(BASE_DIR):
        total += len(files)
    print(f'Total asset files: {total}')
