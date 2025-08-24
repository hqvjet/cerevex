import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class VEDModel(nn.Module):
    def __init__(self, input_shape, kerner_size=[2,3,4,5], cnn_filter=128, trans_layer=2, num_head=8, dropout=0.1, num_classes=3):
        super(VEDModel, self).__init__()
        self.model_name = 'CNN_Trans_Enc'

        self.convs = nn.ModuleList([
            nn.Conv1d(in_channels=input_shape[-1], out_channels=cnn_filter, kernel_size=k, padding='same', padding_mode='zeros')
            for k in kerner_size
        ])

        enc_layer = nn.TransformerEncoderLayer(d_model=cnn_filter*len(kerner_size), nhead=num_head, dim_feedforward=1024, dropout=dropout, batch_first=True)
        self.trans = nn.TransformerEncoder(enc_layer, num_layers=trans_layer)

        self.fc = nn.Linear(len(kerner_size) * cnn_filter, num_classes)
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        x = x.unsqueeze(2)
        cnn_out = [F.relu(conv(x)).squeeze(2) for conv in self.convs]
        cnn_out = torch.cat(cnn_out, dim=1)

        cnn_out = cnn_out.unsqueeze(1)
        out = self.trans(cnn_out).squeeze(1)

        out = self.fc(out)
        return self.softmax(out)