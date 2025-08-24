from vncorenlp import VnCoreNLP

print('Loading VnCoreNLP ...')
annotator = VnCoreNLP("tools/vncorenlp/VnCoreNLP-1.1.1.jar", annotators="wseg", max_heap_size='-Xmx2g')

def word_segment(text):
    return ' '.join(annotator.tokenize(text)[0])

label_mapping = {
    0: "Negative",
    1: "Neutral",
    2: "Positive"
}