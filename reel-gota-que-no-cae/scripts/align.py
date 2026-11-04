"""Forced alignment for the narrator takes without an ASR model.

The text is known, so each speech segment (between silences) is matched to its
words, the words are spelled into broad phoneme classes (vowel, fricative,
plosive, nasal, liquid, approximant) and a left-to-right Viterbi pass places
them on the signal's vocal-band energy and high-frequency tilt. Output: data/words.json with per-word start/end
in seconds of the RAW take.

Run: python scripts/align.py ../audio/raw/gota-que-no-cae/<take>.mp3
"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 16000
HOP = 0.005

# speech segments (separated by pauses >= 0.25 s) and their text. The script's 6 lines break into 11 segments:
# the take pauses inside lines 1, 2 and 4.
TEXT = {
    "A": ["¿Estabas esperando a que cayera?",                                       # 1a
          "No va a caer.",                                                          # 1b
          "Esa gota no existe:",                                                    # 2a
          "ni el agua, ni el grifo, ni su reflejo.",                                # 2b
          "Todo eso lo ha calculado un ordenador.",                                 # 2c
          "Y aun así, no podías dejar de mirarla.",                                 # 3
          "Ahora piensa en tu negocio:",                                            # 4a
          "el mensaje sin contestar, la llamada perdida, el presupuesto que nadie sigue…",  # 4b
          "gota a gota, se te escapan clientes.",                                   # 4c
          "En AIgencyx Labs cerramos esas fugas, para que cada cliente llegue a donde tiene que llegar.",  # 5
          "Comenta auditoría y te decimos por dónde se te escapan."],               # 6
}
# word starts read off the spectrum (formant track + fricatives, 20 ms steps) where the take runs the commas together
# and the pause splitter picks the f of «grifo» / «reflejo» instead of the breaths. Keyed by (segment start, word index).
#  «ni el agua, ni el grifo, ni su reflejo»: n-i 5.44, e 5.52, a of «agua» 5.70 · nasal of «ni» 6.17, e 6.33, g-r 6.50 ·
#  «ni» 7.13, the s of «su» 7.32, r-e of «reflejo» 7.50 (its f at 7.64, its j at 7.86)
#  «gota a gota, se te escapan»: no breath at the comma; the 2nd «go» at 21.64, the s of «se» at 22.08, t of «te» 22.30
ANCHORS = {(5.4, 0): 5.445, (5.4, 1): 5.52, (5.4, 2): 5.70, (5.4, 3): 6.17, (5.4, 4): 6.33, (5.4, 5): 6.50,
           (5.4, 6): 7.13, (5.4, 7): 7.32, (5.4, 8): 7.50,
           (21.1, 1): 21.52, (21.1, 2): 21.64, (21.1, 3): 22.08, (21.1, 4): 22.30, (21.1, 5): 22.42,
           (24.2, 3): 25.18}
SENTENCE_OF_SEGMENT = [0, 0, 1, 1, 1, 2, 3, 3, 3, 4, 5]
# spelled as spoken
SPOKEN = {"AIgencyx": "eiyensis"}
V = "aeiouáéíóúü"
STRONG = "aeoáéóíú"


def _syllables(word):
    w = SPOKEN.get(re.sub(r"[^\wÁÉÍÓÚáéíóúñÑü]", "", word), re.sub(r"[^\wáéíóúñü]", "", word.lower()))
    w = w.lower().replace("qu", "q").replace("gue", "ge").replace("gui", "gi")
    n, prev = 0, None
    for ch in w:
        if ch in V:
            if prev is None or (prev in STRONG and ch in STRONG):
                n += 1
            prev = ch
        else:
            prev = None
    return max(n, 1)


def load(p):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def frames_db(x, lo=None, hi=None):
    if lo:
        x = sosfiltfilt(butter(4, [lo, hi], btype="band", fs=SR, output="sos"), x)
    h = int(HOP * SR)
    n = len(x) // h
    e = np.sqrt(np.mean(x[: n * h].reshape(n, h) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(e)


def segments(db, thr=-40, min_gap=0.25):
    on = db > thr
    segs, i, n = [], 0, len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or (j + int(min_gap / HOP) < n and on[j:j + int(min_gap / HOP)].any())):
                j += 1
            segs.append((i * HOP, j * HOP))
            i = j
        else:
            i += 1
    return [s for s in segs if s[1] - s[0] > 0.12]


# phoneme classes → template in z-scored (vocal energy, high-freq tilt)
TPL = {"V": (0.9, -0.9), "F": (-0.7, 1.6), "P": (-1.4, 0.2), "N": (-0.1, -0.9), "L": (0.3, -0.6), "A": (0.0, -0.4)}
MIN_FR = {"V": 9, "F": 8, "P": 6, "N": 6, "L": 4, "A": 5}  # in 5 ms frames


def phones(word):
    w = SPOKEN.get(re.sub(r"[^\wÁÉÍÓÚáéíóúñÑü]", "", word), re.sub(r"[^\wáéíóúñü]", "", word.lower())).lower()
    if w == "y":
        return ["V"]
    out, i = [], 0
    while i < len(w):
        ch, nx = w[i], w[i + 1] if i + 1 < len(w) else ""
        if ch in V:
            # diphthongs collapse into one vowel nucleus
            if out and out[-1] == "V" and not (ch in STRONG and w[i - 1] in STRONG):
                i += 1
                continue
            out.append("V")
        elif ch == "h":
            pass
        elif ch in "sfzjx" or (ch in "cg" and nx in "eiéí" and ch == "c") or (ch == "g" and nx in "eiéí"):
            out.append("F")
        elif ch in "ptkcq":
            out.append("P")
            if ch == "q":
                i += 1  # qu
        elif ch in "bdg" and (i == 0 or w[i - 1] in "mn"):
            out.append("P")
        elif ch in "mnñ":
            out.append("N")
        elif ch in "lr":
            if ch == "r" and nx == "r":
                i += 1
            if ch == "l" and nx == "l":
                out.append("A"); i += 2; continue
            out.append("L")
        else:  # b d g v y w between vowels: approximants
            out.append("A")
        i += 1
    return out


def features(x):
    voc = frames_db(x, 300, 3000)
    hf = frames_db(x, 3500, 7900) - frames_db(x)
    z = lambda a: (a - a.mean()) / (a.std() + 1e-6)
    return voc, hf, z


def viterbi(E, H, states):
    T, S = len(E), len(states)
    tp = np.array([TPL[c] for c in states])
    cost = (E[:, None] - tp[None, :, 0]) ** 2 + (H[:, None] - tp[None, :, 1]) ** 2
    INF = 1e18
    D = np.full((T, S), INF)
    B = np.zeros((T, S), dtype=np.int8)
    D[0, 0] = cost[0, 0]
    for t in range(1, T):
        stay = D[t - 1]
        move = np.concatenate([[INF], D[t - 1, :-1]])
        B[t] = move < stay
        D[t] = cost[t] + np.minimum(stay, move)
    path, s_ = [], S - 1
    for t in range(T - 1, -1, -1):
        path.append(s_)
        s_ -= int(B[t, s_])
    return path[::-1]


def internal_pauses(db, s0, s1, thr=-38, min_len=0.05):
    """(start, end) of quiet stretches strictly inside a segment."""
    i0, i1 = int(s0 / HOP), int(s1 / HOP)
    q = db[i0:i1] < thr
    out, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]:
                j += 1
            if (j - i) * HOP >= min_len and i > 0 and j < len(q):
                out.append((s0 + i * HOP, s0 + j * HOP))
            i = j
        else:
            i += 1
    return out


def viterbi_words(words, s0, s1, voc, hf, z):
    i0, i1 = int(s0 / HOP), int(s1 / HOP)
    E, H = z(voc[i0:i1]), z(np.maximum(hf[i0:i1], -40))
    states, owner = [], []
    for k, w in enumerate(words):
        for c in phones(w):
            for _ in range(MIN_FR[c]):  # minimum duration as chained sub-states
                states.append(c)
                owner.append(k)
    if len(states) > len(E):
        return [s0 + (s1 - s0) * k / len(words) for k in range(len(words))]
    path_ = viterbi(E, H, states)
    first = {}
    for t, st in enumerate(path_):
        first.setdefault(owner[st], t)
    b = [s0 + first[k] * HOP for k in range(len(words))]
    b[0] = s0
    return b


def align(take, path):
    x = load(path)
    db = frames_db(x)
    voc, hf, z = features(x)
    segs = segments(db)
    texts = TEXT[take]
    assert len(segs) == len(texts), (take, len(segs), segs)
    out = []
    for (s0, s1), text in zip(segs, texts):
        words = text.split()
        # commas: split the segment on its longest internal pauses (>= 50 ms) so the listed
        # words ("goma, ni aire, ni fotografía") land exactly between the take's own breaths
        groups, cur = [], []
        for w in words:
            cur.append(w)
            if w.endswith(","):
                groups.append(cur); cur = []
        if cur:
            groups.append(cur)
        pauses = internal_pauses(db, s0, s1)
        pauses = sorted(sorted(pauses, key=lambda p: p[0] - p[1])[: len(groups) - 1])
        if len(pauses) != len(groups) - 1:
            pauses, groups = [], [words]
        edges = [s0] + [p for pa in pauses for p in pa] + [s1]
        bounds = []
        for g, sub in enumerate(groups):
            a, b = edges[2 * g], edges[2 * g + 1]
            bounds += [round(x, 3) for x in viterbi_words(sub, a, b, voc, hf, z)]
        ends = [bounds[k + 1] if k + 1 < len(words) else s1 for k in range(len(words))]
        for g in range(len(groups) - 1):  # the comma word ends where its pause starts
            k = sum(len(x) for x in groups[: g + 1]) - 1
            ends[k] = pauses[g][0]
        anchored = False
        for k, w in enumerate(words):
            if (round(s0, 1), k) in ANCHORS:  # hand-checked on the spectrum (fricatives / breaths)
                bounds[k] = ANCHORS[(round(s0, 1), k)]
                anchored = True
        if anchored:
            ends = [bounds[k + 1] if k + 1 < len(words) else s1 for k in range(len(words))]
            assert all(b1 > b0 for b0, b1 in zip(bounds, bounds[1:])), (text, bounds)
        for k, w in enumerate(words):
            out.append({"w": w, "s": round(bounds[k], 3), "e": round(ends[k], 3)})
        print(f"{take} {s0:6.2f}-{s1:6.2f} " + " ".join(f"{w}[{b:.2f}]" for w, b in zip(words, bounds)))
    return out, segs


res = {}
for take, path in zip(("A",), sys.argv[1:2]):
    words, segs = align(take, path)
    res[take] = {"words": words, "segments": [[round(a, 3), round(b, 3)] for a, b in segs],
                 "sentenceOfSegment": SENTENCE_OF_SEGMENT}
    print(f"{len(segs)} segments -> {len(set(SENTENCE_OF_SEGMENT))} sentences")
os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
json.dump(res, open(os.path.join(ROOT, "data", "words.json"), "w"), ensure_ascii=False, indent=1)
