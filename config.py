# =========================
# CONFIGURATION FILE
# =========================

IMG_SIZE = (192, 192)
BATCH_SIZE = 32

EPOCHS_PHASE_1 = 8
EPOCHS_PHASE_2 = 7

BASE_MODEL = "EfficientNetB1"

TRAIN_DIR = r"C:\d\train"
VAL_DIR   = r"C:\d\val"

MODEL_PATH = "models/efficientnet_tomato.h5"

LEARNING_RATE_PHASE_1 = 3e-4
LEARNING_RATE_PHASE_2 = 1e-5
