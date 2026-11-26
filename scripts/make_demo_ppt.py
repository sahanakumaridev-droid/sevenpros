from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree

SHOTS = "/Users/sahanakumari/Desktop/Seven-pro/ppt-shots"
OUT = "/Users/sahanakumari/Desktop/Seven-pro/SevenPros-demo.pptx"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

NAVY = RGBColor(0x07, 0x1A, 0x3A)
INK = RGBColor(0x14, 0x18, 0x1D)
BLUE = RGBColor(0x2F, 0x6F, 0xED)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTED = RGBColor(0x4A, 0x55, 0x60)
SOFT = RGBColor(0xF3, 0xF5, 0xF8)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
PALE = RGBColor(0xB9, 0xD4, 0xFF)
GOLD = RGBColor(0xF5, 0xC4, 0x00)


def _set_font(run, size, bold, color):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = "Calibri"


def text(slide, l, t, w, h, value, size=16, bold=False, color=INK, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = value
    _set_font(r, size, bold, color)
    return box


def lines(slide, l, t, w, h, items, size=16, color=INK, after=10, bold=False):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(after)
        r = p.add_run()
        r.text = item
        _set_font(r, size, bold, color)


def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def card(slide, l, t, w, h, fill=WHITE):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    shape.adjustments[0] = 0.06
    shape.shadow.inherit = False
    return shape


def picture(slide, path, l, t, w):
    return slide.shapes.add_picture(path, Inches(l), Inches(t), width=Inches(w))


# 1 — what the app is
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, NAVY)
card(s, 0, 0, 0.16, 7.5, BLUE)
text(s, 0.7, 0.5, 8, 0.3, "SEVENPROS", 14, True, PALE)
text(s, 0.7, 1.35, 12, 0.35, "WHAT THIS APP IS", 13, True, GOLD)
text(s, 0.7, 1.85, 12, 2.2, "A California marketplace\nfor local pros and the people who hire them.", 36, True, WHITE)
text(s, 0.7, 4.55, 11, 1.5, "Someone searches a trade, sees the offer, and spends one credit only when they want that person’s contact.\nA pro posts the work and answers the people who unlock them.\nPosting, chat, and call require an account.", 18, False, RGBColor(0xD5, 0xDE, 0xE8))
text(s, 0.7, 6.7, 8, 0.3, "sevenpros.vercel.app", 14, True, WHITE)

# 2 — how many login flows
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.55, 0.35, 12, 0.25, "LOGIN", 12, True, BLUE)
text(s, 0.55, 0.65, 12, 0.7, "Sign in is normal. These two buttons choose who you are.", 28, True, NAVY)
flows = [
    ("Customer demo", "The hiring path", "Try customer demo signs in as Maria Garcia and opens the offer grid. Search, map, preview, then one credit."),
    ("Pro demo", "The work path", "Try pro demo signs in as the sample pro and opens the dashboard. Services, bookings, and the business profile."),
]
for i, (title, tag, body) in enumerate(flows):
    x = 0.55 + i * 6.3
    card(s, x, 1.85, 5.95, 3.15, NAVY if i else WHITE)
    text(s, x + 0.35, 2.1, 5.2, 0.5, title, 24, True, WHITE if i else NAVY)
    text(s, x + 0.35, 2.7, 5.2, 0.35, tag, 14, True, GOLD if i else BLUE)
    text(s, x + 0.35, 3.2, 5.2, 1.4, body, 16, False, RGBColor(0xD5, 0xDE, 0xE8) if i else MUTED)
text(s, 0.55, 5.3, 12, 1.4, "Email Sign in and Create account are the ordinary door. Same form for everyone.\nGoogle, Apple, and Forgot password do not sign anyone in.\nHire a Pro and Offer Services only name the path. Password for both demos is password123.", 16, False, MUTED)

