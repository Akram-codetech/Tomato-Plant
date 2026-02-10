# ==============================
# TOMATO DISEASE PREVENTION GUIDE
# ==============================

PREVENTION_GUIDE = {
    "Early_blight": [
        "Use certified disease-free seeds",
        "Avoid overhead irrigation",
        "Remove infected leaves immediately",
        "Apply recommended fungicides"
    ],

    "Late_blight": [
        "Ensure proper drainage in the field",
        "Avoid excessive watering",
        "Use resistant tomato varieties",
        "Apply fungicides at early stages"
    ],

    "Tomato_Yellow_Leaf_Curl_Virus": [
        "Control whitefly population",
        "Use insect-proof nets",
        "Remove infected plants",
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

def get_prevention(disease_name):
    return PREVENTION_GUIDE.get(
        disease_name,
        ["No prevention information available"]
    )
