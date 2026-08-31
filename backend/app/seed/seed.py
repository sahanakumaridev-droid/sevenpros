"""Seed the database with the full SevenPros category list plus demo
providers, services, bookings and reviews across California cities so the
site has real-looking data to browse. Run with: python -m app.seed.seed
"""

import random
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models.booking import Booking, BookingStatus
from app.models.category import Category
from app.models.provider import Provider
from app.models.review import Review
from app.models.service import Service
from app.models.user import AuthProvider, User
from app.core.security import hash_password
from app.seed.categories_data import CATEGORIES

random.seed(42)

CITIES = [
    ("Los Angeles", 34.0522, -118.2437),
    ("San Francisco", 37.7749, -122.4194),
    ("San Diego", 32.7157, -117.1611),
    ("San Jose", 37.3382, -121.8863),
    ("Sacramento", 38.5816, -121.4944),
    ("Oakland", 37.8044, -122.2712),
    ("Fresno", 36.7378, -119.7871),
    ("Long Beach", 33.7701, -118.1937),
]

# One demo provider per popular category: (business name, category name, tagline, price min, price max, image keywords for cover photo)
DEMO_PROVIDERS = [
    ("Sparkle & Shine Cleaning Co.", "House Cleaning", "Deep home cleaning", 80, 220, "house,cleaning"),
    ("Golden State Plumbing", "Plumbing Services", "Leak repair & installation", 90, 350, "plumber,pipe"),
    ("BrightSpark Electric", "Electrical Services", "Panel upgrades & wiring", 100, 400, "electrician,wiring"),
    ("CoolBreeze HVAC", "HVAC Repair", "AC & furnace repair", 120, 500, "hvac,airconditioner"),
    ("Handy Andy Home Repairs", "Handyman Services", "General home repairs", 60, 200, "handyman,toolbox"),
    ("GreenBlade Lawn Care", "Lawn Care", "Mowing & yard maintenance", 40, 150, "lawnmower,gardening"),
    ("SwiftMove Relocation", "Moving Services", "Local & long-distance moving", 150, 900, "movers,movingtruck"),
    ("ShieldGuard Pest Control", "Pest Control", "Inspection & treatment", 90, 300, "pestcontrol,exterminator"),
    ("ColorCraft Painting", "Painting Services", "Interior & exterior painting", 200, 1200, "housepainting,paintroller"),
    ("Elite Auto Detailing", "Auto Detailing", "Full detail & ceramic coating", 70, 350, "cardetailing,carwash"),
    ("Crystal Clear Pool Service", "Pool Cleaning", "Weekly pool maintenance", 60, 180, "swimmingpool,poolcleaning"),
    ("FixIt Appliance Repair", "Appliance Repair", "Same-day appliance repair", 80, 300, "appliancerepair,technician"),
    ("SummitPeak Roofing", "Roofing Repair", "Roof repair & inspection", 250, 1500, "roofing,roofer"),
    ("TimberFall Tree Service", "Tree Removal", "Tree removal & trimming", 150, 900, "treeremoval,chainsaw"),
    ("Pampered Paws Grooming", "Pet Grooming", "Full-service pet grooming", 40, 120, "doggrooming,petgroomer"),
    ("MountRight TV & Home Tech", "TV Mounting", "TV mounting & home theater setup", 60, 200, "tvmounting,hometheater"),
    ("QuickBuild Furniture Assembly", "Furniture Assembly", "Furniture & fixture assembly", 40, 150, "furnitureassembly,ikea"),
    ("HaulAway Junk Removal", "Junk Removal", "Same-day junk hauling", 90, 400, "junkremoval,hauling"),
    ("CrystalView Window Cleaning", "Window Cleaning", "Interior & exterior window cleaning", 70, 250, "windowcleaning,windowwasher"),
    ("Rapid Response Locksmith", "Locksmith Services", "24/7 emergency locksmith", 60, 250, "locksmith,lockpicking"),
    ("Precision Drywall & Remodel", "Drywall Repair", "Drywall patch & remodel", 100, 600, "drywall,construction"),
    ("BayArea Kitchen Remodeling", "Kitchen Remodeling", "Full kitchen renovation", 3000, 25000, "kitchenremodel,kitchendesign"),
    ("SafeHome Security Systems", "Home Security Systems", "Camera & alarm installation", 150, 800, "securitycamera,homesecurity"),
    ("PureFlow Water Heater Pros", "Water Heater Installation", "Water heater install & repair", 200, 900, "waterheater,plumbing"),
    ("EcoDry Carpet Cleaning", "Carpet Cleaning", "Steam carpet & upholstery cleaning", 60, 200, "carpetcleaning,steamcleaning"),
]


def cover_photo_url(keywords: str, seed: int) -> str:
    """Real, topically-relevant stock photo via LoremFlickr (no API key needed).
    `lock` pins a deterministic photo per seed so it doesn't reshuffle on reload."""
    return f"https://loremflickr.com/640/480/{keywords}/all?lock={seed}"

REVIEW_COMMENTS = [
    "Showed up on time and did excellent work. Highly recommend!",
    "Fair pricing and very professional. Will book again.",
    "Fixed the issue quickly and explained everything clearly.",
    "Great communication throughout the whole job.",
    "A bit late to arrive but the work quality was excellent.",
    "Best service I've used on SevenPros so far.",
    "Friendly, efficient, and cleaned up after the job.",
]

