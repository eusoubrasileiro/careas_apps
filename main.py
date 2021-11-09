import sys, traceback, secrets

from flask import (
    Flask, 
    Markup, 
    Response,
    request, 
    redirect,
    render_template
)

# server side session, storing data on server not on cookies 
# https://github.com/pallets-eco/flask-caching
from flask_caching import Cache

from poligonal.util import (
    memorialRead, 
    formatMemorial
)

from bokeh.plotting import figure
from bokeh.embed import components
from bokeh.models import Arrow, NormalHead

app = Flask('careas-tools')
app.config['SECRET_KEY'] = secrets.token_hex(16)
# Flask-Cache package
app.config['CACHE_TYPE'] = 'SimpleCache' # a simple Python dictonary 
app.config['SESSION_PERMANENT'] = False
app.config['CACHE_DEFAULT_TIMEOUT'] = 12*60*60 # 12 hours cache  
cache = Cache(app)

def get_app():
    return app

@app.after_request
def add_header(response):
    response.cache_control.max_age = 60*60*12 # 12 hours cache 
    return response

#### Javascript localSession more or less equivalent  
#### recommended usage is Flask-Cache for a server-side cache
#### since Flask.session is a client side cache with cookies
#### very limitted since creating heavy/huge Cookies (back-forth communication) is not recommended 

def default_values():
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
    cache.set('input_format', 'auto')
    cache.set('scripts', '')
    cache.set('div', '')   
    cache.set('redirect', False) 


@app.route('/')
def index():    
    # if empty cache means first time loaded the page
    if (not cache.get('div')) or (not cache.get('redirect')) : # empty cache not a redirect       
        #print("The cache['div'] is: ", cache.get('div'), file=sys.stderr, flush=True)
        default_values() # initiate the current state of the Page                
        # when the tab, browser is closed the cache is deleted 
    cache.set('redirect', False)    
    return Convertn_Draw()


@app.route('/download', methods=['GET', 'POST'])
def downloadFile ():
    return Response(
        cache.get('converted_file'),
        mimetype="text/csv",
        headers={"Content-disposition":
                 "attachment; filename=SIGAREAS.txt"})


# to avoid f5 form resubmission
# flask solution Flask-Cache with redirect
@app.route('/convert', methods=['POST'])
def convert():
    if request.method == 'POST':
        cache.set('input_file', request.form['input_text'])        
        cache.set('input_format', request.form['input_format']) 
        cache.set('redirect', True)   
         # avoid form resubmission with F5        
    return redirect('/')


def Convertn_Draw():
    """executes 'de facto' file convertion using poligonal package
    also draw the poligon with the bokeh plot"""
    try:
        input_file_rd = memorialRead(cache.get('input_file'), fmt=cache.get('input_format'))
        #print(scripts, div, file=sys.stderr, flush=True)
        # output file formatted        
        cache.set('converted_file', formatMemorial(input_file_rd)) 
        #### for plotting memorial 
        coordinates = memorialRead(cache.get('input_file'), fmt=cache.get('input_format'),
            decimal=True)
        scripts, div = bokeh_memorial_draw(coordinates)
        cache.set('scripts', Markup(scripts))
        cache.set('div', Markup(div))
    except Exception: 
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        trace_back_string =  traceback.format_exc()    
        cache.set('converted_file', trace_back_string)
    return render_template('index.html', input_text_file=cache.get('input_file'), output_text_file=cache.get('converted_file'),
            bokeh_head_plot=cache.get('scripts'), bokeh_body_plot=cache.get('div'))  


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
    # draw all coordinates as circles 
    p.circle(x, y, fill_color="gray", size=8, alpha=0.8)
    # add both a line and circles on the same plot
    x0, y0 = x[0], y[0]
    for x, y in zip(x[1:], y[1:]):
        p.add_layout(Arrow(end=NormalHead(fill_color="white", size=10, 
                    fill_alpha=0.2, line_width=1),
                    x_start=x0, y_start=y0, x_end=x, y_end=y))
        x0, y0 = x, y        
    return components(p) # returns scripts, div


if __name__ == "__main__":
    app = get_app()
    app.run(host='0.0.0.0') # ,debug=True)


