import os

filepath = r"C:\Users\USER\Desktop\closecraft\src\app\(marketing)\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "You've already spent money, time and effort getting people to enquire. Zeerocodes helps you respond faster, follow up consistently, qualify serious prospects and get the right opportunities to your sales team.":
    "Whether your leads come from Facebook Ads, website forms, or CSV uploads, pull them in instantly. Work them in real-time and hand verified prospects off to your closers or appointment setters before they go cold.",
    
    "A new enquiry arrives. Nobody follows up quickly enough while the buyer's intent is highest.":
    "New leads sit in Facebook Ads or spreadsheets for hours. Nobody responds quickly enough while their buying intent is at its absolute highest.",
    
    "SLOW RESPONSE": "LEADS GOING COLD",
    
    "New leads are engaged quickly across your channels before intent decays.":
    "Pull leads instantly from Facebook Ads or CSV and trigger automated, real-time responses before they go cold.",
    
    "<h3>Fast Intake</h3>": "<h3>Real-Time Ingestion</h3>",
    
    "Move qualified opportunities toward booked appointments and verified sales.":
    "Seamlessly pass verified, warm leads directly to your appointment setters and closers so they can do what they do best.",
    
    "<h3>Closed Deals</h3>": "<h3>Send to Closers</h3>"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated landing page copy successfully.")
