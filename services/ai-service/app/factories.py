import os

# IMPORTANT: Set TensorFlow/XLA env vars BEFORE importing TensorFlow
# - Disable XLA auto-JIT and Triton GEMM to avoid PTX toolchain (ptxas/nvlink)
# - Fully disable XLA to prevent runtime compilation paths
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_XLA_FLAGS", "--tf_xla_auto_jit=0")
os.environ.setdefault("XLA_FLAGS", "--xla_gpu_enable_triton_gemm=false")
os.environ.setdefault("TF_DISABLE_XLA", "1")

# If user explicitly wants TF to try GPU, allow opt-in and add safe driver fallback
USE_GPU = os.environ.get("PRED_TF_USE_GPU", "0").lower() in {"1", "true", "yes"}
if USE_GPU:
    # Prefer using driver JIT fallback instead of ptxas/nvlink
    xla_flags = os.environ.get("XLA_FLAGS", "")
    extra = " --xla_gpu_unsafe_fallback_to_driver_on_ptxas_not_found"
    if extra.strip() not in xla_flags:
        os.environ["XLA_FLAGS"] = (xla_flags + extra).strip()

from huggingface_hub import hf_hub_download
import torch
from transformers import AutoTokenizer
import tensorflow as tf

# Force TensorFlow to run on CPU only to avoid XLA GPU compilation
TF_GPU_DISABLED = False
try:
    tf.config.set_visible_devices([], "GPU")
    TF_GPU_DISABLED = True
except Exception:
    # If GPUs were already initialized elsewhere, JIT may still be disabled below
    pass

# Explicitly disable XLA JIT at runtime as well (belt and braces)
try:
    tf.config.optimizer.set_jit(False)
except Exception:
    pass

from constants import VED_REPO_ID, TITLE_CONTENT_REPO_ID
from models.ved_model import VEDModel
from models.hotel_model import HotelModel
from schemas import PredictInput
from preprocessing import VEDPreprocessingPipeline, HotelPreprocessingPipeline
from runtime_device import device

def prepare_title_content_model():
    tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base")
    vocab = tokenizer.get_vocab()
    title_content_model_path = hf_hub_download(repo_id=TITLE_CONTENT_REPO_ID, filename="CNNClassification.h5")

    title_content_model = HotelModel(len(vocab), embedding_dim=128).build_model()
    title_content_model.load_weights(title_content_model_path)
    return title_content_model
    
def prepare_ved_model():
    ved_model_path = hf_hub_download(repo_id=VED_REPO_ID, filename="CNN_Trans_Enc.pth")
    ved_model = VEDModel(input_shape=(1, 3072), num_classes=3)
    state = torch.load(ved_model_path)
    ved_model.load_state_dict(state)
    ved_model.eval()
    return ved_model

ved_model = prepare_ved_model()
title_content_model = prepare_title_content_model()
ved_preprocessing_pipeline = VEDPreprocessingPipeline()
hotel_preprocessing_pipeline = HotelPreprocessingPipeline()
ved_model = ved_model.to(device)


def invoke_ved_model(inputs: list) -> list:
    features = ved_preprocessing_pipeline.invoke(inputs)
    features = features.to(device)
    predicted_probs = ved_model(features)
    predicted_labels = predicted_probs.argmax(dim=-1).tolist()
    return predicted_labels

def invoke_title_content_model(inputs: list) -> list:
    title_feature, content_feature = hotel_preprocessing_pipeline.invoke(inputs)
    predicted_probs = title_content_model.predict([title_feature.astype("int32"), content_feature.astype("int32")])
    predicted_labels = predicted_probs.argmax(axis=-1).tolist()
    return predicted_labels
