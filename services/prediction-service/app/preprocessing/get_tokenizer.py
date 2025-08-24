from transformers import AutoTokenizer

def getTokenizer():
    tokenizer = AutoTokenizer.from_pretrained(
        'vinai/phobert-base-v2',
        use_fast=True
    )

    return tokenizer