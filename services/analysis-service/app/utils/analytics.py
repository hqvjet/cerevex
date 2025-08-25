from __future__ import annotations

from collections import Counter
from typing import Dict, List, Tuple


def compute_label_distribution(labels: List[str]) -> Dict[str, int]:
    return dict(Counter(labels))


def avg_length(texts: List[str]) -> float:
    if not texts:
        return 0.0
    total = sum(len(t or "") for t in texts)
    return round(total / max(len(texts), 1), 2)


def pick_examples(
    comments: List[str],
    labels: List[str],
    positive_labels: List[str],
    negative_labels: List[str],
    k: int = 3,
) -> Tuple[List[str], List[str]]:
    """Pick up to k positive & negative example comment texts.

    Matching is case-insensitive and supports shorthand variants (e.g. 'pos', 'neg').
    """
    pos_set = {p.lower() for p in positive_labels}
    neg_set = {n.lower() for n in negative_labels}
    picked_pos: List[str] = []
    picked_neg: List[str] = []
    for c, l in zip(comments, labels):
        ll = (l or '').lower()
        if ll in pos_set and len(picked_pos) < k:
            picked_pos.append(c)
        elif ll in neg_set and len(picked_neg) < k:
            picked_neg.append(c)
        if len(picked_pos) >= k and len(picked_neg) >= k:
            break
    return picked_pos, picked_neg


def buy_recommendation_from_distribution(dist: Dict[str, int]) -> tuple[str, float]:
    total = sum(dist.values()) or 1
    # Assume labels include some of these strings; map heuristically
    positive_keys = {"positive", "pos", "good", "+"}
    negative_keys = {"negative", "neg", "bad", "-"}
    neutral_keys = {"neutral", "neu"}

    pos = sum(v for k, v in dist.items() if k.lower() in positive_keys)
    neg = sum(v for k, v in dist.items() if k.lower() in negative_keys)
    neu = sum(v for k, v in dist.items() if k.lower() in neutral_keys)

    score = (pos - neg) / total  # -1..1
    conf = round(abs(score), 2)
    if pos > neg * 1.2:
        return ("Recommended to buy", conf)
    if neg > pos * 1.2:
        return ("Not recommended to buy", conf)
    # fallback
    if pos >= neg:
        return ("Likely worth buying", conf)
    else:
        return ("Consider alternatives", conf)
