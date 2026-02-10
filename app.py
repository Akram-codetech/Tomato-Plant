import os

# Use legacy Keras 2 for compatibility with models trained on TF 2.15
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import uuid
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from flask import Flask, render_template, request, jsonify

# ==============================
# CONFIGURATION
# ==============================
MODEL_PATH = "models/efficientnet_tomato.h5"
IMG_SIZE = (192, 192)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

CLASS_NAMES = [
    "Early_blight",
    "Late_blight",
    "Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato_mosaic_virus",
    "healthy"
]

DISPLAY_NAMES = {
    "Early_blight": "Early Blight",
    "Late_blight": "Late Blight",
    "Tomato_Yellow_Leaf_Curl_Virus": "Yellow Leaf Curl Virus",
    "Tomato_mosaic_virus": "Mosaic Virus",
    "healthy": "Healthy"
}

PREVENTION_GUIDE = {
    "Early_blight": [
        "Use certified disease-free seeds and transplants",
        "Avoid overhead irrigation — use drip irrigation instead",
        "Remove and destroy infected leaves immediately",
        "Apply recommended fungicides (chlorothalonil, mancozeb)",
        "Practice crop rotation with non-solanaceous crops",
        "Mulch around plants to prevent soil splash"
    ],
    "Late_blight": [
        "Ensure proper field drainage to reduce humidity",
        "Avoid excessive watering, especially in cool weather",
        "Use resistant tomato varieties (Legend, Defiant)",
        "Apply fungicides at early stages of infection",
        "Remove volunteer tomato and potato plants",
        "Destroy infected plant debris — do not compost"
    ],
    "Tomato_Yellow_Leaf_Curl_Virus": [
        "Control whitefly population using yellow sticky traps",
        "Use insect-proof nets and reflective mulches",
        "Remove and destroy infected plants immediately",
        "Use virus-free certified seedlings only",
        "Apply systemic insecticides for whitefly control",
        "Avoid planting near previously infected fields"
    ],
    "Tomato_mosaic_virus": [
        "Disinfect all tools and equipment regularly",
        "Avoid handling plants after using tobacco products",
        "Use certified virus-free seeds and transplants",
        "Remove and destroy infected plants promptly",
        "Wash hands thoroughly with soap before handling plants",
        "Control aphid vectors with appropriate insecticides"
    ],
    "healthy": [
        "Continue maintaining proper irrigation schedules",
        "Apply balanced fertilizers (N-P-K) as recommended",
        "Monitor plants regularly for early signs of disease",
        "Ensure good field sanitation and weed control",
        "Stake and prune plants for better air circulation",
        "Rotate crops annually to prevent soil-borne diseases"
    ]
}

SEVERITY_INFO = {
    "Early_blight": {"level": "Moderate", "color": "warning"},
    "Late_blight": {"level": "Severe", "color": "danger"},
    "Tomato_Yellow_Leaf_Curl_Virus": {"level": "Severe", "color": "danger"},
    "Tomato_mosaic_virus": {"level": "High", "color": "danger"},
    "healthy": {"level": "None", "color": "success"}
}

# ==============================
# FLASK APP
# ==============================
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max

# ==============================
# LOAD MODEL AT STARTUP
# ==============================
print("Loading TensorFlow model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")


# ==============================
# TOMATO LEAF VALIDATION
# ==============================
def is_tomato_leaf(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    img = cv2.resize(img, IMG_SIZE)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, (30, 50, 50), (90, 255, 255))
    green_ratio = np.sum(green_mask > 0) / green_mask.size
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    texture = cv2.Laplacian(gray, cv2.CV_64F).var()
    return green_ratio > 0.15 and texture > 30


# ==============================
# IMAGE PREPROCESSING
# ==============================
def preprocess_image(path):
    img = cv2.imread(path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMG_SIZE)
    img = preprocess_input(img.astype(np.float32))
    return np.expand_dims(img, axis=0)


# ==============================
# ROUTES
# ==============================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        allowed_ext = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_ext:
            return jsonify({"error": "Invalid file type. Please upload JPG, PNG, or WebP"}), 400

        # Save temporarily
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        try:
            # Validate leaf
            if not is_tomato_leaf(filepath):
                return jsonify({
                    "error": "This image does not appear to be a tomato leaf. Please upload a clear image of a tomato leaf."
                }), 400

            # Preprocess and predict
            img = preprocess_image(filepath)
            preds = model.predict(img, verbose=0)[0]

            idx = int(np.argmax(preds))
            disease_key = CLASS_NAMES[idx]
            confidence = float(preds[idx]) * 100

            # Build response
            response = {
                "disease": disease_key,
                "disease_display": DISPLAY_NAMES[disease_key],
                "confidence": round(confidence, 2),
                "is_healthy": disease_key == "healthy",
                "severity": SEVERITY_INFO[disease_key],
                "prevention": PREVENTION_GUIDE[disease_key],
                "all_predictions": {
                    DISPLAY_NAMES[CLASS_NAMES[i]]: round(float(preds[i]) * 100, 2)
                    for i in range(len(CLASS_NAMES))
                }
            }
            return jsonify(response)

        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
