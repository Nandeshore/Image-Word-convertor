from flask import Flask, request, render_template
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(app.root_path, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html', text=None)

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return ("No file uploaded.", 400)

    file = request.files['image']
    if file.filename == '':
        return ("No file selected.", 400)

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        image = Image.open(filepath)
        image = image.convert('L')
        image = ImageEnhance.Contrast(image).enhance(2.0)
        image = image.filter(ImageFilter.GaussianBlur(radius=1))        
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6')
    except Exception as e:
        return (f"Error processing image: {e}", 500)

    return text, 200, {'Content-Type': 'text/plain; charset=utf-8'}

if __name__ == '__main__':
    app.run(debug=True)
