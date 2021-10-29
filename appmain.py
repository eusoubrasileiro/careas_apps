from flask import Flask, render_template, request, jsonify
import sys
from poligonal.util import memorialRead, formatMemorial

app = Flask('careas-tools')

@app.route('/convert', methods=['GET', 'POST'])
def convert():
    if request.method == 'POST':
        #print(request.json.encode('ascii', 'ignore'), file=sys.stdout, flush=True)
        #print(type(request.json), file=sys.stdout, flush=True)
        # Serialize the result, you can add additional fields
        outtext = u"Insira o arquivo texto de entrada à esquerda"
        try: 
            intext = memorialRead(request.json)
            outtext = formatMemorial(intext)
        except Exception as excp: 
            return jsonify(text=str(Exception), result='failed') 
        else:    
            return jsonify(text=outtext, result='success')
    return None

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()

# export FLASK_APP=appmain
# run in development
# export FLASK_ENV=development