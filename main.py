from os import read
import sys, traceback, secrets
import argparse

from flask import (
    Flask, 
    Markup, 
    Response,
    request, 
    redirect,
    render_template    
)

from werkzeug.utils import secure_filename

# server side session, storing data on server not on cookies 
# https://github.com/pallets-eco/flask-caching
from flask_caching import Cache

from poligonal.util import (
    readMemorial, 
    formatMemorial,
    forceverdPoligonal
)

from bokeh.plotting import figure
from bokeh.embed import components
from bokeh.models import Arrow, NormalHead

app = Flask('careas-tools')
app.config['SECRET_KEY'] = secrets.token_hex(16)
# Flask-Cache package
app.config['CACHE_DIR'] = 'cache'
app.config['CACHE_TYPE'] = 'FileSystemCache' # SimpleCache fails on multiple works gunicorn
app.config['CACHE_THRESHOLD'] = 10000

cache = Cache(app)

def get_app():
    return app

@app.after_request
def add_header(response):
    # force Chrome or other Browsers to request new page resources after 15 minutes 
    # kinda default, avoids outdated page 
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = "max-age=900"
    return response

#### Javascript localSession more or less equivalent  
#### recommended usage is Flask-Caching for a server-side cache
#### since Flask.session is a client side cache with cookies
#### very limitted since creating heavy/huge Cookies (back-forth communication) is not recommended 

def load_default_values():
    cache.set('converted_file', "Carregue seu arquivo de entrada")
    cache.set('input_file', """-19°44'18''174 -44°17'41''703||
-19;44;;18''174 -44°17'45''410
xxxx -19°44'16''507 -44°17'45''410
-19°44'16''507   -44°17'52''079
-19°44'18''280 -44°17'52''079
-19°44'18|280 -44°17'53''625
-19°44'20''015 -44°17'53''625
-19°44,20'zz015 -44°17'54@@984
-19°44'22''531 -44°17'54''984
-19°44'22''531  zz-44°18'09''003
-19°44xx30''662 -44°18'09''003
-19°44'30''662 -44°18'19''307
-19°44,,37''111 -44°18'19''307
\zz-19°44'37''111 -44°17'41''703
-19°44'18''174 -44°17'41''703""")    
    cache.set('scripts', '')
    cache.set('div', '')   
    cache.set('redirect', False) 
    cache.set('input_format', 'auto')
    cache.set('output_format', 'sigareas')
    cache.set('input_radio_fmts', 
        {'auto': 'checked', 
        'gtmpro': ''})
    cache.set('output_radio_fmts', 
        {'sigareas': 'checked', 
        'gtmpro': '',
        'ddegree' : ''})       
    cache.set('input_options',  # additional input options check boxes
        {'rumos-v': 'checked'})

def isLoaded():
    """to check if page is already loaded (n cached)  
    Used to avoid requests->route made even if page is not loaded
    only on Browser Cache"""
    return cache.get('div') != None # same xx is True 

@app.route('/')
def index():    
    # if empty cache means first time loaded the page
    if (not isLoaded()) or (not cache.get('redirect')): # empty cache not a redirect       
        #print("The cache['div'] is: ", cache.get('div'), file=sys.stderr, flush=True)
        load_default_values() # initiate the current state of the Page                
        # when the tab, browser is closed the cache is deleted 
    cache.set('redirect', False)    
    return Convertn_Draw()


@app.route('/download', methods=['GET', 'POST'])
def downloadFile ():
    if isLoaded():        
        return Response(
            cache.get('converted_file'),
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=SIGAREAS.txt",
                      "Cache-Control" : "no-store, max-age=0"  }) # this must NEVER be cached


