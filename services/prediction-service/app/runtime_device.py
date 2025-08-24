import torch
    
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if device.type == 'cuda':
    print('Using GPU')
else:
    print('Using CPU')