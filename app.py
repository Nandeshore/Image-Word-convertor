from flask import Flask, request, render_template
import pytesseract
from PIL import Image
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return "No file uploaded", 400

    file = request.files['image']
    if file.filename == '':
        return "No selected file", 400

    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    text = pytesseract.image_to_string(Image.open(filepath))

    return f"<h2>Extracted Text: </h2><pre>{text}</pre>"

if __name__ == '__main__':
    app.run(debug=True)