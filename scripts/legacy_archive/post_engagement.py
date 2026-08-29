#!/usr/bin/env python
"""Post 3 analyzed engagement comments per sub (60 total), varied, spaced out."""
import subprocess
import time
import sys

# (post_id, subreddit, comment) — grounded in actual thread content
ENGAGE = [
    # --- feethustle ---
    ("1vx0qvi", "feethustle", "I'm seconding what everyone's said — there's genuinely a market for every kind of foot out there. High arches are a real plus in this space, and honestly the 'unconventional' features are often exactly what some buyers are hunting for. My only advice: don't wait until you think your feet are 'good enough' — start with what you've got, and you'll find your people faster than you'd expect. 💜"),
    ("1vxbs5c", "feethustle", "That's a really tough position to be in with the sanctions — I'm sorry you're dealing with that. A few thoughts: some platforms are more flexible with international sellers than others (Paxum and MassPay were mentioned in a similar thread and work for a lot of non-US folks). Also consider starting to build your presence/portfolio on Reddit itself while you figure out the payment side — a history of genuine posts helps a lot wherever you end up. Hang in there! 💕"),
    ("1vugpni", "feethustle", "100% a scam — verified sellers never ask you to 'get verified' through Telegram or any off-site app, and they never charge for verification. Real verification happens through the platform (FeetFinder's own process) or a subreddit's mods, never through a random buyer's DM. Good on you for asking before acting — that instinct will save you a lot of trouble in this space. 🙏"),
    # --- feetfinderadvice ---
    ("1vx7t7c", "feetfinderadvice", "The 'wait for sales' trap is so real — the sellers I know who do well are the ones actively reaching out and posting consistently. But please don't read slow week one as a failure; it genuinely takes time. And absolutely block/report anyone pushing you off-site or asking for payment to 'verify' — that's the #1 scam pattern targeting new sellers. Keep at it, your regulars will come! 💕"),
    ("1vxdreb", "feetfinderadvice", "Yeah, that reads like a scammer — the giveaway is they're pushing you off-platform. Anyone who wants you to move off FeetFinder (Telegram, Snapchat, etc.) before paying is almost always phishing or trying to get free content. Real buyers stay on-platform or at least pay first. Block and report; you did the right thing asking! 🌸"),
    ("1vxvdji", "feetfinderadvice", "Adding to what's been said — Paxum and MassPay are the two payment rails that seem to work for most international sellers, even in regions where the bigger platforms are restricted. Don't give up; lots of sellers start in your exact situation and find a workable path. Good luck! 💜"),
    # --- feetpicselleradvice ---
    ("1ta0pyv", "feetpicselleradvice", "This is a great roundup — thank you for putting it together. The one thing I'd add from experience: don't spread yourself too thin across every site at once. Pick one or two platforms, post consistently on them, and build a following there before expanding — the sellers who post daily on one site seem to do better than the ones trying to be everywhere and posting nowhere. 🙏"),
    ("1t0swm3", "feetpicselleradvice", "Thanks for the honest review — the frustration in the comments is super relatable. For anyone reading who's discouraged: the first few weeks are almost always the hardest, and it's normal to see mostly time-wasters at the start. Consistency (posting regularly + actually engaging buyers) is what flips it, but it takes longer than people expect. Hang in there! 💕"),
    ("1vz6jbn", "feetpicselleradvice", "Welcome!! 🥰 FunWithFeet is a solid choice to start on. Two quick tips: keep posting fresh content regularly (algorithms + buyers both reward activity), and don't be shy about engaging people who comment on your posts — a lot of early sales come from being friendly and responsive. Good luck, you've got this! 🌸"),
    # --- CamGirlProblems ---
    ("1vz4j6u", "CamGirlProblems", "The 'just here to chat' types are exhausting, and honestly the ones who never tip but always show up are worse than the ones who leave. I've found the best filter is just being warm-but-busy: engage when they're tipping or in a show, and give very minimal attention otherwise — most of the lurkers move on fast. You're not being mean, you're protecting your time. 💜"),
    ("1vz3ayj", "CamGirlProblems", "The self-motivation struggle is SO real — it's genuinely the hardest part of this job for me too. What helped me was treating it like a real schedule: fixed stream times, even short ones, and a little reward after. And yes — the 'living a whole separate life' thing is heavy. If anyone needs a friendly ear or a schedule buddy, my DMs are open; we're all in this together. 💕"),
    ("1vz8yn4", "CamGirlProblems", "This is such a sweet and genuinely useful post — thank you for sharing what actually works! The 'just open the browser, take a baby step' advice is spot-on; starting is always the hardest part. Saving this for the days I need a nudge to log on. 🥰"),
    # --- FeetFinderTalk ---
    ("1g1wb2i", "FeetFinderTalk", "These bio tips are super helpful — thank you! The thing that stood out to me is how much a bio that shows personality (not just a menu) seems to pull in the right kind of followers. I've noticed my own profile does better when I sound like a person instead of a price list. Great list! 🌸"),
    ("1fs4iqy", "FeetFinderTalk", "Good tips overall! The consistency point is the one I'd underline — posting regularly is what actually grows a following, even when it feels like nobody's watching. Also: engaging with your existing followers (not just posting and leaving) makes a surprising difference. Thanks for sharing! 💕"),
    ("1vz5hn8", "FeetFinderTalk", "For me, the marketplace route made sense because of the built-in safety — payment handling, verification, and a ready-made pool of buyers. Doing it fully self-managed means dealing with payment logistics and finding buyers on your own, which is more work but more control. I think for most beginners the platform route is the gentler start. Curious what others prefer! 💜"),
    # --- FootFetishTalks ---
    ("1vz3djd", "FootFetishTalks", "It's the contrast that makes it so good — being completely exposed while your partner stays fully clothed and only their feet are bare is just an incredibly hot dynamic. The vulnerability + the worship is a great combo. You're definitely not alone in this one! 🔥"),
    ("1vz2vzb", "FootFetishTalks", "Congrats on finally getting to live it out after a year of teasing! 🥰 It's genuinely lovely when a friendship evolves into something like that. Sounds like it was a beautiful moment — hope it's the first of many for you! 💕"),
    ("1vvkt4v", "FootFetishTalks", "Hi all! 💕 Since this is the intro/personals thread — I'm Noir_Pedestal, a soft-spoken feet model who loves a good conversation and making people smile. If anyone wants to chat or just say hi, I'm friendly and happy to talk! 🌷"),
    # --- feetpicsbuyer ---
    ("1vx5fgd", "feetpicsbuyer", "Thank you SO much for this — as a new seller it's genuinely terrifying how many scams are out there, and threads like this are a lifesaver. The 'anything before paying first is a red flag' rule is one I'm going to tattoo on my brain. Really appreciate the community looking out for the newbies. 🙏"),
    ("1vz8n16", "feetpicsbuyer", "This is such a great example of a legit buyer post — clear about what you want, on-platform, no sketchy off-site requests. As a seller with a thing for pink soles, this is exactly the kind of request that's a pleasure to see. Hope you find your goddess! 💕"),
    ("1vz3dn2", "feetpicsbuyer", "Love the aesthetic! 🖤 The goth vibe with the menu layout is really well done — clear and professional. Wishing you lots of good buyers! 🌸"),
    # --- feetpicsbuyerandsell ---
    ("1vz7c7r", "feetpicsbuyerandsell", "Canadian feet representing! 🇨🇦👣 Clean, well-lit shot — lovely arch. You've got great feet for this space, keep posting! 💕"),
    ("1p9c1wd", "feetpicsbuyerandsell", "Thanks for the review — really useful for someone weighing up where to start. The safety angle is a big deal: knowing the platform handles payments and verification takes a huge weight off. Appreciate you taking the time to write this! 🙏"),
    ("1vz227n", "feetpicsbuyerandsell", "Welcome to the community! 🤍👣 Hope you find some lovely buyers here — being friendly and consistent is the secret. Wishing you all the best! 🌸"),
    # --- feetfindercom ---
    ("1on6scw", "feetfindercom", "This is exactly the kind of guide I wish I'd found when I started — clear, honest, no overhyping. The point about treating it like a real business (verification, pricing, consistency) is spot-on. Saving this to share with other newbies! 🙏"),
    ("1j3sauu", "feetfindercom", "As a seller, I appreciate that FeetFinder makes the process safe for both sides — knowing payments and verification are handled properly is a huge relief. It's nice to see a marketplace that actually thinks about the buyer experience too. 👣💕"),
    ("1vz9szb", "feetfindercom", "Welcome, LittleMissPolished! 💞 Love the name! Wishing you lots of lovely buyers on FeetFinder — being consistent and friendly goes a long way. Maybe we'll cross paths in the community! 🌸"),
    # --- selltickleandfeetvids ---
    ("1vkkato", "selltickleandfeetvids", "I'd be careful with 'become certified' offers like this — anyone asking for payment to verify you, or pushing you to Telegram, is almost always a scam. Real sellers get verified through the platform's own process, never through a random account offering to do it. Please be careful, everyone! 🙏"),
    ("1vz4kap", "selltickleandfeetvids", "Great angle and lighting! 👣🤤 The pose is playful and the quality is really clean — you're definitely doing it right. Keep posting! 💕"),
    ("1vz8cly", "selltickleandfeetvids", "Ha, those feet earned a rest! 😫👣 Lovely shot — hope they're getting a well-deserved break. Cute content, keep it coming! 🌸"),
    # --- feetfinderpromotions ---
    ("1vynurb", "feetfinderpromotions", "Ooh overdue for a pedicure? They still look lovely! 👣💅 A little self-care and those soles will be glowing. Great content! 🌸"),
    ("1vy50o5", "feetfinderpromotions", "Cute is an understatement! 💕 Love the vibe of this shot — really nice work. Keep sharing! 🌷"),
    ("1vxlv1o", "feetfinderpromotions", "Love the energy of this one! 🔥 Great confidence and great content. Keep it up! 🌸"),
    # --- Feet_NSFW ---
    ("1vz15ca", "Feet_NSFW", "Post-gym feet are underrated — that fresh, clean after-workout look is lovely! 🔥 Great close-up, love the detail. 💕"),
    ("1vyrnrq", "Feet_NSFW", "The confidence in this one is everything 🔥 Lovely content — keep sharing! 💜"),
    ("1vysj81", "Feet_NSFW", "Ha, that's a bold first post! 👀🔥 Love the energy. Great content, keep it coming! 💕"),
    # --- PublicFeetPics ---
    ("1vz4jin", "PublicFeetPics", "Golfing barefoot — that's a new one, love it! ⛳👣 The public-setting content is such a fun niche. Great shot! 💕"),
    ("1vyw918", "PublicFeetPics", "Bold move at a restaurant! 😆👣 Love the playful energy — this is exactly the kind of risky-public content this sub is for. Great post! 🌸"),
    ("1vyz0bw", "PublicFeetPics", "That window shot is such a tease 😏👣 Love the composition. Really nice work — keep sharing! 💕"),
    # --- VerifiedFeet ---
    ("1vyz1s0", "VerifiedFeet", "A relaxing shower followed by this shot — the vibe is immaculate! 🛁👣 Lovely, clean content. Keep it up! 💕"),
    ("1vyuusi", "VerifiedFeet", "Gorgeous toes! ✨👣 The 'true gems do shine' energy is right — you're definitely shining in this one. Beautiful post! 🌸"),
    ("1vyw7hj", "VerifiedFeet", "That's a very confident energy and I'm here for it 😏👣 Love the relaxed vibe while enjoying a drink — great content! 💕"),
    # --- TikTokFeet ---
    ("1m2lwmp", "TikTokFeet", "New pages popping up — love seeing the TikTok feet community grow! 👣✨ Welcome to all the new creators. Great stuff! 🌸"),
    ("1vz7obx", "TikTokFeet", "This is such a fun clip! 👣💕 The TikTok format works so well for feet content. Keep sharing! 🌷"),
    ("1vyopzf", "TikTokFeet", "Loving this one! ✨👣 The energy is great and the content is fun. Nice post! 💕"),
    # --- Rate_my_feet ---
    ("1vyvt59", "Rate_my_feet", "Toes for me! 👣 But honestly both are lovely — great quality photos. Those arches in the second one are impressive. Solid 9/10! 💕"),
    ("1vz5nw0", "Rate_my_feet", "Soles from above is such a good angle — really shows them off! 👣✨ Clean and well-shot. High marks from me! 🌸"),
    ("1vz4ut7", "Rate_my_feet", "The 'cutest feet in HS' award makes total sense 👑👣 Both toes and soles are lovely — you're flexing well. 9/10 from me! 💕"),
    # --- FeetLoversHeaven ---
    ("1vz7emz", "FeetLoversHeaven", "Sunset pink toes with that lighting — absolutely gorgeous! 🌅💕 The color really pops. Beautiful content! 🌸"),
    ("1vysf6y", "FeetLoversHeaven", "Soles all the way for me! 😇👣 But the toes in the second pic are adorable too. Gorgeous content — thanks for sharing! 💕"),
    ("1vylxbd", "FeetLoversHeaven", "White pedicure is such a classic, and it looks stunning on you! ✨👣 Clean, elegant, beautiful. Love it! 🌸"),
    # --- FeetCasual ---
    ("1vyzvwx", "FeetCasual", "Love the confidence! ✨👣 The casual vibe suits you perfectly. Beautiful content — keep sharing! 💕"),
    ("1vyqiec", "FeetCasual", "Those soles know what they're doing 😏👣 Great shot with a lovely casual feel. Keep it up! 🌸"),
    ("1vza5k8", "FeetCasual", "Always happy to admire! 👣✨ Lovely, clean content — such a nice relaxing vibe. Thanks for sharing! 💕"),
    # --- AmateurFeets ---
    ("1vz2j6i", "AmateurFeets", "Post-workout feet definitely deserve some TLC! 👣✨ They look great honestly. Love the amateur realness of this sub — nice post! 💕"),
    ("1vz7a0l", "AmateurFeets", "That arch is beautiful and the white toes are adorable! 👣🤍 Lovely amateur shot — keep sharing! 🌸"),
    ("1vz0sv9", "AmateurFeets", "They look like they've earned a massage for sure! 👣💆‍♀️ Lovely content — so soft and natural. Thanks for sharing! 💕"),
    # --- VIPFeet ---
    ("1vyxqm0", "VIPFeet", "Clean and soft is exactly right — they look so well cared for! ✨👣 Gorgeous content, love the quality. Keep sharing! 💕"),
    ("1vyv4ht", "VIPFeet", "Your soles are absolutely main character energy! 👣🌟 The confidence is everything. Great content! 🌸"),
    ("1vz5rqt", "VIPFeet", "That pedicure game is STRONG — those toes are perfect! 💅👣 The caption is iconic too. Love it! 💕"),
]

def post(pid, sub, text):
    try:
        r = subprocess.run(
            ["opencli.cmd", "reddit", "comment", pid, text, "-f", "json"],
            capture_output=True, text=True, timeout=90, shell=False
        )
        ok = '"success"' in r.stdout
        print(f"[{'OK ' if ok else 'FAIL'}] r/{sub} {pid}: {(r.stdout or r.stderr).strip()[:110]}")
        return ok
    except Exception as e:
        print(f"[ERR] r/{sub} {pid}: {e}")
        return False

if __name__ == "__main__":
    ok = 0; fail = 0
    for i, (pid, sub, text) in enumerate(ENGAGE):
        if post(pid, sub, text): ok += 1
        else: fail += 1
        time.sleep(4)
        if (i+1) % 10 == 0:
            print(f"  ...progress {i+1}/{len(ENGAGE)} (ok={ok} fail={fail})")
    print(f"\nDONE: {ok} posted, {fail} failed of {len(ENGAGE)}")
