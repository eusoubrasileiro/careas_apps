import sys
import traceback
import secrets
import argparse
import os
import tempfile

from flask import Flask, request, jsonify
from flask_caching import Cache

from aidbag.anm.careas.poligonal.util import (
    readMemorial,
    formatMemorial,
    forceverdPoligonal,
    forceverdFailed,
    NotPairofCoordinatesError
)
from aidbag.anm.careas.poligonal.plotly import plotly_memorial_draw


# App setup - production vs development
if os.environ.get('APP_ENV') == 'production':
    app = Flask('careas-tools', static_url_path='', static_folder='../build')
else:
    app = Flask('careas-tools')

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 8 * 60 * 60  # 8 hours
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['CACHE_THRESHOLD'] = 10000
app.config['CACHE_DIR'] = os.path.join(tempfile.gettempdir(), 'careas_apps')
app.config['CACHE_TYPE'] = 'FileSystemCache'

cache = Cache(app)


# Routes for production (serve React build)
if os.environ.get('APP_ENV') == 'production':
    @app.errorhandler(404)
    @app.route('/')
    def index(e=None):
        return app.send_static_file('index.html')

    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)


@app.route('/flask/convert', methods=['POST'])
def convert():
    converted_file = None
    succeed = True
    try:
        print(request.form['input_format'], file=sys.stderr, flush=True)
        print(request.form['output_format'], file=sys.stderr, flush=True)
        print(request.form['rumos_v_tol'], file=sys.stderr, flush=True)

        rumos_v = 'rumos-v' in request.form.keys()
        if rumos_v:
            print(request.form['rumos-v'], file=sys.stderr, flush=True)

        # Convert and plot
        input_file_rd = readMemorial(
            request.form['input_text'],
            fmt=request.form['input_format']
        )
        points = readMemorial(
            request.form['input_text'],
            fmt=request.form['input_format'],
            decimal=True
        )
        points_verd = None

        if rumos_v:
            input_file_rd = forceverdPoligonal(
                points,
                tolerancem=float(request.form['rumos_v_tol']),
                debug=True
            )
            points_verd = input_file_rd

        converted_file = formatMemorial(
            input_file_rd,
            fmt=request.form['output_format']
        )

        # Server-side cache for /plot endpoint
        cache.set('points_verd', points_verd)
        cache.set('points', points)

    except forceverdFailed:
        converted_file = (
            "Nao e possivel ajustar para rumos verdadeiros\n"
            "(rumos-v) com esse valor de tolerancia (m).\n"
            "Modifique a tolerancia (metros) em Mais opcoes.\n"
        )
        succeed = False
    except NotPairofCoordinatesError:
        converted_file = (
            "Falta um membro de uma coordenada\n"
            "(latitude ou longitude)\n"
        )
        succeed = False
    except Exception:
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        converted_file = traceback.format_exc()
        succeed = False

    print(converted_file, file=sys.stderr, flush=True)
    return jsonify({'status': succeed, 'data': converted_file})


@app.route('/flask/plot', methods=['POST'])
def plot():
    return plotly_memorial_draw(cache.get('points'), cache.get('points_verd'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--debug', default=False, action='store_true')
    args = parser.parse_args()
    app.run(host='0.0.0.0', debug=args.debug)
