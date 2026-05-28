from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route("/")
def home():
    return "Backend Running Successfully"
def transcribe_audio(file_path):
    api_key = os.getenv("DEEPGRAM_API_KEY")

    url = "https://api.deepgram.com/v1/listen"

    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "audio/webm"
    }

    with open(file_path, "rb") as audio:
        response = requests.post(url, headers=headers, data=audio)

    result = response.json()

    try:
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
        return transcript
    except:
        return "No transcript generated"
@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    transcript = transcribe_audio(file_path)

    return jsonify({
        "status": "success",
        "transcript": transcript
    })

if __name__ == "__main__":
    app.run(debug=True)