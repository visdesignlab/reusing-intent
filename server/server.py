import os, sys
sys.path.append('../inference-core')
from flask import Flask
from core import hello
from routes.datasetRoutes import datasetRoute, listAllDatasets
import yaml

app = Flask(__name__)
app.config["DEBUG"] = True
app.register_blueprint(datasetRoute)

@app.route('/')
def index():
    return f"<div>{hello()}<div>"

@app.route('/hello', methods=['GET'])
def helloWorld():
    return hello()

if __name__ == "__main__":
    listAllDatasets()
    app.run()
