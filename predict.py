import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input

# ==============================
# CONFIGURATION
# ==============================
MODEL_PATH = "models/efficientnet_tomato.h5"
IMG_SIZE = (192, 192)

CLASS_NAMES = [
    "Early_blight",
    "Late_blight",
    "Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato_mosaic_virus",
    "healthy"
]

# ==============================
# PREVENTION KNOWLEDGE BASE
# ==============================
PREVENTION_GUIDE = {
    "Early_blight": [
        "Use certified disease-free seeds",
        "Avoid overhead irrigation",
        "Remove infected leaves immediately",
        "Apply recommended fungicides"
    ],

    "Late_blight": [
        "Ensure proper field drainage",
        "Avoid excessive watering",
        "Use resistant tomato varieties",
        "Apply fungicides at early stages"
    ],

    "Tomato_Yellow_Leaf_Curl_Virus": [
        "Control whitefly population",
        "Use insect-proof nets",
        "Remove infected plants immediately",
        "Use virus-free seedlings"
    ],

    "Tomato_mosaic_virus": [
        "Disinfect tools regularly",
        "Avoid handling plants after smoking",
        "Use certified virus-free seeds",
        "Remove infected plants"
    ],

    "healthy": [
        "Maintain proper irrigation",
        "Apply balanced fertilizers",
        "Monitor plants regularly",
        "Ensure good field sanitation"
    ]
}

# ==============================
# LOAD MODEL
# ==============================
model = tf.keras.models.load_model(MODEL_PATH)

# ==============================
# TOMATO LEAF VALIDATION
# ==============================
def is_tomato_leaf(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return False

    img = cv2.resize(img, IMG_SIZE)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Green color check
    green_mask = cv2.inRange(hsv, (30, 50, 50), (90, 255, 255))
    green_ratio = np.sum(green_mask > 0) / green_mask.size

    # Texture check
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    texture = cv2.Laplacian(gray, cv2.CV_64F).var()

    return green_ratio > 0.30 and texture > 50

# ==============================
# IMAGE PREPROCESSING
# ==============================
def preprocess_image(path):
    img = cv2.imread(path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMG_SIZE)
    img = preprocess_input(img)
    return np.expand_dims(img, axis=0)

# ==============================
# MAIN
# ==============================
if __name__ == "__main__":
    print("\n🍅 TOMATO LEAF DISEASE PREDICTION SYSTEM 🍅")
    print("------------------------------------------")

    image_path = input("Enter image path: ").strip().strip('"')

    if not os.path.exists(image_path):
        print("❌ Image file not found")
        exit()

    if not is_tomato_leaf(image_path):
        print("❌ This image is NOT identified as a tomato leaf")
        exit()

    img = preprocess_image(image_path)
    preds = model.predict(img, verbose=0)[0]

    idx = np.argmax(preds)
    disease = CLASS_NAMES[idx]
    confidence = preds[idx] * 100

    print("\n🧪 Prediction Result")
    print("--------------------")
    print(f"Disease     : {disease}")
    print(f"Confidence  : {confidence:.2f}%")

    print("\n🛡️ Prevention Measures")
    print("----------------------")
    for step in PREVENTION_GUIDE[disease]:
        print(f"- {step}")
