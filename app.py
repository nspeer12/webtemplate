from flask import Flask, render_template, request, send_from_directory, redirect, url_for, request
import yaml
import os

app = Flask(__name__, static_folder="static")

@app.route("/")
def index():
	return render_template("index.html", **locals())


if __name__=="__main__":
    app.run(host='0.0.0.0', debug=True, port=8080)
