"""गंगा का वचन (Ganga's condition): a ~70 s Mahabharat test clip for fast feedback on look, voices and diction.

    python3 scripts/mahabharat-ganga-shantanu-test.py      writes src/stories/mahabharat-ganga-shantanu-test/story.json

Follows the Critical Edition, Adi Parva 92: Shantanu, roaming the bank of the Ganga after deer, meets a radiant
woman who agrees to be his wife on one condition: he must never stop her or speak harshly to her, whatever she
does, or she will leave him. The "never ask who I am" wording is a TV-serial version, so it is not used.
"""
from katha import A, Story

st = Story("mahabharat-ganga-shantanu-test", "गंगा का वचन", series="mahabharat")

bank = st.scene("bank", env="ganga-tat", actors={
    "ganga": A("ganga", 0.68, facing="left", expr="smile"),
})

# ---------- hook ----------
st.say(bank, "हस्तिनापुर के राजा शांतनु ने, एक ऐसी स्त्री से विवाह किया, जिसके बारे में वो कुछ भी नहीं जानते थे। न उसका नाम, न उसका घर।", "neutral",
       camera=st.wide("push-in"), pause_after=0.4)

# ---------- the meeting ----------
st.say(bank, "एक दिन, हिरणों का पीछा करते-करते, राजा शांतनु गंगा नदी के किनारे आ पहुँचे।", "neutral",
       camera=st.wide("pan-right"), enter={"shantanu": A("shantanu", -0.08, facing="right", variant="plain")},
       act={"shantanu": {"pose": "walk", "toX": 0.32}})
st.say(bank, "वहाँ तट पर, एक अद्भुत सुंदर स्त्री खड़ी थी। उसका रूप ऐसा था, मानो नदी की धूप ने देह धर ली हो।", "surprise",
       camera=st.close("ganga"), act={"ganga": {"expr": "smile"}})
st.say(bank, "राजा उसे देखते ही रह गए। वो आगे बढ़े, और बोले,", "surprise",
       camera=st.close("shantanu"), act={"shantanu": {"pose": "stand", "expr": "surprised"}})
st.say(bank, "हे सुंदरी, तुम कौन हो? मैं कुरुवंश का राजा शांतनु, तुम्हें अपनी रानी बनाना चाहता हूँ।", "happy",
       camera=st.close("shantanu"), who="shantanu", act={"shantanu": {"pose": "offer", "expr": "smile"}},
       delivery="a smitten king, gentle and earnest")

# ---------- the condition ----------
st.say(bank, "वो स्त्री मुस्कुराई। फिर उसने एक शर्त रखी।", "neutral",
       camera=st.two("shantanu", "ganga"), act={"ganga": {"pose": "talk", "expr": "smile"}}, pause_after=0.4)
st.say(bank, "मैं आपकी रानी बनूँगी, राजन। पर मैं जो भी करूँ, अच्छा या बुरा, आप मुझे कभी रोकेंगे नहीं।", "neutral",
       camera=st.close("ganga"), who="ganga", act={"ganga": {"pose": "talk", "expr": "neutral"}},
       delivery="a serene divine woman, calm and grave")
st.say(bank, "और न ही कभी, मुझसे कोई कठोर वचन कहेंगे। जिस दिन ऐसा हुआ, उसी दिन मैं आपको छोड़कर चली जाऊँगी।", "neutral",
       camera=st.close("ganga"), who="ganga", act={"ganga": {"pose": "point", "expr": "thinking"}},
       delivery="a serene divine woman, quietly warning")
st.say(bank, "राजा शांतनु प्रेम में डूबे थे। उन्होंने बिना एक पल सोचे, वचन दे दिया।", "happy",
       camera=st.two("shantanu", "ganga"), act={"shantanu": {"pose": "bow", "expr": "smile"}, "ganga": {"expr": "smile"}})

# ---------- cliffhanger ----------
st.say(bank, "पर वो नहीं जानते थे, कि यही वचन, एक दिन उनसे, उनका सब कुछ माँग लेगा। और यहीं से शुरू होगी, भीष्म की कहानी।", "fear",
       camera=st.wide("push-in"), act={"ganga": {"expr": "sad"}}, pause_after=0.6)

st.write()