# 2b — what customer and pro mean
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.55, 0.35, 12, 0.25, "TWO KINDS OF PEOPLE", 12, True, BLUE)
text(s, 0.55, 0.65, 12, 0.55, "Need it done. Or you do the work.", 32, True, NAVY)
card(s, 0.5, 1.55, 6.0, 5.2, WHITE)
text(s, 0.8, 1.75, 5.4, 0.3, "CUSTOMER", 13, True, BLUE)
text(s, 0.8, 2.15, 5.4, 1.1, "You need a plumber, a cleaner, or a repair.", 24, True, NAVY)
lines(s, 0.8, 3.5, 5.4, 2.8, [
    "Sign in as a customer. Home shows local offers.",
    "Search a trade, or switch to the map, and open a card.",
    "You can see the photo, the name, and the city for free.",
    "Spend 1 credit to get that person’s phone and address.",
], 16, MUTED, 10)
card(s, 6.8, 1.55, 6.0, 5.2, NAVY)
text(s, 7.1, 1.75, 5.4, 0.3, "PRO", 13, True, GOLD)
text(s, 7.1, 2.15, 5.4, 1.1, "Show the work. Get the lead. Answer the person who paid to reach you.", 24, True, WHITE)
lines(s, 7.1, 3.5, 5.4, 2.8, [
    "Sign in and you land on the dashboard.",
    "Services, bookings, and your profile live there.",
    "Offer Services means this path.",
    "A lead costs credits. Your own listing does not show Chat and Call to you.",
], 16, RGBColor(0xD5, 0xDE, 0xE8), 10)

# customer login, same step layout as pro
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, NAVY)
text(s, 0.7, 0.4, 12, 0.25, "CUSTOMER LOGIN", 13, True, GOLD)
text(s, 0.7, 0.75, 12, 0.55, "From the button to the phone number.", 30, True, WHITE)
csteps = [
    ("1", "Open Sign in", "Go to sevenpros.vercel.app/login."),
    ("2", "Choose the customer", "Press Try customer demo. That signs in as Maria Garcia."),
    ("3", "Land on offers", "Home is no longer the dark page. It is Local pros and offers."),
    ("4", "Search or map", "Type a trade such as plumbing, or switch to Map and tap a pin."),
    ("5", "Open the card", "You see the photo, the name, and the city. Phone and address stay hidden."),
    ("6", "Spend 1 credit", "That opens this one person. Opening the same person again does not cost another credit."),
]
for i, (n, title, body) in enumerate(csteps):
    col = i % 2
    row = i // 2
    x = 0.7 + col * 6.2
    y = 1.6 + row * 1.7
    text(s, x, y, 0.55, 0.4, n, 22, True, GOLD)
    text(s, x + 0.7, y, 5.1, 0.4, title, 20, True, WHITE)
    text(s, x + 0.7, y + 0.45, 5.1, 0.7, body, 15, False, RGBColor(0xD5, 0xDE, 0xE8))

# pro login, its own slide
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, NAVY)
text(s, 0.7, 0.45, 12, 0.25, "PRO LOGIN", 13, True, GOLD)
text(s, 0.7, 0.85, 12, 0.7, "One door. Straight to the work.", 32, True, WHITE)
steps = [
    ("1", "Sign in as a pro", "Try pro demo, or email owner0@sevenpros-demo.com. Password password123."),
    ("2", "Land on the dashboard", "Not the customer grid. Overview, Services, Bookings, Business Profile."),
    ("3", "Offer Services", "On signup this choice sends a new account to Become a Pro."),
    ("4", "Then the leads", "A customer spends a credit to reach you. You spend credits to open a customer request."),
]
for i, (n, title, body) in enumerate(steps):
    y = 1.9 + i * 1.2
    text(s, 0.75, y, 0.6, 0.45, n, 22, True, GOLD)
    text(s, 1.5, y, 10, 0.35, title, 20, True, WHITE)
    text(s, 1.5, y + 0.38, 10, 0.4, body, 15, False, RGBColor(0xD5, 0xDE, 0xE8))

