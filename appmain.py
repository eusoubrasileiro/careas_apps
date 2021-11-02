from flask import Flask, render_template, request, jsonify
import sys
from poligonal.util import memorialRead, formatMemorial
import json 

from bokeh.plotting import figure
from bokeh.embed import json_item
from bokeh.models import Arrow, NormalHead


app = Flask('careas-tools')

@app.route('/convert', methods=['GET', 'POST'])
def convert():
    if request.method == 'POST':
        #print(request.json.encode('ascii', 'ignore'), file=sys.stdout, flush=True)
        #print(type(request.json), file=sys.stdout, flush=True)
        # Serialize the result, you can add additional fields
        outputfile = u"Insira o arquivo texto de entrada à esquerda"
        try: 
            inputfile = memorialRead(request.json)
            # for plotting memorial 
            coordinates = memorialRead(request.json, decimal=True)
            json_plot = bokeh_memorial_draw(coordinates)
            # output file formatted
            outputfile = formatMemorial(inputfile)
        except Exception as excp: 
            return jsonify(text=str(Exception.__name__), result='failed')
        else:    
            return jsonify(text=outputfile, result='success', json_item=json_plot) 
    return None


def bokeh_memorial_draw(coordinates):
    """draw with bokeh the coordinates passed as circles
    connected with arrows (according to the their order)
    * returns: div html and script tag for embedding """
    x, y = coordinates[:, 1], coordinates[:, 0]
    #output_file("multiple.html")

    TOOLTIPS = [ # allowed hover tooltips
        ("index", "$index"),
        ("(x,y)", "($x, $y)") 
        ]
    p = figure(width=300, height=300, toolbar_location="below",  tooltips=TOOLTIPS,
        tools='box_zoom,pan,save,hover,reset,tap,wheel_zoom')
    # draw all coordinates as circles 
    p.circle(x, y, fill_color="gray", size=8, alpha=0.8)
    #p.line(x, y, line_width=1)    
    # add both a line and circles on the same plot
    x0, y0 = x[0], y[0]
    for x, y in zip(x[1:], y[1:]):
        p.add_layout(Arrow(end=NormalHead(fill_color="white", size=10, 
                    fill_alpha=0.2, line_width=1),
                    x_start=x0, y_start=y0, x_end=x, y_end=y))
        x0, y0 = x, y        
    return json_item(p) # creates a json package w. my plot


# not needed for now
PageState = {} # state dictionary for the page

@app.route('/state', methods=['GET', 'POST'])
def state():
    # if request.method == 'POST':
    #     return jsonify(text=str(Exception.__name__), result='failed')
    # else:
    #     return jsonify(text=outputfile, result='success', json_item=json_plot) 
    return None


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()

# export FLASK_APP=appmain
# run in development
# export FLASK_ENV=development