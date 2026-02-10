import tensorflow as tf
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

from config import *
from data_loader import get_data_generators
from model_builder import build_model

# CPU OPTIMIZATION
tf.config.optimizer.set_jit(True)
tf.config.threading.set_intra_op_parallelism_threads(0)
tf.config.threading.set_inter_op_parallelism_threads(0)

# LOAD DATA
train_gen, val_gen = get_data_generators(TRAIN_DIR, VAL_DIR)

# BUILD MODEL
model, base_model = build_model(train_gen.num_classes)

# ======================
# PHASE 1 – FEATURE EXTRACTION
# ======================
model.compile(
    optimizer=tf.keras.optimizers.Adam(LEARNING_RATE_PHASE_1),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

callbacks = [
    ModelCheckpoint(MODEL_PATH, monitor="val_accuracy", save_best_only=True, verbose=1),
    ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6, verbose=1),
    EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True)
]

print("\n🔥 PHASE 1 TRAINING STARTED 🔥\n")

model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_PHASE_1,
    callbacks=callbacks
)

# ======================
# PHASE 2 – FINE TUNING
# ======================
base_model.trainable = True
for layer in base_model.layers[:-5]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(LEARNING_RATE_PHASE_2),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

print("\n🔥 PHASE 2 TRAINING STARTED 🔥\n")

model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_PHASE_2,
    callbacks=callbacks
)

model.save(MODEL_PATH)
print("\n✅ MODEL TRAINED & SAVED SUCCESSFULLY")
