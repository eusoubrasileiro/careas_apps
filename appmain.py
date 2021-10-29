from flask import Flask, render_template, request, jsonify
import sys

app = Flask("myflaskapp")

@app.route('/convert', methods=['GET', 'POST'])
def convert():
    if request.method == 'POST':
        #print(request.json.encode('ascii', 'ignore'), file=sys.stdout, flush=True)
        #print(type(request.json), file=sys.stdout, flush=True)
        # Serialize the result, you can add additional fields
        outtext = request.json
        return jsonify(text=outtext, result='sucess')
    return None

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()

# export FLASK_APP=appmain
# run in development
# export FLASK_ENV=development