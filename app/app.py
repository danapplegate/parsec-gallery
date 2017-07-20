import glob
import logging
import os
from os.path import basename, splitext
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
app = Flask(__name__)

UPLOAD_DIR = '/usr/share/nginx/html/images/'
TMP_DIR = '/tmp/'
WATERMARK_PATH = 'parsec-logo.png'

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


def rel_path(image_path):
	return '/images/' + basename(image_path)


@app.route('/images', methods=['GET'])
def list_images():
	images = glob.glob(UPLOAD_DIR + '*')
	images = [rel_path(image) for image in images]
	return jsonify(images=images)


@app.route('/images', methods=['POST'])
def create_image():
	f = request.files['image']
	filename = secure_filename(f.filename)
	tmp_file = TMP_DIR + filename
	dst_file = UPLOAD_DIR + splitext(filename)[0] + '.png'
	logger.info(u"Saving tmp file to {}".format(tmp_file))
	f.save(tmp_file)

	# Open the original image
	main = Image.open(tmp_file)
	tmp_png_file = splitext(tmp_file)[0] + '.png'
	logger.info(u"Converting file to png format at {}".format(tmp_png_file))
	main.save(tmp_png_file)
	main = Image.open(tmp_png_file).convert('RGBA')
	logger.debug(u"Converted image: {}".format(main))

	watermark = Image.open(WATERMARK_PATH)
	logger.info(u"Watermark image loaded: {}".format(watermark))
	main.alpha_composite(watermark)

	main.save(dst_file)

	os.remove(tmp_file)
	os.remove(tmp_png_file)
	return jsonify(path=rel_path(dst_file))
