from flask import Flask, render_template, redirect, request, session, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length

app = Flask(__name__)
app.config['SECRET_KEY'] = 'thismaybeasecret!'


@app.route("/")
def template_test():
    return render_template('layout.html', title='Home')


@app.route("/login")
def login():
    return render_template('login.html', title='Login')


@app.route("/register")
def register():
    return render_template("register.html", title='Register')


@app.route("/profile")
def profile():
    return render_template("profile.html", title='Profile')


@app.route("/about")
def about():
    return render_template("about.html", title='About')


if __name__ == '__main__':
    app.run(debug=True)