# credits / payment
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.55, 0.35, 12, 0.25, "PAYMENT", 12, True, BLUE)
text(s, 0.55, 0.65, 12, 0.55, "Credits open people. Cards do not.", 30, True, NAVY)
pays = [
    ("Customer", "1 credit = 1 person", "Opens address and phone, or chat and call. Same person is free the next time. Best pack: 3 contacts, $19."),
    ("Pro", "1 lead = 15 credits", "Opens a customer request. Starter $10, Growth $25, Business $50. Business is the best offer. Pro plan $49 a month."),
    ("Checkout", "Confirm. No charge.", "The price is set on the server. You confirm once. This demo does not charge a card."),
]
for i, (who, title, body) in enumerate(pays):
    x = 0.5 + i * 4.2
    card(s, x, 1.7, 3.95, 4.6, NAVY if i == 1 else WHITE)
    text(s, x + 0.3, 2.0, 3.3, 0.35, who.upper(), 13, True, GOLD if i == 1 else BLUE)
    text(s, x + 0.3, 2.55, 3.3, 1.2, title, 26, True, WHITE if i == 1 else NAVY)
    text(s, x + 0.3, 4.1, 3.3, 1.8, body, 15, False, RGBColor(0xD5, 0xDE, 0xE8) if i == 1 else MUTED)

# ranking
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.55, 0.35, 12, 0.25, "HOW A PRO RISES", 12, True, BLUE)
text(s, 0.55, 0.65, 12, 0.6, "Best Match is a score, not a black box.", 30, True, NAVY)
text(s, 0.55, 1.4, 12, 0.5, "When a customer searches, each pro gets a number from 0 to 100. Higher number, higher on the list.", 16, False, MUTED)
weights = [
    ("40", "Rating", "Stars carry the most weight."),
    ("25", "Distance", "Closer to the search wins."),
    ("20", "Reply speed", "Faster responses score higher."),
    ("15", "Price", "A lower starting price helps."),
    ("+5", "Verified", "A verified profile gets a small bonus."),
]
for i, (n, title, body) in enumerate(weights):
    x = 0.45 + i * 2.55
    card(s, x, 2.2, 2.4, 3.3, WHITE)
    text(s, x + 0.2, 2.45, 2.0, 0.7, n, 28, True, BLUE)
    text(s, x + 0.2, 3.3, 2.0, 0.5, title, 18, True, NAVY)
    text(s, x + 0.2, 3.95, 2.0, 1.1, body, 14, False, MUTED)
text(s, 0.55, 5.75, 12, 1.1, "The customer can also sort by cheapest, closest, highest rated, or fastest. This is a clear formula. It is not a trained model.", 16, False, MUTED)

# 3 — three beats
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.55, 0.4, 8, 0.25, "AFTER LOGIN", 12, True, BLUE)
text(s, 0.55, 0.7, 12, 0.6, "What the signed-in app is for", 32, True, NAVY)
beats = [
    ("01", "Find", "Search a trade in California. The signed-in home returns real local businesses, in a grid or on a map."),
    ("02", "See the offer", "Photo, trade, name, and city are public. The street address and phone stay hidden."),
    ("03", "Unlock", "One credit opens that one person. The same person is free the next time."),
]
for i, (n, title, body) in enumerate(beats):
    x = 0.55 + i * 4.2
    card(s, x, 1.8, 3.95, 4.5, NAVY if i == 2 else WHITE)
    text(s, x + 0.35, 2.15, 3.2, 0.5, n, 20, True, GOLD if i == 2 else BLUE)
    text(s, x + 0.35, 2.8, 3.2, 0.7, title, 28, True, WHITE if i == 2 else NAVY)
    text(s, x + 0.35, 3.8, 3.2, 1.8, body, 16, False, RGBColor(0xD5, 0xDE, 0xE8) if i == 2 else MUTED)

# 3 home
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.45, 0.32, 8, 0.22, "BEFORE YOU SIGN IN", 12, True, BLUE)
text(s, 0.45, 0.55, 8, 0.5, "The public promise", 28, True, NAVY)
picture(s, f"{SHOTS}/sp-home.png", 0.45, 1.3, 7.6)
card(s, 8.3, 1.3, 4.55, 5.4, WHITE)
text(s, 8.55, 1.55, 4.1, 1.3, "A visitor starts with a ZIP code and a service.", 22, True, NAVY)
lines(s, 8.55, 3.15, 4.1, 3.2, [
    "Popular trades sit under the search: plumber, electrician, HVAC, cleaning, handyman.",
    "Categories are photo cards, so the first screen already looks like a marketplace.",
    "Post is in the header, and it asks for a login before anything is published.",
], 15, MUTED, 14)

