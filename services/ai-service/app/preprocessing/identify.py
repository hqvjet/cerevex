import numpy as np

MAX_LEN = 200

def useIdentify(texts, tokenizer):
    print('Identifying Texts')

    data_ids = []

    for text in texts:
        encoded = tokenizer.encode(text)
        data_ids.append(encoded)

    padding_data_ids = []

    for i in range(len(data_ids)):
        if len(data_ids[i]) < MAX_LEN:
            padding_data_ids.append(data_ids[i] + [1] * (MAX_LEN - len(data_ids[i])))
        elif len(data_ids[i]) > MAX_LEN:
            padding_data_ids.append(data_ids[i][:MAX_LEN - 1] + [2])
        else:
            padding_data_ids.append(data_ids[i])

    mask_attentions = []

    for id in padding_data_ids:
        temp = []
        for num in id:
            if num != 1:
                temp.append(1)
            else:
                temp.append(0)
        mask_attentions.append(temp)

    data_ids = np.array(padding_data_ids)
    mask_attentions = np.array(mask_attentions)

    print(f'Data shape: {data_ids.shape}')
    print(f'Mask Attention shape: {mask_attentions.shape}')

    return data_ids, mask_attentions