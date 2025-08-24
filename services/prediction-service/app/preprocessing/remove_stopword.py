import pandas as pd

stopwords = pd.read_csv('res/stopwords.csv')['stopword'].apply(str).tolist()
def removeStopword(texts):
    for i in range(len(texts)):
        temp = []
        for word in texts[i].split():
            if word not in stopwords:
                temp.append(word)
        texts[i] = ' '.join(temp)

    return texts