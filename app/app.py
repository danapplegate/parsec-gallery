from datetime import datetime
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
DEFAULT_PAGE_SIZE = 9

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


def rel_path(image_path):
	return '/images/' + basename(image_path)


@app.route('/images', methods=['GET'])
def list_images():
	offset = int(request.args.get('offset', 0))
	limit = int(request.args.get('limit', DEFAULT_PAGE_SIZE))
	stop_index = offset + limit
	images = glob.glob(UPLOAD_DIR + '*')
	images = [rel_path(image) for image in images]
	images.sort()
	images.reverse()
	return jsonify(images=images[offset:stop_index])


@app.route('/images', methods=['POST'])
def create_image():
	f = request.files['image']
	filename = secure_filename(f.filename)
	td = datetime.now() - datetime(1970, 1, 1)
	time_str = str(int(td.total_seconds()))
	tmp_file = TMP_DIR + time_str + filename
	dst_file = UPLOAD_DIR + time_str + splitext(filename)[0] + '.png'
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