FIRST_NAMES = ["Maria", "James", "Linda", "Robert", "Patricia", "Michael", "Jennifer", "David", "Sofia", "Daniel"]
LAST_NAMES = ["Garcia", "Smith", "Johnson", "Lee", "Martinez", "Brown", "Nguyen", "Davis", "Lopez", "Wilson"]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            for name, slug, group, icon, is_popular in CATEGORIES:
                db.add(Category(name=name, slug=slug, group=group, icon=icon, is_popular=is_popular))
            db.commit()
            print(f"Seeded {len(CATEGORIES)} categories")
        else:
            print("Categories already seeded, skipping")

        if db.query(Provider).count() > 0:
            print("Providers already seeded, skipping")
            return

        categories_by_name = {c.name: c for c in db.query(Category).all()}

        demo_customers = []
        for i, (first, last) in enumerate(zip(FIRST_NAMES, LAST_NAMES)):
            user = User(
                email=f"{first.lower()}.{last.lower()}@example.com",
                full_name=f"{first} {last}",
                hashed_password=hash_password("password123"),
                auth_provider=AuthProvider.email,
                is_verified=True,
            )
            db.add(user)
            demo_customers.append(user)
        db.commit()

        for idx, (business_name, cat_name, tagline, price_min, price_max, image_keywords) in enumerate(DEMO_PROVIDERS):
            city, lat, lng = CITIES[idx % len(CITIES)]
            jitter = lambda: random.uniform(-0.05, 0.05)

            owner_first = random.choice(FIRST_NAMES)
            owner_last = random.choice(LAST_NAMES)
            owner = User(
                email=f"owner{idx}@sevenpros-demo.com",
                full_name=f"{owner_first} {owner_last}",
                hashed_password=hash_password("password123"),
                auth_provider=AuthProvider.email,
                is_verified=True,
                is_provider=True,
                active_mode="provider",
            )
            db.add(owner)
            db.flush()

            provider = Provider(
                user_id=owner.id,
                business_name=business_name,
                tagline=tagline,
                cover_photo_url=cover_photo_url(image_keywords, idx + 1),
                about=(
                    f"{business_name} has been proudly serving the {city} area with reliable, "
                    f"high-quality service. Our team is fully trained, punctual, and committed "
                    f"to getting the job done right the first time."
                ),
                years_experience=random.randint(2, 20),
                is_licensed=random.random() > 0.2,
                license_number=f"CA-{random.randint(100000, 999999)}" if random.random() > 0.2 else None,
                is_insured=random.random() > 0.15,
                is_background_checked=random.random() > 0.25,
                kyc_status="verified",
                city=city,
                state="CA",
                latitude=lat + jitter(),
                longitude=lng + jitter(),
                service_radius_km=random.choice([15, 25, 40, 60]),
                response_time_minutes=random.choice([15, 30, 45, 60, 120]),
                is_available=True,
                subscription_plan=random.choice(["free", "pro", "premium"]),
            )
            db.add(provider)
            db.flush()

            category = categories_by_name[cat_name]
            service = Service(
                provider_id=provider.id,
                category_id=category.id,
                title=tagline,
                description=f"{tagline} for homes and businesses in and around {city}.",
                price_type=random.choice(["fixed", "hourly", "quote"]),
                price_min=price_min,
                price_max=price_max,
                is_instant_booking=random.random() > 0.3,
                offers_free_estimate=random.random() > 0.5,
                is_emergency=random.random() > 0.7,
            )
            db.add(service)
            db.flush()

            # A couple of completed bookings + reviews so ratings look real
            num_reviews = random.randint(3, 12)
            ratings = []
            for r in range(num_reviews):
                customer = random.choice(demo_customers)
                days_ago = random.randint(5, 300)
                booking = Booking(
                    customer_id=customer.id,
                    provider_id=provider.id,
                    service_id=service.id,
                    status=BookingStatus.completed,
                    scheduled_date=(datetime.utcnow() - timedelta(days=days_ago)).date().isoformat(),
                    scheduled_time="10:00",
                    address_line=f"{random.randint(100,9999)} Main St, {city}, CA",
                    quoted_price=price_min,
                    final_price=price_min,
                    payment_status="paid",
                    created_at=datetime.utcnow() - timedelta(days=days_ago),
                )
                db.add(booking)
                db.flush()

                rating = random.choices([5, 4, 3], weights=[0.65, 0.25, 0.1])[0]
                ratings.append(rating)
                db.add(
                    Review(
                        booking_id=booking.id,
                        customer_id=customer.id,
                        provider_id=provider.id,
                        rating=rating,
                        comment=random.choice(REVIEW_COMMENTS),
                        created_at=booking.created_at + timedelta(hours=2),
                    )
                )

            provider.review_count = len(ratings)
            provider.avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
            db.commit()
            print(f"Seeded provider: {business_name} ({city})")

        print("Seed complete.")
        print("Demo customer login: maria.garcia@example.com / password123")
        print("Demo provider login: owner0@sevenpros-demo.com / password123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
