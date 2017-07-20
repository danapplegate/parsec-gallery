from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import glob
from os.path import basename
app = Flask(__name__)

UPLOAD_DIR = '/usr/share/nginx/html/images/'


@app.route('/')
def hello_world():
	images = glob.glob(UPLOAD_DIR + '*')
	images = ['/images/' + basename(image) for image in images]
	return jsonify(images=images)


@app.route('/images', methods=['POST'])
def create_image():
	f = request.files['image']
	f.save(UPLOAD_DIR + secure_filename(f.filename))
	return 'Uploading image'
