import emoji
import json
import re

with open('res/emoji_dict.json', 'r', encoding='utf-8') as f:
    emoji_dict = json.load(f)
emoji_dict = emoji_dict['dict']

def replace_emoji_with_text(text):
    def emoji_to_text(match):
        emoji = match.group(0)
        unicode = ''
        for c in emoji:
            unicode += f'0x{ord(c):x}'
        if unicode in emoji_dict:
            e_text = emoji_dict[unicode]
            if e_text is None:
                return ''
            return e_text
        else:
            return ''

    emoji_pattern = re.compile("[" + "".join(emoji.EMOJI_DATA.keys()) + "]")

    return emoji_pattern.sub(lambda m: f"{emoji_to_text(m)}", text)

def emojiHandling(texts):
    returned = []
    for i in range(len(texts)):
        returned.append(replace_emoji_with_text(texts[i]))

    return returned