# 4 login
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.45, 0.32, 8, 0.22, "THE LOGIN PAGE", 12, True, BLUE)
text(s, 0.45, 0.55, 8, 0.5, "Where those four paths sit", 28, True, NAVY)
picture(s, f"{SHOTS}/sp-login.png", 0.45, 1.3, 7.6)
card(s, 8.3, 1.3, 4.55, 5.4, WHITE)
text(s, 8.55, 1.5, 4.1, 0.9, "Two demo buttons.", 22, True, NAVY)
lines(s, 8.55, 2.55, 4.1, 3.8, [
    "Try customer demo opens the offer grid as Maria Garcia.",
    "Try pro demo opens the pro dashboard.",
    "Sign in and Create account are the normal email door. Same for both kinds of people.",
    "Google, Apple, and Forgot password do not complete a login.",
], 15, MUTED, 12)

# 5 marketplace
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.45, 0.32, 10, 0.22, "THE GOAL, ON SCREEN", 12, True, BLUE)
text(s, 0.45, 0.55, 10, 0.5, "See the offer before the contact", 28, True, NAVY)
picture(s, f"{SHOTS}/sp-market.png", 0.45, 1.3, 7.6)
card(s, 8.3, 1.3, 4.55, 5.4, WHITE)
text(s, 8.55, 1.55, 4.1, 1.4, "This is the customer home after sign-in.", 22, True, NAVY)
lines(s, 8.55, 3.2, 4.1, 3.2, [
    "Search uses the words typed. Plumbing searches plumbing.",
    "Each card shows the photo, trade, name, and city.",
    "View offer is the preview. Address and phone stay locked until one credit.",
    "This capture: 80 results in California, 30 miles.",
], 15, MUTED, 12)

# 6 map
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.45, 0.32, 10, 0.22, "WHERE THE WORK IS", 12, True, BLUE)
text(s, 0.45, 0.55, 10, 0.5, "The same offers, on a map", 28, True, NAVY)
picture(s, f"{SHOTS}/sp-map.png", 0.45, 1.3, 7.6)
card(s, 8.3, 1.3, 4.55, 5.4, WHITE)
text(s, 8.55, 1.55, 4.1, 1.3, "Pins are real places, not a second list of cards.", 22, True, NAVY)
lines(s, 8.55, 3.2, 4.1, 3.2, [
    "The map is OpenStreetMap. Pins are public businesses that have a location.",
    "This view clusters around coastal San Diego County.",
    "A pin opens the same locked preview as View offer.",
    "Grid brings the photo cards back.",
], 15, MUTED, 12)

# 7 how + credits combined story
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, SOFT)
text(s, 0.45, 0.28, 12, 0.22, "HOW A CREDIT WORKS", 12, True, BLUE)
text(s, 0.45, 0.5, 12, 0.45, "Buy once. Spend one. Keep the rest.", 28, True, NAVY)
picture(s, f"{SHOTS}/sp-how.png", 0.4, 1.2, 6.15)
picture(s, f"{SHOTS}/sp-credits.png", 6.75, 1.2, 6.15)
text(s, 0.45, 6.55, 12.4, 0.6, "Left: the promise — find a pro, see the price, chat and call stay locked.    Right: packs on the live credits page. Business is the best offer for a pro. A customer pack is 3 contacts for $19. No card is charged in this demo.", 14, False, MUTED)

# 8 close
s = prs.slides.add_slide(prs.slide_layouts[6])
bg(s, NAVY)
text(s, 0.7, 1.35, 12, 0.3, "REMEMBER THIS", 13, True, GOLD)
text(s, 0.7, 1.9, 12, 2.2, "The app exists so a person\ncan see the offer first,\nand open the pro only when\nthey choose to.", 32, True, WHITE)
text(s, 0.7, 5.35, 11, 0.9, "Customer demo    maria.garcia@example.com\nPro demo    owner0@sevenpros-demo.com\nPassword    password123", 16, False, RGBColor(0xD5, 0xDE, 0xE8))
text(s, 0.7, 6.7, 8, 0.3, "sevenpros.vercel.app", 16, True, WHITE)

prs.save(OUT)
print(OUT)
