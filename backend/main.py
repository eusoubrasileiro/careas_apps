import sys
import traceback
import secrets
import argparse
import os
import tempfile

from flask import Flask, request, jsonify
import plotly.graph_objects as go
from flask_caching import Cache

from aidbag.anm.careas.poligonal.util import (
    readMemorial,
    formatMemorial,
    forceverdPoligonal,
    forceverdFailed,
    NotPairofCoordinatesError
)


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


def plotly_memorial_draw(points, points_verd=None):
    """Draw memorial points with Plotly, returns JSON for PlotlyJS."""
    x, y = points[:, 1], points[:, 0]

    fig = go.Figure()
    fig.update_layout(
        width=350,
        height=350,
        margin=go.layout.Margin(l=0, r=0, b=0, t=0)
    )

    # Dynamic marker size based on point count
    csize = max(3, 9 - len(x) / 5)
    lw = 0.5 if csize < 4 else 1

    # Arrows showing direction
    fig.add_trace(go.Scatter(
        x=x, y=y,
        mode='lines+markers',
        marker=dict(
            size=csize + 5,
            color='gray',
            opacity=0.3,
            symbol='arrow',
            line_width=lw,
            angleref='previous'
        ),
        hoverinfo='none',
    ))

    # True bearing adjusted points (if applicable)
    if points_verd is not None:
        fig.add_trace(go.Scatter(
            x=x, y=y,
            mode='markers',
            marker=dict(
                size=csize * 1.5,
                color='red',
                opacity=0.8,
                symbol='cross',
                line_width=lw
            ),
            name='rumos-v',
            hoverinfo='x+y',
        ))

    # Input points
    fig.add_trace(go.Scatter(
        x=x, y=y,
        mode='markers',
        marker=dict(size=csize, color='blue', opacity=0.8),
        name='input',
        hoverinfo='x+y',
    ))

    # Remove legend from arrows trace
    for trace in fig.data:
        if trace['name'] is None:
            trace['showlegend'] = False

    fig.update_layout(legend=dict(
        yanchor='top', y=0.99,
        xanchor='left', x=0.01,
        bgcolor='rgba(0,0,0,0)',
    ))

    return fig.to_json()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--debug', default=False, action='store_true')
    args = parser.parse_args()
    app.run(host='0.0.0.0', debug=args.debug)
