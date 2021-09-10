from flask import jsonify
from werkzeug.exceptions import HTTPException


def handle_exception(e):
    code = 500

    if isinstance(e, HTTPException):
        code = e.code

    return jsonify({"code": code, "description": str(e)}), code
