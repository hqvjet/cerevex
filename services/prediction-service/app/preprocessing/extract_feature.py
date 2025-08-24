from transformers import AutoModel
import torch
import math

EXTRACT_BATCH_SIZE = 512
phobert = AutoModel.from_pretrained('vinai/phobert-base-v2', output_hidden_states=True)
phobert.eval()

def extractFeature(device, ids, attentions):
    global phobert
    phobert = phobert.to(device)

    num_batch = math.ceil(len(ids) / EXTRACT_BATCH_SIZE)
    final_feature = []
    for size in range(num_batch):
        batch_id = torch.tensor(ids[EXTRACT_BATCH_SIZE * size : min(EXTRACT_BATCH_SIZE * (size + 1), len(ids))]).to(device)
        batch_attention = torch.tensor(attentions[EXTRACT_BATCH_SIZE * size : min(EXTRACT_BATCH_SIZE * (size + 1), len(ids))]).to(device)
        print(batch_id.size(), batch_attention.size())
        
        with torch.no_grad():
            output = phobert(input_ids=batch_id, attention_mask=batch_attention)

        res_emb = torch.cat((output[2][-1][:, 0, :], output[2][-2][:, 0, :], output[2][-3][:, 0, :], output[2][-4][:, 0, :]), dim=-1)
        final_feature.append(res_emb)

        print(f'Batch {size + 1} has done!, Shape: {res_emb.size()}')

    final_feature = torch.cat(final_feature, dim=0)
    print(final_feature, final_feature.size())

    print(f'Features shape: {final_feature.size()}')

    return final_feature