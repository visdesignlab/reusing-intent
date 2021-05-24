from flask import Flask
from reapply_workflows import __version__, hello2

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>{}</p>".format(hello2())


if __name__ == '__main__':
  app.run(host='0.0.0.0')
