import re

from preprocessing.exception_dict import lemmatization_dict

def useLemma(texts):
    print('Lemmatizating Texts')

    for i in range(len(texts)):
        arr_text = wordSegment(texts[i])
        texts[i] = filterLemmatization(arr_text)

    return texts

def wordSegment(text):
    final_text = []
    arr_text = text.split()
    punc_dict = ['.', ',', '!', '(', ')', '/', '$', '\'', '"', '?', '+', '-', '=', '`', ':']
    
    for ele in arr_text:
        punc = -1
        for i in range(len(ele)):
            if ele[i] in punc_dict:
                punc = i
                break
        if punc != -1:
            final_text.append(ele[:i])
            final_text.append(ele[i:])
        else:
            final_text.append(ele)
    return final_text

def filterLemmatization(arr_text):
    final_text = []

    i = 0
    while i < len(arr_text) - 1:
        if (arr_text[i] + ' ' + arr_text[i + 1]) in lemmatization_dict:
            final_text.append(lemmatization_dict[(arr_text[i] + ' ' + arr_text[i + 1])])
            i += 1
        elif arr_text[i] in lemmatization_dict:
            final_text.append(lemmatization_dict[arr_text[i]])
        elif len(arr_text[i]) > 1 and arr_text[i][0].isnumeric():
            pos = 0
            while pos < len(arr_text[i]) and arr_text[i][pos].isnumeric():
                pos += 1
            if arr_text[i][:pos] in lemmatization_dict:
                final_text.append(lemmatization_dict[arr_text[i][:pos]])
            elif arr_text[i][:pos] not in lemmatization_dict:
                final_text.append(arr_text[i][:pos])
            if pos < len(arr_text[i]) and arr_text[i][pos:] in lemmatization_dict:
                final_text.append(lemmatization_dict[arr_text[i][pos:]])
            else:
                final_text.append(arr_text[i][pos:])

        else:
            final_text.append(arr_text[i])
        i += 1

    if len(arr_text) != 0:
        if arr_text[-1] in lemmatization_dict:
            final_text.append(lemmatization_dict[arr_text[-1]])
        else:
            final_text.append(arr_text[-1])

    return ' '.join(final_text)