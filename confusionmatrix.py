import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input

MODEL_PATH = "models/efficientnet_tomato.h5"
VAL_DIR = r"C:\d\val"
IMG_SIZE = (192, 192)
BATCH_SIZE = 32

model = tf.keras.models.load_model(MODEL_PATH)

val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

val_gen = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)

class_names = list(val_gen.class_indices.keys())

preds = model.predict(val_gen)
y_pred = np.argmax(preds, axis=1)
y_true = val_gen.classes

cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names,
            yticklabels=class_names)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix – Tomato Leaf Disease")
plt.tight_layout()
plt.show()

print("\nCLASSIFICATION REPORT\n")
print(classification_report(y_true, y_pred, target_names=class_names))
