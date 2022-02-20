import json
import sys, traceback, secrets
import argparse

from flask import (
    Flask, 
    request, 
    jsonify
)

# Cross Origin Resource Sharing (CORS)
# making cross-origin AJAX possible.
# frontend in react node and backend flask cross-origin
#from flask_cors import CORS, cross_origin
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

from bokeh.plotting import figure
from bokeh.embed import json_item
from bokeh.models import Arrow, NormalHead

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
#CORS(app)

def get_app():
    return app

#### FrontEnd React Javascript where state area saved by react


@app.route('/flask/convert', methods=['POST'])
#@cross_origin(origin='*')
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
#@cross_origin(origin='*')
def plot():
    # for plotting memorial original also plot converted rumos adjusted
    if isinstance(cache.get('points'), numpy.ndarray): # must be cached to plot
        return bokeh_memorial_draw(cache.get('points'), cache.get('points_verd'))
    return None


def bokeh_memorial_draw(points, points_verd=None):
    """draw with bokeh the points passed as circles
    connected with arrows (according to the their order)
    * returns: json data for BokehJS to plot """
    x, y = points[:, 1], points[:, 0]

    TOOLTIPS = [ # allowed hover tooltips
        ("index", "$index"),
        ("(x,y)", "($x{0,0.00000000}, $y{0,0.00000000})") 
        ]
    p = figure(width=350, height=350, toolbar_location="below",  tooltips=TOOLTIPS,
        tools='box_zoom,pan,save,hover,reset,tap,wheel_zoom')
    
    # relation between number of points and symbols size 
    csize = 11 - len(x)/5  # 15:8, 30:5
    csize = 3 if csize < 3 else csize 
    lw = 0.5 if csize < 4 else 1
    # draw all points as circles 
    p.circle(x, y, fill_color="gray", legend_label="input", size=csize, alpha=0.8)
    # add both a line and circles on the same plot
    x0, y0 = x[0], y[0]
    for x, y in zip(x[1:], y[1:]):
        p.add_layout(Arrow(end=NormalHead(fill_color="white", size=csize+1, 
                    fill_alpha=0.2, line_width=lw),
                    x_start=x0, y_start=y0, x_end=x, y_end=y))
        x0, y0 = x, y        

    if points_verd is not None:
        x, y = points_verd[:, 1], points_verd[:, 0]
        p.cross(x, y, color="red", legend_label="rumos-v", size=csize, alpha=0.8)

    p.legend.label_text_font = "times"
    p.legend.background_fill_alpha = 0.1
    p.legend.location = "top_left"
    p.legend.background_fill_color = "gray"
    item_text = json.dumps(json_item(p))
    return item_text # json data for BokehJS to plot in react


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d','--debug', default=False, action='store_true')    
    args = parser.parse_args()    
    app = get_app()
    app.config['Debug'] = args.debug
    app.run(host='0.0.0.0', debug=args.debug)    
    
