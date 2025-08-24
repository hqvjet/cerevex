import numpy as np
from vncorenlp import VnCoreNLP
import re

from preprocessing.exception_dict import token_dict

# INITIALIZE VAR
rdr = VnCoreNLP("tools/vncorenlp/VnCoreNLP-1.1.1.jar", annotators="wseg", max_heap_size='-Xmx500m')

def useTokenize(texts):
    print('Tokenizing Texts')

    res = []
    for text in texts:
        temp = []
        for arr_sentence in rdr.tokenize(text):
            sequence = [word.lower() for word in arr_sentence]
            tokened_sequence = filterRareToken(sequence)
            temp.append(' '.join(tokened_sequence))
        res.append(' '.join(temp))

    return np.array([starRating(sentence) for sentence in res])

def starRating(text):
    pattern = r"\b(không|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s*(stars?|sao|\*)" 
    replacement = r"\1_\2"

    return re.sub(pattern, replacement, text, flags=re.IGNORECASE)

def filterRareToken(arr_text):
    final_token = []

    i = 0
    while i < len(arr_text) - 1:
        if (arr_text[i] + ' ' + arr_text[i + 1]) in token_dict:
            final_token.append(token_dict[(arr_text[i] + ' ' + arr_text[i + 1])])
            i += 1
        else:
            final_token.append(arr_text[i])
        i += 1

    if len(arr_text) == 1:
        final_token.append(arr_text[0])
    elif arr_text[-2] + ' ' + arr_text[-1] not in token_dict:
        final_token.append(arr_text[-1])

    return final_token