import json
import sys, traceback, secrets
import argparse

from flask import (
    Flask, 
    request, 
    jsonify
)

import numpy

from poligonal.util import NotPairofCoordinatesError

# server side session, storing data on server not on cookies 
# https://github.com/pallets-eco/flask-caching
from flask_caching import Cache
import tempfile, os


from poligonal.util import (
    readMemorial, 
    formatMemorial,
    forceverdPoligonal,
    forceverdFailed,
    NotPairofCoordinatesError
)

import plotly.graph_objects as go

app = Flask('careas-tools')
# static files including html page
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 8*60*60 # 8 hours in seconds
app.config['Debug'] = False
app.config['SECRET_KEY'] = secrets.token_hex(16)
# Flask-Cache package
app.config['CACHE_THRESHOLD'] = 10000
app.config['CACHE_DIR'] = os.path.join(tempfile.gettempdir(), "careas_apps") #  temporary directory
app.config['CACHE_TYPE'] = 'FileSystemCache' 

cache = Cache(app)

def get_app():
    return app

#### FrontEnd React Javascript where state area saved by react
@app.route('/flask/convert', methods=['POST'])
def convert():
    converted_file = None
    succeed = True
    if request.method == 'POST':
        try:
            #print(request.form['input_text'], file=sys.stderr, flush=True)
            print(request.form['input_format'], file=sys.stderr, flush=True)
            print(request.form['output_format'], file=sys.stderr, flush=True)
            print(request.form['rumos_v_tol'], file=sys.stderr, flush=True)
            rumos_v = False
            if 'rumos-v' in request.form.keys():            
                rumos_v = True 
                print(request.form['rumos-v'], file=sys.stderr, flush=True)
            # convert and plot
            input_file_rd = readMemorial(request.form['input_text'], fmt=request.form['input_format'])
            # for plotting memorial and rumos nsew adjust
            points = readMemorial(request.form['input_text'], fmt=request.form['input_format'],
                decimal=True)
            points_verd = None
            if rumos_v:            
                #input_file_rd = forceverdPoligonal(points, tolerancem=float(cache.get('rumos_v_tol')), debug=True)
                input_file_rd = forceverdPoligonal(points, tolerancem=float(request.form['rumos_v_tol']), debug=True)
                points_verd = input_file_rd            
            converted_file = formatMemorial(input_file_rd, fmt=request.form['output_format'])
            # server-side cache data so /plot can work
            cache.set('points_verd', points_verd) 
            cache.set('points', points) 
        except forceverdFailed:
            # uncheck rumos-v and run again # show a message?
            converted_file=("Não é possivel ajustar para rumos verdadeiros\n"
                           "(rumos-v) com esse valor de tolerância (m).\n"
                           "Modifique a tolerância (metros) em Mais opções.\n")  
            succeed = False 
        except NotPairofCoordinatesError:
            converted_file =("Falta um membro de uma coordenada\n"
                            "(latitude ou longitude)\n")  
            succeed = False
        except Exception: 
            print(traceback.format_exc(), file=sys.stderr, flush=True)
            trace_back_string =  traceback.format_exc()    
            converted_file = trace_back_string
            succeed = False
        print(converted_file, file=sys.stderr, flush=True)
        result = jsonify({'status' : succeed,
                          'data' : converted_file})
    return result


@app.route('/flask/plot', methods=['POST'])
def plot():
    # for plotting memorial original also plot converted rumos adjusted
    return plotply_memorial_draw(cache.get('points'), cache.get('points_verd'))    


def plotply_memorial_draw(points, points_verd=None):
    # """draw with plotly the points passed as circles
    # connected with arrows (according to the their order)
    # * returns: json data for PlotlyJS to plot """
    x, y = points[:, 1], points[:, 0]

    fig = go.Figure()
    fig.update_layout(width=350, height=350, margin=go.layout.Margin(l=0, r=0, b=0, t=0))  # Customize margins as needed

    # relation between number of points and symbols size 
    # Set marker size and line width
    csize = 9 - len(x)/5  # 15:8, 30:5
    csize = 3 if csize < 3 else csize 
    lw = 0.5 if csize < 4 else 1

    # Arrows
    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode="lines+markers",    
        marker=dict(size=csize+5, color="gray", opacity=0.3, symbol="arrow", line_width=lw, angleref="previous"),    
        hoverinfo='none',
    ))
    if points_verd is not None:
        fig.add_trace(go.Scatter(
            x=x,
            y=y,
            mode="markers",
            marker=dict(size=csize*1.5, color="red", opacity=0.8, symbol="cross", line_width=lw),
            name="rumos-v",
            hoverinfo='x+y',
        ))
    # Create scatter traces for points
    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode="markers",
        marker=dict(size=csize, color="blue", opacity=0.8),
        name="input",
        hoverinfo='x+y',
    ))
    for trace in fig.data: # remove legend from arrows
        if trace['name'] is None: 
            trace['showlegend'] = False
    # legend position
    fig.update_layout(legend=dict(
        yanchor="top",
        y=0.99,
        xanchor="left",
        x=0.01,
        bgcolor="rgba(0,0,0,0)",
    ))

    return fig.to_json()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d','--debug', default=False, action='store_true')    
    args = parser.parse_args()    
    app = get_app()
    app.config['Debug'] = args.debug
    app.run(host='0.0.0.0', debug=args.debug)    
    
