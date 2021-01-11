from flask import jsonify, make_response
from werkzeug.exceptions import HTTPException


def handle_exception(e):
    if isinstance(e, HTTPException):
        return jsonify({"code": e.code, "name": e.name, "description": e.description})
    code, name, desc = e.args
    return make_response(
        jsonify({"code": code, "name": name, "description": desc}), code
    )
