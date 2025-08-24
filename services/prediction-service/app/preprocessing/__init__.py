from preprocessing.word_segment import word_segment, label_mapping
from preprocessing.normalize import useNormalize
from preprocessing.lemma import useLemma
from preprocessing.tokenize import useTokenize
from preprocessing.remove_stopword import removeStopword
from preprocessing.identify import useIdentify
from preprocessing.extract_feature import extractFeature
from preprocessing.emoji_handling import emojiHandling
from preprocessing.get_tokenizer import getTokenizer
from runtime_device import device

class VEDPreprocessingPipeline:
    def __init__(self):
        self.normalize = useNormalize
        self.lemma = useLemma
        self.tokenize = useTokenize
        self.remove_stopword = removeStopword
        self.identify = useIdentify
        self.extract_feature = extractFeature
        self.emoji_handling = emojiHandling
        self.get_tokenizer = getTokenizer

    def invoke(self, contents):
        texts = self.normalize(contents)
        texts = self.lemma(texts)
        texts = self.tokenize(texts)
        texts = self.remove_stopword(texts)
        texts = self.emoji_handling(texts)
        tokenizer = self.get_tokenizer()
        ids, attn = self.identify(texts, tokenizer)
        features = self.extract_feature(device, ids, attn)

        return features
    
class HotelPreprocessingPipeline:
    def __init__(self):
        self.tokenizer = getTokenizer()
        self.MAX_LENGTH = 128

    def invoke(self, inputs):
        # Word segmentation
        titles, contents = zip(*inputs)

        # Word segmentation theo batch
        seg_titles = [word_segment(t) for t in titles]
        seg_contents = [word_segment(x) for x in contents]

        title_encoded = self.tokenizer.batch_encode_plus(seg_titles, 
                                            max_length=self.MAX_LENGTH,
                                            padding='max_length',
                                            truncation=True,
                                            return_tensors='np')

        content_encoded = self.tokenizer.batch_encode_plus(seg_contents, 
                                            max_length=self.MAX_LENGTH,
                                            padding='max_length',
                                            truncation=True,
                                            return_tensors='np')

        return  title_encoded['input_ids'], content_encoded['input_ids']