# to avoid f5 form resubmission
# flask solution Flask-Caching with redirect
@app.route('/convert', methods=['POST'])
def convert():
    if request.method == 'POST' and isLoaded():
        cache.set('input_file', request.form['input_text'])     
        # save input radio buttons format state
        input_radio_fmts = dict.fromkeys(cache.get('input_radio_fmts')) # clean checked state all buttons
        input_radio_fmts[ request.form['input_format'] ] = 'checked'
        #print(request.form['input_format'], file=sys.stderr, flush=True)
        cache.set('input_radio_fmts', input_radio_fmts) 
        # set input_format variable        
        cache.set('input_format', request.form['input_format'])        
        # save output radio buttons format state 
        output_radio_fmts = dict.fromkeys(cache.get('output_radio_fmts')) # clean checked state all buttons
        output_radio_fmts[ request.form['output_format'] ] = 'checked'
        cache.set('output_radio_fmts', output_radio_fmts) 
        # set output_format variable        
        cache.set('output_format', request.form['output_format'])   
        # save input options checkbox states
        input_options = dict.fromkeys(cache.get('input_options')) # clean checked state all boxes
        for option in input_options:
            input_options[option] = "checked" if request.form.get(option) else ""
            #print(option, request.form.get(option), file=sys.stderr, flush=True)       
        cache.set('input_options', input_options)                 
        # signal comming from redirect
        cache.set('redirect', True)   
    # avoid form resubmission with F5        
    return redirect('/')


def Convertn_Draw():
    """executes 'de facto' file convertion using poligonal package
    also draw the poligon with the bokeh plot"""
    try:
        input_file_rd = readMemorial(cache.get('input_file'), fmt=cache.get('input_format'))
        # for plotting memorial and rumos nsew adjust
        coordinates = readMemorial(cache.get('input_file'), fmt=cache.get('input_format'),
            decimal=True)
        #print(cache.get('output_format'), file=sys.stderr, flush=True)
        if cache.get('input_options')['rumos-v'] == 'checked':
            input_file_rd = forceverdPoligonal(coordinates, debug=True)
        # output file formatted        
        cache.set('converted_file', formatMemorial(input_file_rd, fmt=cache.get('output_format')))  
        #### for plotting memorial 
        scripts, div = bokeh_memorial_draw(coordinates)
        cache.set('scripts', Markup(scripts))
        cache.set('div', Markup(div))
    except Exception: 
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        trace_back_string =  traceback.format_exc()    
        cache.set('converted_file', trace_back_string)        
    return render_template('index.html', 
            input_text_file=cache.get('input_file'), 
            output_text_file=cache.get('converted_file'),
            bokeh_head_plot=cache.get('scripts'), 
            bokeh_body_plot=cache.get('div'), 
            input_radio_fmts=cache.get('input_radio_fmts'),
            output_radio_fmts=cache.get('output_radio_fmts'),
            input_options=cache.get('input_options')
        )  


def bokeh_memorial_draw(coordinates):
    """draw with bokeh the coordinates passed as circles
    connected with arrows (according to the their order)
    * returns: div html and script tag for embedding """
    x, y = coordinates[:, 1], coordinates[:, 0]

    TOOLTIPS = [ # allowed hover tooltips
        ("index", "$index"),
        ("(x,y)", "($x, $y)") 
        ]
    p = figure(width=300, height=300, toolbar_location="below",  tooltips=TOOLTIPS,
        tools='box_zoom,pan,save,hover,reset,tap,wheel_zoom')
    
    # relation between number of points and symbols size 
    csize = 11 - len(x)/5  # 15:8, 30:5
    csize = 3 if csize < 3 else csize 
    lw = 0.5 if csize < 4 else 1
    # draw all coordinates as circles 
    p.circle(x, y, fill_color="gray", size=csize, alpha=0.8)
    # add both a line and circles on the same plot
    x0, y0 = x[0], y[0]
    for x, y in zip(x[1:], y[1:]):
        p.add_layout(Arrow(end=NormalHead(fill_color="white", size=csize+1, 
                    fill_alpha=0.2, line_width=lw),
                    x_start=x0, y_start=y0, x_end=x, y_end=y))
        x0, y0 = x, y        
    return components(p) # returns scripts, div


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d','--debug', default=False, action='store_true')    
    args = parser.parse_args()    
    app = get_app()
    app.run(host='0.0.0.0', debug=args.debug)    
    
