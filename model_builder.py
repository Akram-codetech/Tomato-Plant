from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB1

def build_model(num_classes):

    base_model = EfficientNetB1(
        weights="imagenet",
        include_top=False,
        input_shape=(192, 192, 3)
    )

    base_model.trainable = False

    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs=base_model.input, outputs=outputs)
    return model, base_model
