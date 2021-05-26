from flask import Flask
from reapply_workflows import hello, hello2

from .graphql import init_graphql

app = Flask(__name__)

init_graphql(app)


@app.route("/")
def hello_world():
    return "<p>{} Test {}</p>".format(hello2(), hello())
